import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// app/api/practitioners/enums/route.ts

// app/api/practitioners/meta/route.ts

/**
 * @swagger
 * /api/practitioners/meta:
 *   get:
 *     tags:
 *       - Practitioners
 *       - Enums
 *     summary: Fetch practitioner type and specialization enums
 *     description: |
 *       Retrieves all available enum values for practitioner types and specializations
 *       from the PostgreSQL database. These values are used for practitioner
 *       categorization and specialization selection.
 *     responses:
 *       200:
 *         description: Successfully retrieved enum values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 practitionerTypes:
 *                   type: array
 *                   description: List of available practitioner types
 *                   items:
 *                     type: string
 *                   example: ["DOCTOR", "NURSE", "SPECIALIST", "THERAPIST"]
 *                 specializations:
 *                   type: array
 *                   description: List of available specializations
 *                   items:
 *                     type: string
 *                   example: ["GENERAL_PRACTICE", "PEDIATRICS", "CARDIOLOGY", "DERMATOLOGY"]
 *             example:
 *               practitionerTypes: ["DOCTOR", "NURSE", "SPECIALIST", "THERAPIST"]
 *               specializations: ["GENERAL_PRACTICE", "PEDIATRICS", "CARDIOLOGY", "DERMATOLOGY"]
 *       500:
 *         description: Server error while fetching enum values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch enum values."
 */

interface PractitionerType {
  enumlabel: string; // Define the structure
}

interface Specialization {
  enumlabel: string; // Define the structure
}

export async function GET() {
  try {
    // Fetch practitionertype enum values
    const practitionerTypes = await prisma.$queryRaw<
      { enumlabel: string }[]
    >`SELECT enumlabel FROM pg_enum WHERE enumtypid = 'practitionertype'::regtype`;

    // Fetch specialization enum values
    const specializations = await prisma.$queryRaw<
      { enumlabel: string }[]
    >`SELECT enumlabel FROM pg_enum WHERE enumtypid = 'specialization'::regtype`;

    return NextResponse.json({
      practitionerTypes: practitionerTypes.map(
        (t: PractitionerType) => t.enumlabel,
      ),
      specializations: specializations.map((s: Specialization) => s.enumlabel),
    });
  } catch (error: Error | unknown) {
    console.error(
      "❌ Error fetching enum values:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json(
      { error: "Failed to fetch enum values." },
      { status: 500 },
    );
  }
}
