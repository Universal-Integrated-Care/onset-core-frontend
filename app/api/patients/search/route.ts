"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * @swagger
 * /api/patients/search:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Search for a patient by phone number
 *     description: Retrieves patient information using their phone number
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient's phone number
 *     responses:
 *       200:
 *         description: Successfully retrieved patient information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Patient found successfully."
 *                 patient:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Unique identifier for the patient
 *                     clinic_id:
 *                       type: string
 *                       description: ID of the associated clinic
 *                     first_name:
 *                       type: string
 *                       description: Patient's first name
 *                     last_name:
 *                       type: string
 *                       description: Patient's last name
 *                     patient_type:
 *                       type: string
 *                       enum: [EXISTING, NEW]
 *                       description: Type of patient
 *                     medicare_number:
 *                       type: string
 *                       nullable: true
 *                       description: Medicare number if available
 *                     medicare_expiry:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       description: Medicare expiry date
 *                     email:
 *                       type: string
 *                       description: Patient's email address
 *                     phone:
 *                       type: string
 *                       description: Patient's phone number
 *                     patient_context:
 *                       type: string
 *                       nullable: true
 *                       description: Additional context about the patient
 *             example:
 *               message: "Patient found successfully."
 *               patient:
 *                 id: "1"
 *                 clinic_id: "1"
 *                 first_name: "John"
 *                 last_name: "Doe"
 *                 patient_type: "EXISTING"
 *                 medicare_number: "1234567890"
 *                 medicare_expiry: "2025-12-31"
 *                 email: "john.doe@example.com"
 *                 phone: "+61412345678"
 *                 patient_context: "Regular checkup patient"
 *       400:
 *         description: Invalid or missing phone number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Phone number is required."
 *       404:
 *         description: Patient not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No patient found with the provided phone number."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to search for patient. Please try again later."
 */
export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 },
      );
    }

    console.log("📱 Searching for patient with phone number:", phone);

    const patient = await prisma.patients.findFirst({
      where: {
        phone: phone,
      },
      include: {
        clinics: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
        patient_appointments: {
          orderBy: {
            appointment_start_datetime: "desc",
          },
          take: 5, // Get last 5 appointments
          select: {
            appointment_start_datetime: true,
            status: true,
            appointment_context: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "No patient found with the provided phone number." },
        { status: 404 },
      );
    }

    console.log("✅ Patient found:", patient);

    // Serialize the response to handle BigInt values
    return new NextResponse(
      JSON.stringify(
        serializeBigInt({
          message: "Patient found successfully.",
          patient: {
            id: patient.id,
            clinic_id: patient.clinic_id,
            first_name: patient.first_name,
            last_name: patient.last_name,
            patient_type: patient.patient_type,
            medicare_number: patient.medicare_number,
            medicare_expiry: patient.medicare_expiry,
            email: patient.email,
            phone: patient.phone,
            patient_context: patient.patient_context,
            clinic: patient.clinics,
            recent_appointments: patient.patient_appointments,
          },
        }),
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ Error searching for patient:", error);
    return NextResponse.json(
      { error: "Failed to search for patient. Please try again later." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
