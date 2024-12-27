import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { practitionerId: string } },
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

interface Params {
  params: { practitionerId: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { practitionerId } = await params;

    if (!practitionerId) {
      return NextResponse.json(
        { error: "Practitioner ID is required." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { date, start_time, end_time, clinic_id } = body;

    if (!date || !start_time || !end_time) {
      return NextResponse.json(
        { error: "Date, start_time, and end_time are required." },
        { status: 400 },
      );
    }

    // ✅ Fetch clinic_id from practitioners table if not provided
    const clinicId =
      clinic_id ||
      (
        await prisma.practitioners.findUnique({
          where: { id: BigInt(practitionerId) },
          select: { clinic_id: true },
        })
      )?.clinic_id;

    if (!clinicId) {
      return NextResponse.json(
        { error: "Unable to determine clinic ID for this practitioner." },
        { status: 400 },
      );
    }

    // ✅ Block the slot
    const blockedSlot = await prisma.practitioner_availability.create({
      data: {
        practitioner_id: BigInt(practitionerId),
        clinic_id: BigInt(clinicId),
        date: new Date(date),
        start_time: new Date(`1970-01-01T${start_time}`),
        end_time: new Date(`1970-01-01T${end_time}`),
        is_available: false,
      },
    });

    return NextResponse.json({
      message: "Slot successfully blocked.",
      slot: serializeBigInt(blockedSlot),
    });
  } catch (error: any) {
    console.error("❌ Error blocking slot:", error.message);
    return NextResponse.json(
      { error: "Failed to block slot." },
      { status: 500 },
    );
  }
}
