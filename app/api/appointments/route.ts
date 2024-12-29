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

    // ✅ Serialize BigInt fields
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

/**
 * Create an Appointment
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Parse the incoming JSON body
    const body = await req.json();

    const {
      patient_id,
      clinic_id,
      practitioner_id,
      appointment_start_datetime,
      duration,
      status,
      appointment_context,
    } = body;

    console.log("📥 Received Data:", body);

    // ✅ Validate Required Fields
    if (
      !patient_id ||
      !clinic_id ||
      !appointment_start_datetime ||
      !duration ||
      !status
    ) {
      return NextResponse.json(
        { error: "Required fields are missing." },
        { status: 400 },
      );
    }

    // ✅ Validate Appointment Status Enum
    if (!["SCHEDULED", "CANCELLED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 },
      );
    }

    // ✅ Create Appointment
    const appointment = await prisma.patient_appointments.create({
      data: {
        patient_id: BigInt(patient_id),
        clinic_id: BigInt(clinic_id),
        practitioner_id: practitioner_id ? BigInt(practitioner_id) : null,
        appointment_start_datetime: new Date(appointment_start_datetime),
        duration: Number(duration),
        status,
        appointment_context: appointment_context || null,
      },
    });

    console.log("✅ Appointment Created:", appointment);

    // ✅ Serialize BigInt fields
    const serializedAppointment = serializeBigInt(appointment);
    console.log("🔄 Serialized Appointment Data:", serializedAppointment);

    return NextResponse.json(
      {
        message: "Appointment created successfully.",
        appointment: serializedAppointment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error while creating appointment." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
