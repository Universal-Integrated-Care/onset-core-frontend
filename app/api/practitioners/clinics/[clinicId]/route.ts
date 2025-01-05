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
 * Fetch Practitioners by Clinic ID
 */

// app/api/practitioners/clinics/[clinicId]/route.ts

/**
 * @swagger
 * /api/practitioners/clinics/{clinicId}:
 *   get:
 *     tags:
 *       - Practitioners
 *       - Clinics
 *     summary: Fetch practitioners by clinic ID
 *     description: Retrieves all practitioners associated with a specific clinic
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The ID of the clinic to fetch practitioners for
 *     responses:
 *       200:
 *         description: Successfully retrieved practitioners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 practitioners:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier of the practitioner (serialized from BigInt)
 *                       name:
 *                         type: string
 *                         description: Full name of the practitioner
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Email address of the practitioner
 *                       phone:
 *                         type: string
 *                         description: Contact number of the practitioner
 *             example:
 *               practitioners:
 *                 - id: "1"
 *                   name: "Dr. John Smith"
 *                   email: "john.smith@clinic.com"
 *                   phone: "+61412345678"
 *                 - id: "2"
 *                   name: "Dr. Sarah Johnson"
 *                   email: "sarah.johnson@clinic.com"
 *                   phone: "+61423456789"
 *       400:
 *         description: Invalid clinic ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid or missing Clinic ID."
 *       404:
 *         description: No practitioners found for the clinic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No practitioners found for this clinic."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error while fetching practitioners."
 */


/**
 * Fetch Clinic by ID
 */
export async function GET(req: NextRequest, props: ClinicApiProps) {
  try {
    // ✅ Resolve params promise
    const { clinicId } = await props.params;

    console.log("🏥 Clinic ID from params:", clinicId);

    if (!clinicId || isNaN(clinicId) || clinicId <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing Clinic ID." },
        { status: 400 },
      );
    }

    // ✅ Fetch practitioners associated with the clinic
    const practitioners = await prisma.practitioners.findMany({
      where: {
        clinic_id: clinicId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    console.log("📊 Fetched Practitioners (Raw):", practitioners);

    if (!practitioners.length) {
      return NextResponse.json(
        { error: "No practitioners found for this clinic." },
        { status: 404 },
      );
    }

    // ✅ Serialize BigInt fields
    const serializedPractitioners = serializeBigInt(practitioners);

    console.log("📊 Serialized Practitioners:", serializedPractitioners);

    return NextResponse.json({ practitioners: serializedPractitioners });
  } catch (error) {
    console.error("❌ Error fetching practitioners:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching practitioners." },
      { status: 500 },
    );
  }
}
