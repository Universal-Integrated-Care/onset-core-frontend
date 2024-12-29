import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Fetch Appointments by Clinic ID with Patient & Practitioner Details
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ Extract clinicId from query parameters
    const clinicId = req.nextUrl.searchParams.get("clinicId");

    console.log("🏥 Clinic ID from query:", clinicId);

    if (!clinicId) {
      return NextResponse.json(
        { error: "Clinic ID is required." },
        { status: 400 },
      );
    }

    const clinicIdNumber = Number(clinicId);

    if (isNaN(clinicIdNumber) || clinicIdNumber <= 0) {
      return NextResponse.json(
        { error: "Invalid Clinic ID provided." },
        { status: 400 },
      );
    }

    // ✅ Fetch appointments with related patient and practitioner details
    const appointments = await prisma.patient_appointments.findMany({
      where: { clinic_id: clinicIdNumber },
      orderBy: { appointment_start_datetime: "desc" },
      include: {
        patients: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        practitioners: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log("📊 Fetched Appointments (Raw):", appointments);

    // ✅ Map the data to include names and ensure appointment_start_datetime is serialized
    const mappedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      patient_id: appointment.patients?.id || null, // Include patient_id
      patient: appointment.patients
        ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
        : "Unknown Patient",
      practitioner: appointment.practitioners
        ? appointment.practitioners.name
        : "Unknown Practitioner",
      clinic_id: appointment.clinic_id,
      appointment_start_datetime: appointment.appointment_start_datetime
        ? appointment.appointment_start_datetime.toISOString()
        : null, // Ensure datetime is serialized as ISO string
      duration: appointment.duration,
      status: appointment.status,
      appointment_context: appointment.appointment_context,
      created_at: appointment.created_at.toISOString(), // Ensure datetime is serialized
      updated_at: appointment.updated_at.toISOString(), // Ensure datetime is serialized
    }));

    // ✅ Serialize serializeBigInt fields
    const serializedAppointments = serializeBigInt(mappedAppointments);
    console.log(
      "📊 Serialized Appointments with Names:",
      serializedAppointments,
    );

    return NextResponse.json({ appointments: serializedAppointments });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching appointments." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const db = prisma;

  try {
    // ✅ Parse the incoming JSON body
    const body = await req.json();

    const {
      patient_id,
      clinic_id,
      practitioner_id,
      appointment_start_datetime,
      duration,
      appointment_context,
      status = "PENDING", // Default status
    } = body;

    console.log("📥 Received Data:", body);

    // ✅ Validate Required Fields
    if (!patient_id || !clinic_id || !appointment_start_datetime || !duration) {
      return NextResponse.json(
        {
          error:
            "Please ensure all required fields are provided: patient, clinic, appointment date & time, and duration.",
        },
        { status: 400 },
      );
    }

    // ✅ Validate Appointment Status Enum
    if (!["SCHEDULED", "CANCELLED", "PENDING"].includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid appointment status. Please choose between 'SCHEDULED', 'CANCELLED', or 'PENDING'.",
        },
        { status: 400 },
      );
    }

    // ✅ Batch Validation: Check if Patient, Clinic, and Practitioner exist
    console.log("🔍 Validating patient, clinic, and practitioner IDs...");

    const [patient, clinic, practitioner] = await Promise.all([
      db.patients.findUnique({ where: { id: serializeBigInt(patient_id) } }),
      db.clinics.findUnique({ where: { id: serializeBigInt(clinic_id) } }),
      practitioner_id
        ? db.practitioners.findUnique({
            where: { id: serializeBigInt(practitioner_id) },
          })
        : Promise.resolve(null),
    ]);
    const isPatientRegistered = await db.patients.findFirst({
      where: {
        id: serializeBigInt(patient_id),
        clinic_id: serializeBigInt(clinic_id),
      },
    });

    if (!isPatientRegistered) {
      return NextResponse.json(
        {
          error: `The selected patient (ID: ${patient_id}) is not registered with the specified clinic (ID: ${clinic_id}). Please register the patient first.`,
        },
        { status: 400 },
      );
    }

    console.log("✅ Patient is registered with the clinic.");

    if (!patient) {
      return NextResponse.json(
        {
          error: `The patient ID ${patient_id} does not exist. Please provide a valid patient ID.`,
        },
        { status: 400 },
      );
    }

    if (!clinic) {
      return NextResponse.json(
        {
          error: `The clinic ID ${clinic_id} is not valid. Please check and try again.`,
        },
        { status: 400 },
      );
    }

    if (practitioner_id && !practitioner) {
      return NextResponse.json(
        {
          error: `The practitioner ID ${practitioner_id} does not match any record. Please verify the ID.`,
        },
        { status: 400 },
      );
    }

    console.log("✅ Validation successful: IDs are valid.");

    // ✅ Check for Duplicate Appointment
    console.log("🔍 Checking for duplicate appointments...");
    const existingAppointment = await db.patient_appointments.findFirst({
      where: {
        patient_id: serializeBigInt(patient_id),
        clinic_id: serializeBigInt(clinic_id),
        appointment_start_datetime: new Date(appointment_start_datetime),
      },
    });

    if (existingAppointment) {
      return NextResponse.json(
        {
          error: `An appointment already exists for the selected patient at this clinic on ${appointment_start_datetime}. Please choose a different time slot.`,
        },
        { status: 400 },
      );
    }

    console.log("✅ No duplicate appointment found. Proceeding with creation.");

    // ✅ Create Appointment
    console.log("🛠️ Creating appointment...");
    const appointment = await db.patient_appointments.create({
      data: {
        patient_id: serializeBigInt(patient_id),
        clinic_id: serializeBigInt(clinic_id),
        practitioner_id: practitioner_id
          ? serializeBigInt(practitioner_id)
          : null,
        appointment_start_datetime: new Date(appointment_start_datetime),
        duration: Number(duration),
        status,
        appointment_context: appointment_context || null,
      },
    });

    console.log("✅ Appointment Created:", appointment);

    // ✅ Fetch Detailed Appointment with Relational Data
    console.log("🔍 Fetching detailed appointment information...");
    const detailedAppointment = await db.patient_appointments.findUnique({
      where: { id: appointment.id },
      include: {
        patients: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
        practitioners: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!detailedAppointment) {
      throw new Error("Failed to retrieve appointment details after creation.");
    }

    // ✅ Map and serialize the detailed appointment data
    const mappedAppointment = {
      id: detailedAppointment.id,
      patient_id: detailedAppointment.patients?.id || null,
      patient: detailedAppointment.patients
        ? `${detailedAppointment.patients.first_name} ${detailedAppointment.patients.last_name}`
        : "Unknown Patient",
      practitioner: detailedAppointment.practitioners
        ? detailedAppointment.practitioners.name
        : "Unknown Practitioner",
      clinic_id: detailedAppointment.clinic_id,
      appointment_start_datetime: detailedAppointment.appointment_start_datetime
        ? detailedAppointment.appointment_start_datetime.toISOString()
        : null,
      duration: detailedAppointment.duration,
      status: detailedAppointment.status,
      appointment_context: detailedAppointment.appointment_context,
      created_at: detailedAppointment.created_at.toISOString(),
      updated_at: detailedAppointment.updated_at.toISOString(),
    };

    // ✅ Serialize serializeBigInt fields
    const serializedAppointment = serializeBigInt(mappedAppointment);
    console.log("🔄 Serialized Appointment Data:", serializedAppointment);

    // ✅ Emit event via Socket.IO
    if ((global as any).io) {
      (global as any).io.emit("new_appointment", serializedAppointment);
      console.log("📢 Emitted 'new_appointment' event via Socket.IO");
    } else {
      console.warn(
        "⚠️ Real-time updates are unavailable. Socket.IO is not configured properly.",
      );
    }

    return NextResponse.json(
      {
        message: "Your appointment has been successfully created!",
        appointment: serializedAppointment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    await db.$disconnect();
    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your appointment. Please try again later.",
      },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}
