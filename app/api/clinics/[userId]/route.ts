import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Fetch Clinic Details by User ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    // ✅ Extract userId from params
    const userId = Number(params?.userId);

    console.log("🏥 User ID from params:", userId);

    if (!userId || isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid or missing User ID." },
        { status: 400 },
      );
    }

    // ✅ Fetch clinic associated with the user
    const clinic = await prisma.clinics.findFirst({
      where: {
        users: {
          some: { id: userId },
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
