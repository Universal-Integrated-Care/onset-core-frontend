import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import { getSession } from "@/lib/session";

/**
 * Fetch practitioners for the user's clinic only
 */

// app/api/practitioners/route.ts

/**
 * @swagger
 * /api/practitioners:
 *   get:
 *     tags:
 *       - Practitioners
 *     summary: Fetch practitioners for authenticated user's clinic
 *     description: Retrieves all practitioners associated with the clinic of the currently authenticated user
 *     security:
 *       - sessionAuth: []
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
 *                         description: Practitioner's unique identifier
 *                       name:
 *                         type: string
 *                         description: Full name of the practitioner
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Email address
 *                       phone:
 *                         type: string
 *                         description: Contact number
 *                       specialization:
 *                         type: array
 *                         items:
 *                           type: string
 *                         description: List of specializations
 *                       practitioner_type:
 *                         type: string
 *                         description: Type of practitioner
 *                       clinic_id:
 *                         type: string
 *                         description: Associated clinic ID
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized. Please log in."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch practitioners."
 *   post:
 *     tags:
 *       - Practitioners
 *     summary: Add a new practitioner
 *     description: Creates a new practitioner with validation for unique email and phone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - clinic_id
 *               - practitioner_type
 *               - specialization
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the practitioner
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address (must be unique)
 *               phone:
 *                 type: string
 *                 description: Contact number (must be unique)
 *               clinic_id:
 *                 type: integer
 *                 description: ID of the associated clinic
 *               practitioner_type:
 *                 type: string
 *                 description: Type of practitioner
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of specializations
 *               bio:
 *                 type: string
 *                 nullable: true
 *                 description: Practitioner's biography
 *               practitioner_image_url:
 *                 type: string
 *                 nullable: true
 *                 description: URL to practitioner's image
 *     responses:
 *       201:
 *         description: Practitioner successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Practitioner added successfully."
 *                 practitioner:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     clinic_id:
 *                       type: string
 *                     practitioner_type:
 *                       type: string
 *                     specialization:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid request or duplicate entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     missingFields: "All fields (name, email, phone, clinic_id, practitioner_type, specialization) are required."
 *                     duplicateEmail: "A practitioner with this email already exists."
 *                     duplicatePhone: "A practitioner with this phone number already exists."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: object
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

    // ✅ Fetch Practitioners by Clinic ID
    const practitioners = await prisma.practitioners.findMany({
      where: {
        clinic_id: userClinicId, // Enforces clinic-specific data
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        practitioner_type: true,
        clinic_id: true,
      },
    });

    return NextResponse.json({ practitioners: serializeBigInt(practitioners) });
  } catch (error: Error | unknown) {
    console.error(
      "❌ Error fetching practitioners:",
      error instanceof Error ? error.message : error,
    );
    return NextResponse.json(
      { error: "Failed to fetch practitioners." },
      { status: 500 },
    );
  }
}
/**
 * Add a new Practitioner
 */
export async function POST(req: NextRequest) {
  try {
    // ✅ Parse request body
    const body = await req.json();
    const {
      name,
      email,
      phone,
      clinic_id,
      practitioner_type,
      specialization,
      bio,
      practitioner_image_url,
    } = body;

    console.log("🛠️ Incoming Payload:", {
      name,
      email,
      phone,
      clinic_id,
      practitioner_type,
      specialization,
      bio,
      practitioner_image_url,
    });

    // ✅ Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !clinic_id ||
      !practitioner_type ||
      !specialization
    ) {
      console.error("❌ Validation Error: Missing Required Fields");
      return NextResponse.json(
        {
          error:
            "All fields (name, email, phone, clinic_id, practitioner_type, specialization) are required.",
        },
        { status: 400 },
      );
    }

    // ✅ Check if email already exists
    const existingByEmail = await prisma.practitioners.findFirst({
      where: { email },
    });
    if (existingByEmail) {
      console.error("❌ Duplicate Email:", email);
      return NextResponse.json(
        { error: "A practitioner with this email already exists." },
        { status: 400 },
      );
    }

    // ✅ Check if phone already exists
    const existingByPhone = await prisma.practitioners.findFirst({
      where: { phone },
    });
    if (existingByPhone) {
      console.error("❌ Duplicate Phone:", phone);
      return NextResponse.json(
        { error: "A practitioner with this phone number already exists." },
        { status: 400 },
      );
    }

    // ✅ Ensure specialization is properly formatted
    const specializationArray = Array.isArray(specialization)
      ? specialization
      : specialization
        ? [specialization]
        : [];

    console.log("🔄 Processed Specialization Array:", specializationArray);

    // ✅ Create a new practitioner
    const newPractitioner = await prisma.practitioners.create({
      data: {
        name,
        email,
        phone,
        clinic_id: BigInt(clinic_id),
        practitioner_type,
        specialization: specializationArray,
        bio: bio || null,
        practitioner_image_url: practitioner_image_url || null,
      },
    });

    console.log("✅ Practitioner Created:", newPractitioner);

    // ✅ Serialize BigInt before returning
    const serializedPractitioner = serializeBigInt(newPractitioner);

    // ✅ Return success response
    return NextResponse.json(
      {
        message: "Practitioner added successfully.",
        practitioner: serializedPractitioner,
      },
      { status: 201 },
    );
  } catch (error: Error | unknown) {
    console.error(
      "❌ Backend Error:",
      error instanceof Error ? error.message : error,
    );

    // Type guard for Prisma error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      "meta" in error
    ) {
      if (error.code === "P2002") {
        return NextResponse.json({
          error: "A unique constraint violation occurred. Check email/phone.",
          details: error.meta,
        });
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add practitioner.",
        details: error,
      },
      { status: 500 },
    );
  }
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * Delete Resource by ID
 */
export async function DELETE(req: NextRequest, props: Props) {
  try {
    // ✅ Resolve params promise
    const { id } = await props.params;

    // ✅ Validate ID
    if (!id) {
      console.error("❌ Missing Practitioner ID");
      return NextResponse.json(
        { error: "Practitioner ID is required for deletion." },
        { status: 400 },
      );
    }

    console.log(`🛠️ Deleting Practitioner with ID: ${id}`);

    // ✅ Check if practitioner exists
    const existingPractitioner = await prisma.practitioners.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingPractitioner) {
      console.error("❌ Practitioner Not Found");
      return NextResponse.json(
        { error: "Practitioner not found." },
        { status: 404 },
      );
    }

    // ✅ Delete the practitioner
    await prisma.practitioners.delete({
      where: { id: BigInt(id) },
    });

    console.log(`✅ Practitioner with ID ${id} deleted successfully`);

    return NextResponse.json(
      { message: `Practitioner with ID ${id} deleted successfully.` },
      { status: 200 },
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete practitioner.",
        details: error,
      },
      { status: 500 },
    );
  }
}
