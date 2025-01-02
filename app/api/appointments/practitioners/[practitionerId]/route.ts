import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Fetch Appointments by Practitioner ID
 */
// app/api/appointments/practitioners/[practitionerId]/route.ts

/**
 * @swagger
 * /api/appointments/practitioners/{practitionerId}:
 *   get:
 *     tags:
 *       - Appointments
 *       - Practitioners
 *     summary: Fetch appointments by practitioner ID
 *     description: Retrieves all appointments for a specific practitioner including patient details
 *     parameters:
 *       - in: path
 *         name: practitionerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the practitioner to fetch appointments for
 *     responses:
 *       200:
 *         description: Successfully retrieved appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Appointment ID
 *                       patient_id:
 *                         type: string
 *                         description: ID of the patient
 *                       appointment_start_datetime:
 *                         type: string
 *                         format: date-time
 *                         description: Start time of the appointment
 *                         example: "2024-01-02T09:00:00Z"
 *                       duration:
 *                         type: integer
 *                         description: Duration of the appointment in minutes
 *                         example: 30
 *                       status:
 *                         type: string
 *                         description: Current status of the appointment
 *                         example: "scheduled"
 *                       patient_name:
 *                         type: string
 *                         description: Full name of the patient
 *                         example: "John Doe"
 *       400:
 *         description: Invalid or missing practitioner ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Practitioner ID is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching appointments."
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
