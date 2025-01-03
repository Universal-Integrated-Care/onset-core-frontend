import { NextRequest, NextResponse } from "next/server";
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
export async function GET(req: NextRequest) {
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
      practitionerTypes: practitionerTypes.map((t) => t.enumlabel),
      specializations: specializations.map((s) => s.enumlabel),
    });
  } catch (error: any) {
    console.error("❌ Error fetching enum values:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch enum values." },
      { status: 500 },
    );
  }
}
