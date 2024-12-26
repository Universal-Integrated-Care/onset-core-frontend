"use server";
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
 * Fetch Appointment by ID with Patient & Practitioner Details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // ✅ Extract appointmentId from params
    const { id } = await params;
    const appointmentId = Number(id);

    console.log("📅 Appointment ID from params:", appointmentId);

    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing Appointment ID." },
        { status: 400 },
      );
    }

    // ✅ Fetch appointment with related patient and practitioner details
    const appointment = await prisma.patient_appointments.findUnique({
      where: { id: appointmentId },
      include: {
        patients: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            patient_context: true,
          },
        },
        practitioners: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log("📊 Fetched Appointment (Raw):", appointment);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found." },
        { status: 404 },
      );
    }

    // ✅ Map the data and serialize fields
    const mappedAppointment = {
      id: appointment.id,
      patient_id: appointment.patient_id,
      clinic_id: appointment.clinic_id,
      practitioner_id: appointment.practitioner_id,
      appointment_start_datetime: appointment.appointment_start_datetime
        ? appointment.appointment_start_datetime.toISOString()
        : null,
      duration: appointment.duration,
      status: appointment.status,
      appointment_context: appointment.appointment_context,
      created_at: appointment.created_at.toISOString(),
      updated_at: appointment.updated_at.toISOString(),
      patient: appointment.patients
        ? {
            id: appointment.patients.id,
            name: `${appointment.patients.first_name} ${appointment.patients.last_name}`,
            email: appointment.patients.email,
            phone: appointment.patients.phone,
            context: appointment.patients.patient_context,
          }
        : null,
      practitioner: appointment.practitioners
        ? {
            id: appointment.practitioners.id,
            name: appointment.practitioners.name,
            email: appointment.practitioners.email,
            phone: appointment.practitioners.phone,
          }
        : null,
    };

    // ✅ Serialize BigInt fields
    const serializedAppointment = serializeBigInt(mappedAppointment);
    console.log(
      "📊 Serialized Appointment with Details:",
      serializedAppointment,
    );

    return NextResponse.json({ appointment: serializedAppointment });
  } catch (error) {
    console.error("❌ Error fetching appointment details:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching appointment details." },
      { status: 500 },
    );
  }
}

/**
 * Update Appointment by ID
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // ✅ Extract appointmentId from params
    const appointmentId = Number(params?.id);

    console.log("🛠️ Updating Appointment ID:", appointmentId);

    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing Appointment ID." },
        { status: 400 },
      );
    }

    // ✅ Parse Request Body
    const body = await req.json();

    // ✅ Update Appointment Details
    const updatedAppointment = await prisma.patient_appointments.update({
      where: { id: appointmentId },
      data: {
        practitioner_id: body.practitioner_id,
        appointment_start_datetime: body.Schedule,
        appointment_context: body.appointment_context,
        status: body.status || "PENDING", // Default status
      },
    });

    console.log("✅ Updated Appointment:", updatedAppointment);

    // ✅ Serialize and Return Response
    const serializedAppointment = serializeBigInt(updatedAppointment);

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment: serializedAppointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error while updating appointment." },
      { status: 500 },
    );
  }
}
