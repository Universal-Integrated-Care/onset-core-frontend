import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Fetch Appointments by Practitioner ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { practitionerId: string } },
) {
  try {
    const { practitionerId } = await params;

    console.log("🔍 Practitioner ID from Params:", practitionerId);

    if (!practitionerId) {
      return NextResponse.json(
        { error: "Practitioner ID is required" },
        { status: 400 },
      );
    }

    const appointments = await prisma.patient_appointments.findMany({
      where: { practitioner_id: Number(practitionerId) },
      include: {
        patients: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    const serializedAppointments = appointments.map((appt) => ({
      id: appt.id,
      patient_id: appt.patient_id,
      appointment_start_datetime:
        appt.appointment_start_datetime?.toISOString(),
      duration: appt.duration,
      status: appt.status,
      patient_name: `${appt.patients?.first_name || ""} ${
        appt.patients?.last_name || ""
      }`,
    }));

    return NextResponse.json({
      appointments: serializeBigInt(serializedAppointments),
    });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching appointments." },
      { status: 500 },
    );
  }
}
