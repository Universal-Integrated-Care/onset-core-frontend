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
export async function GET(
  req: NextRequest,
  { params }: { params: { clinicId: string } },
) {
  try {
    // ✅ Extract clinicId from params

    const { clinicId } = await params;

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
