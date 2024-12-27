import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { practitionerId: string } },
) {
  try {
    const { practitionerId } = await params;
    const practitioner = await prisma.practitioners.findUnique({
      where: { id: BigInt(practitionerId) },
      select: {
        id: true,
        clinic_id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        bio: true,
      },
    });

    if (!practitioner) {
      return NextResponse.json(
        { error: "Practitioner not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ practitioner: serializeBigInt(practitioner) });
  } catch (error: any) {
    console.error("❌ Error fetching practitioner details:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch practitioner details." },
      { status: 500 },
    );
  }
}
