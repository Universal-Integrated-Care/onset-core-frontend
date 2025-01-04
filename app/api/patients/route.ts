import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import { getSession } from "@/lib/session";

/**
 * ✅ Fetch Patients for the User's Clinic
 */

// app/api/patients/route.ts

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Fetch patients for authenticated user's clinic
 *     description: Retrieves all patients associated with the clinic of the currently authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The patient's unique identifier
 *                       first_name:
 *                         type: string
 *                         description: Patient's first name
 *                       last_name:
 *                         type: string
 *                         description: Patient's last name
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Patient's email address
 *                       phone:
 *                         type: string
 *                         description: Patient's contact number
 *                       patient_type:
 *                         type: string
 *                         description: Type or category of patient
 *                       medicare_number:
 *                         type: string
 *                         description: Patient's Medicare number
 *                       medicare_expiry:
 *                         type: string
 *                         format: date
 *                         description: Medicare card expiry date
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of when the patient was created
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of last update to patient record
 *       401:
 *         description: Authentication required or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized. Please log in."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch patients."
 * components:
 *   securitySchemes:
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: session
 *       description: Session-based authentication
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ Validate Session
    const session = await getSession(req);
    if (!session || !session.user || !session.user.clinic_id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const userClinicId = session.user.clinic_id;

    // ✅ Fetch Patients by Clinic ID
    const patients = await prisma.patients.findMany({
      where: {
        clinic_id: BigInt(userClinicId),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        patient_type: true,
        medicare_number: true,
        medicare_expiry: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ patients: serializeBigInt(patients) });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error fetching patients:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch patients." },
      { status: 500 },
    );
  }
}
