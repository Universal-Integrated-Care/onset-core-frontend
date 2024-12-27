import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { practitionerId } = await params;
    const slots = await prisma.practitioner_availability.findMany({
      where: {
        practitioner_id: BigInt(practitionerId),
        is_available: true,
      },
      select: {
        id: true,
        date: true,
        start_time: true,
        end_time: true,
      },
    });

    return NextResponse.json({ slots: serializeBigInt(slots) });
  } catch (error: any) {
    console.error("❌ Error fetching available slots:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch available slots." },
      { status: 500 },
    );
  }
}
