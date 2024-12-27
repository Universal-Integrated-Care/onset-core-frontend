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
        practitioner_type: true,
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
  } catch (error: any) {
    console.error("❌ Backend Error:", error);

    // Prisma-specific error handling
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error: "A unique constraint violation occurred. Check email/phone.",
          details: error.meta,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to add practitioner.",
        details: error,
      },
      { status: 500 },
    );
  }
}
