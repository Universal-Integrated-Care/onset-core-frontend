import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Helper Function to Convert BigInt to Number in Objects
 */
function serializeBigInt(obj: any): any {
  if (typeof obj === "bigint") {
    return Number(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)]),
    );
  }
  return obj;
}

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
