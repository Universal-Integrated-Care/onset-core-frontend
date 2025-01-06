import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import { ClinicUserIdApiProps } from "@/types/api";

/**
 * Fetch Clinic Details by User ID
 */
// app/api/clinics/[userId]/route.ts

/**
 * @swagger
 * /api/clinics/{userId}:
 *   get:
 *     tags:
 *       - Clinics
 *       - Users
 *     summary: Fetch clinic details by user ID
 *     description: Retrieves clinic information, including associated patients and practitioners, for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to fetch clinic details for
 *     responses:
 *       200:
 *         description: Successfully retrieved clinic details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clinic:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The clinic's ID
 *                     name:
 *                       type: string
 *                       description: Name of the clinic
 *                     address:
 *                       type: string
 *                       description: Physical address of the clinic
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Contact email for the clinic
 *                     phone:
 *                       type: string
 *                       description: Contact phone number
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Clinic creation timestamp
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                     patients:
 *                       type: array
 *                       description: List of patients associated with the clinic
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Patient ID
 *                           first_name:
 *                             type: string
 *                             description: Patient's first name
 *                           last_name:
 *                             type: string
 *                             description: Patient's last name
 *                           email:
 *                             type: string
 *                             format: email
 *                             description: Patient's email address
 *                           phone:
 *                             type: string
 *                             description: Patient's contact number
 *                     practitioners:
 *                       type: array
 *                       description: List of practitioners working at the clinic
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: Practitioner ID
 *                           name:
 *                             type: string
 *                             description: Practitioner's full name
 *                           email:
 *                             type: string
 *                             format: email
 *                             description: Practitioner's email address
 *                           phone:
 *                             type: string
 *                             description: Practitioner's contact number
 *       400:
 *         description: Invalid user ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing User ID."
 *       404:
 *         description: No clinic found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Clinic not found for this user."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching clinic details."
 */

/**
 * Fetch User by ID
 */
export async function GET(req: NextRequest, props: ClinicUserIdApiProps) {
  try {
    // ✅ Resolve params promise
    const { userId } = await props.params;

    console.log("🏥 User ID from params:", userId);

    if (!userId || isNaN(Number(userId)) || Number(userId) <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing User ID." },
        { status: 400 },
      );
    }

    // ✅ Fetch clinic associated with the user
    const clinic = await prisma.clinics.findFirst({
      where: {
        users: {
          some: { id: Number(userId) },
        },
      },
      include: {
        patients: true,
        practitioners: true,
      },
    });

    console.log("📊 Fetched Clinic (Raw):", clinic);

    if (!clinic) {
      return NextResponse.json(
        { error: "Clinic not found for this user." },
        { status: 404 },
      );
    }

    // ✅ Serialize BigInt fields
    const serializedClinic = serializeBigInt(clinic);

    console.log("📊 Serialized Clinic Details:", serializedClinic);

    return NextResponse.json({ clinic: serializedClinic });
  } catch (error) {
    console.error("❌ Error fetching clinic details:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching clinic details." },
      { status: 500 },
    );
  }
}
