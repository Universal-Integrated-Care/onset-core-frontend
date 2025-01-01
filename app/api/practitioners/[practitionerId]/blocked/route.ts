"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import moment from "moment-timezone";

/**
 * Fetch Blocked Slots for a Practitioner (Date-specific and Recurring)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { practitionerId: string } },
) {
  try {
    const { practitionerId } = params;
    const dateParam = req.nextUrl.searchParams.get("date");

    if (
      !practitionerId ||
      isNaN(Number(practitionerId)) ||
      Number(practitionerId) <= 0
    ) {
      return NextResponse.json(
        { error: "Invalid practitioner ID. It must be a positive number." },
        { status: 400 },
      );
    }

    console.log(
      "📥 Fetching blocked slots for Practitioner ID:",
      practitionerId,
      " Date:",
      dateParam,
    );

    // Base query condition
    const queryConditions: any = {
      practitioner_id: BigInt(practitionerId),
      is_blocked: true,
    };

    // If date is provided, filter by date
    if (dateParam) {
      const dateStart = moment
        .tz(`${dateParam}T00:00:00`, "Australia/Melbourne")
        .toISOString(true);
      const dateEnd = moment
        .tz(`${dateParam}T23:59:59.999`, "Australia/Melbourne")
        .toISOString(true);

      queryConditions.date = new Date(dateParam);
      queryConditions.start_time = { gte: new Date(dateStart) };
      queryConditions.end_time = { lte: new Date(dateEnd) };

      console.log("📅 Filtering blocked slots by date:", dateStart, dateEnd);
    }

    // Fetch blocked slots
    const blockedSlots = await prisma.practitioner_availability.findMany({
      where: queryConditions,
      orderBy: [{ date: "asc" }, { day_of_week: "asc" }, { start_time: "asc" }],
    });

    console.log("✅ Blocked Slots Fetched (Raw):", blockedSlots);

    // Serialize blocked slots using serializeBigInt
    const serializedBlockedSlots = serializeBigInt(blockedSlots);

    console.log("📤 Serialized Blocked Slots:", serializedBlockedSlots);

    return NextResponse.json({
      message: "Blocked slots fetched successfully.",
      blockedSlots: serializedBlockedSlots,
    });
  } catch (error) {
    console.error("❌ Error fetching blocked slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked slots. Please try again later." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
