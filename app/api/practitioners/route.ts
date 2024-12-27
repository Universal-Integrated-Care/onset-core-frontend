import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Fetch all practitioners
 */
export async function GET() {
  try {
    const practitioners = await prisma.practitioners.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
      },
    });

    return NextResponse.json({ practitioners: serializeBigInt(practitioners) });
  } catch (error: any) {
    console.error("❌ Error fetching practitioners:", error.message);
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

    // ✅ Validate required fields
    if (
      !name ||
      !email ||
      !phone ||
      !clinic_id ||
      !practitioner_type ||
      !specialization
    ) {
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
      return NextResponse.json(
        { error: "A practitioner with this phone number already exists." },
        { status: 400 },
      );
    }

    // ✅ Create a new practitioner
    const newPractitioner = await prisma.practitioners.create({
      data: {
        name,
        email,
        phone,
        clinic_id: BigInt(clinic_id),
        practitioner_type,
        specialization,
        bio: bio || null, // Optional field
        practitioner_image_url: practitioner_image_url || null, // Optional field
      },
    });

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
  } catch (error: any) {
    console.error("❌ Error adding practitioner:", error.message);
    return NextResponse.json(
      { error: "Failed to add practitioner." },
      { status: 500 },
    );
  }
}
