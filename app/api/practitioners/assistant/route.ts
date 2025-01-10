import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Fetch Practitioners by Clinic assistant_id
 */

export async function GET(req: NextRequest) {
  try {
    // ✅ Extract the query parameter from the request URL
    const { searchParams } = new URL(req.url);
    const assistant_id = searchParams.get("assistant_id");

    console.log("📞 Clinic assistant_id from query:", assistant_id);

    // ✅ Validate the assistant_id
    if (!assistant_id) {
      return NextResponse.json(
        { error: "Missing 'assistant_id' query parameter." },
        { status: 400 },
      );
    }

    // ✅ Fetch the clinic ID associated with the given assistant_id
    const clinic = await prisma.clinics.findFirst({
      where: {
        assistant_id: assistant_id,
      },
      select: {
        id: true,
      },
    });

    console.log("🏥 Clinic Fetched by assistant_id:", clinic);

    if (!clinic) {
      return NextResponse.json(
        { error: "No clinic found with the given assistant_id." },
        { status: 404 },
      );
    }

    // ✅ Fetch practitioners associated with the clinic ID
    const practitioners = await prisma.practitioners.findMany({
      where: {
        clinic_id: clinic.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        practitioner_type: true,
        bio: true,
        practitioner_image_url: true,
        created_at: true,
        updated_at: true,
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
