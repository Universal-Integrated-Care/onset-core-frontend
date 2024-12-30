import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import {
  validateRequiredFields,
  validateEntities,
  checkDuplicateAppointment,
  validatePractitionerAvailability,
  updatePractitionerAvailability,
  createAppointment,
  validatePatientPractitionerClinicAssociation,
  fetchAppointmentDetails,
} from "@/lib/appointmentUtils";

import {
  calculateAppointmentEndTime,
  validateISODateTime,
  getDayOfWeekEnum,
  convertToMelbourneTime,
  extractDateFromMelbourneTime,
} from "@/lib/utils";

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

/**
 * Main POST Function
 */
export async function POST(req: NextRequest) {
  const db = prisma;

  try {
    const body = await req.json();
    const {
      patient_id,
      clinic_id,
      practitioner_id,
      appointment_start_datetime: original_appointment_start_datetime,
      duration,
    } = body;

    // Step 1: Validate required fields
    await validateRequiredFields(body);

    //Step 2: Validate ISO Datetime
    await validateISODateTime(original_appointment_start_datetime);

    //Step 4: Calculate appointment end datetime
    const appointment_end_datetime = await calculateAppointmentEndTime(
      original_appointment_start_datetime,
      duration,
    );

    // ✅ Step 5: Convert appointment_start_datetime to Melbourne Time
    const appointment_start_datetime = await convertToMelbourneTime(
      original_appointment_start_datetime,
    );

    // ✅ Step 6: Extract date from Melbourne Time
    const appointment_date = await extractDateFromMelbourneTime(
      appointment_start_datetime,
    );

    // ✅ Step 7: Validate Day of Week Enum
    const dayOfWeekEnum = getDayOfWeekEnum(appointment_start_datetime);

    console.log("📅 Appointment Date:", appointment_date);
    console.log("🕒 Appointment Start Time:", appointment_start_datetime);
    console.log("🕒 Appointment End Time:", appointment_end_datetime);
    console.log("📅 Day of the Week:", dayOfWeekEnum);

    // ✅ Wrap booking logic in a transaction
    const appointment = await db.$transaction(async (prisma) => {
      // Step 2: Validate entities
      await validateEntities(prisma, patient_id, clinic_id, practitioner_id);

      // Step 3: Check for duplicate appointments
      await checkDuplicateAppointment(
        prisma,
        patient_id,
        clinic_id,
        appointment_start_datetime,
      );

      // Step 4: Validate Practitioner Availability
      await validatePractitionerAvailability(
        prisma,
        practitioner_id,
        appointment_start_datetime,
        appointment_end_datetime,
        appointment_date,
        dayOfWeekEnum,
        duration,
      );
      // Step 5: Validate Practitioner and patient in Same clinic
      await validatePatientPractitionerClinicAssociation(
        db,
        patient_id,
        practitioner_id,
        clinic_id,
      );

      // Step 5: Update Practitioner Availability
      await updatePractitionerAvailability(
        prisma,
        practitioner_id,
        clinic_id,
        appointment_start_datetime,
        appointment_end_datetime,
      );

      // Step 6: Create the appointment
      return await createAppointment(
        prisma,
        body,
        practitioner_id,
        appointment_start_datetime,
      );
    });

    // Step 7: Fetch detailed appointment
    const mappedAppointment = await fetchAppointmentDetails(db, appointment.id);

    // Step 8: Serialize appointment data
    const serializedAppointment = serializeBigInt(mappedAppointment);

    console.log("✅ Serialized Appointment Data:", serializedAppointment);

    return NextResponse.json(
      {
        message: "Your appointment has been successfully created!",
        appointment: serializedAppointment,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ Error creating appointment:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 400 },
    );
  } finally {
    await db.$disconnect();
  }
}
