"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import moment from "moment-timezone";
import { convertToMelbourneTime } from "@/lib/utils";

/**
 * Fetch Blocked Slots for a Practitioner (Date-specific and Recurring)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { practitionerId: string } },
) {
  try {
    const { practitionerId } = await params;
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

/**
 * 📚 **Extend Blockage API - POST**
 *
 * Purpose:
 * Block time slots for a practitioner across a range of dates for specified hours.
 */

export async function POST(
  req: NextRequest,
  { params }: { params: { practitionerId: string } },
) {
  const db = prisma;

  try {
    // ✅ Extract practitionerId from URL params
    const { practitionerId } = await params;

    console.log("🆔 Practitioner ID from URL:", practitionerId);

    // ✅ Validate Practitioner ID
    if (isNaN(Number(practitionerId)) || Number(practitionerId) <= 0) {
      return NextResponse.json(
        {
          error:
            "Invalid practitioner_id from URL. It must be a positive number.",
        },
        { status: 400 },
      );
    }

    // ✅ Parse Incoming JSON Body
    const body = await req.json();
    const { start_datetime, end_datetime, is_blocked } = body;

    console.log("📥 Received Extend Blockage Data:", body);

    // ✅ Validate Required Fields
    if (!start_datetime || !end_datetime || is_blocked === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: start_datetime, end_datetime, is_blocked.",
        },
        { status: 400 },
      );
    }

    // ✅ Validate and Parse Datetimes with Moment.js
    const parsedStartDatetime = moment.tz(
      start_datetime,
      "Australia/Melbourne",
    );
    const parsedEndDatetime = moment.tz(end_datetime, "Australia/Melbourne");

    if (!parsedStartDatetime.isValid() || !parsedEndDatetime.isValid()) {
      return NextResponse.json(
        { error: "Invalid datetime format. Use ISO string format." },
        { status: 400 },
      );
    }

    if (parsedStartDatetime.isAfter(parsedEndDatetime)) {
      return NextResponse.json(
        { error: "start_datetime must be earlier than end_datetime." },
        { status: 400 },
      );
    }

    console.log("🕒 Parsed Start:", parsedStartDatetime.format());
    console.log("🕒 Parsed End:", parsedEndDatetime.format());

    // ✅ Validate Practitioner Existence
    const practitioner = await db.practitioners.findUnique({
      where: { id: BigInt(practitionerId) },
      select: { clinic_id: true },
    });

    if (!practitioner) {
      return NextResponse.json(
        { error: `No practitioner found with ID ${practitionerId}.` },
        { status: 400 },
      );
    }

    const clinic_id = practitioner.clinic_id;
    console.log("✅ Clinic ID Found:", clinic_id);

    // ✅ Generate Date Range Between Start and End Datetimes
    const createdBlockages = [];
    let currentDate = parsedStartDatetime.clone();

    while (currentDate.isSameOrBefore(parsedEndDatetime, "day")) {
      const startDateTime = currentDate
        .set({
          hour: parsedStartDatetime.hour(),
          minute: parsedStartDatetime.minute(),
          second: parsedStartDatetime.second(),
        })
        .format();

      const endDateTime = currentDate
        .set({
          hour: parsedEndDatetime.hour(),
          minute: parsedEndDatetime.minute(),
          second: parsedEndDatetime.second(),
        })
        .format();

      console.log("🛠 Blocking Date:", currentDate.format("YYYY-MM-DD"));

      const blockage = await db.practitioner_availability.upsert({
        where: {
          practitioner_id_date: {
            practitioner_id: BigInt(practitionerId),
            date: currentDate.toDate(),
            start_time: new Date(startDateTime),
            end_time: new Date(endDateTime),
          },
        },
        update: {
          is_available: null,
          is_blocked: is_blocked,
          updated_at: moment.tz("Australia/Melbourne").format(),
        },
        create: {
          date: currentDate.toDate(),
          start_time: new Date(startDateTime),
          end_time: new Date(endDateTime),
          is_available: null,
          is_blocked,
          day_of_week: null,
          created_at: moment.tz("Australia/Melbourne").format(),
          updated_at: moment.tz("Australia/Melbourne").format(),
          clinics: {
            connect: { id: BigInt(clinic_id) },
          },
          practitioners: {
            connect: { id: BigInt(practitionerId) },
          },
        },
      });

      createdBlockages.push(serializeBigInt(blockage));
      currentDate.add(1, "day");
    }

    console.log("✅ Blockages Created:", createdBlockages);

    return NextResponse.json(
      {
        message: "Blockage extended successfully across multiple dates.",
        blockages: createdBlockages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error extending blockage:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong while extending blockage. Please try again later.",
      },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}

/*
Sample Request Body

{
  "start_datetime": "2025-01-06T09:00:00",
  "end_datetime": "2025-01-08T17:00:00",
  "is_blocked": true
}
  */
