"use server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
/**
 * Fetch Appointment by ID with Patient & Practitioner Details
 */

// app/api/appointments/[id]/route.ts

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags:
 *       - Appointments
 *     summary: Fetch appointment by ID
 *     description: Retrieves detailed information about a specific appointment including patient and practitioner details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the appointment to fetch
 *     responses:
 *       200:
 *         description: Successfully retrieved appointment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Appointment ID
 *                     patient_id:
 *                       type: string
 *                       description: Patient ID
 *                     clinic_id:
 *                       type: integer
 *                       description: Clinic ID
 *                     practitioner_id:
 *                       type: string
 *                       description: Practitioner ID
 *                     appointment_start_datetime:
 *                       type: string
 *                       format: date-time
 *                       description: Start time of the appointment
 *                     duration:
 *                       type: integer
 *                       description: Duration in minutes
 *                     status:
 *                       type: string
 *                       description: Current status of the appointment
 *                     appointment_context:
 *                       type: string
 *                       description: Additional context about the appointment
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     patient:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Patient's ID
 *                         name:
 *                           type: string
 *                           description: Patient's full name
 *                         email:
 *                           type: string
 *                           format: email
 *                         phone:
 *                           type: string
 *                         context:
 *                           type: string
 *                           description: Patient's medical context
 *                     practitioner:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: Practitioner's ID
 *                         name:
 *                           type: string
 *                           description: Practitioner's name
 *                         email:
 *                           type: string
 *                           format: email
 *                         phone:
 *                           type: string
 *       400:
 *         description: Invalid appointment ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing Appointment ID."
 *       404:
 *         description: Appointment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Appointment not found."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *   put:
 *     tags:
 *       - Appointments
 *     summary: Update appointment by ID
 *     description: Updates an existing appointment with new details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the appointment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               practitioner_id:
 *                 type: string
 *                 description: ID of the practitioner
 *               Schedule:
 *                 type: string
 *                 format: date-time
 *                 description: New appointment start time
 *               appointment_context:
 *                 type: string
 *                 description: Updated context for the appointment
 *               status:
 *                 type: string
 *                 description: Updated appointment status
 *                 default: "PENDING"
 *     responses:
 *       200:
 *         description: Appointment successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment updated successfully"
 *                 appointment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     practitioner_id:
 *                       type: string
 *                     appointment_start_datetime:
 *                       type: string
 *                       format: date-time
 *                     appointment_context:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         description: Invalid appointment ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing Appointment ID."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while updating appointment."
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
