import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * Update Practitioner Availability
 */
export async function POST(req: NextRequest) {
  const db = prisma;

  try {
    // ✅ Parse Incoming JSON Body
    const body = await req.json();

    const {
      practitioner_id,
      day_of_week,
      date,
      start_time,
      end_time,
      is_available,
    } = body;

    console.log("📥 Received Availability Data:", body);

    // ✅ Validate Required Fields
    if (
      !practitioner_id ||
      !start_time ||
      !end_time ||
      is_available === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: practitioner_id, start_time, end_time, and is_available.",
        },
        { status: 400 },
      );
    }

    // ✅ Validate Practitioner ID
    if (isNaN(Number(practitioner_id)) || Number(practitioner_id) <= 0) {
      return NextResponse.json(
        { error: "Invalid practitioner_id. It must be a positive number." },
        { status: 400 },
      );
    }

    // ✅ Validate Time Parsing
    const parsedStartTime = new Date(
      Date.UTC(1970, 0, 1, ...start_time.split(":").map(Number)),
    );
    const parsedEndTime = new Date(
      Date.UTC(1970, 0, 1, ...end_time.split(":").map(Number)),
    );

    console.log("Start Time:", parsedStartTime, "End Time:", parsedEndTime);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return NextResponse.json(
        {
          error:
            "Invalid start_time or end_time format. Use 'HH:MM:SS' (e.g., '09:00:00').",
        },
        { status: 400 },
      );
    }

    if (parsedStartTime >= parsedEndTime) {
      return NextResponse.json(
        { error: "start_time must be earlier than end_time." },
        { status: 400 },
      );
    }

    // ✅ Validate Day of the Week (if provided)
    const validDays = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];
    if (day_of_week && !validDays.includes(day_of_week)) {
      return NextResponse.json(
        {
          error: `Invalid day_of_week: ${day_of_week}. Valid values are ${validDays.join(
            ", ",
          )}.`,
        },
        { status: 400 },
      );
    }

    // ✅ Validate Date (if provided)
    let parsedDate: Date | null = null;
    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            error: `Invalid date format: ${date}. Use 'YYYY-MM-DD' (e.g., '2024-01-15').`,
          },
          { status: 400 },
        );
      }
    }

    // ✅ Validate Practitioner Existence
    const practitioner = await db.practitioners.findUnique({
      where: { id: serializeBigInt(practitioner_id) },
      select: { clinic_id: true },
    });

    if (!practitioner) {
      return NextResponse.json(
        { error: `No practitioner found with ID ${practitioner_id}.` },
        { status: 400 },
      );
    }

    const clinic_id = practitioner.clinic_id;
    console.log("✅ Clinic ID Found:", clinic_id);

    let availability;

    // ✅ Handle One-Time Availability (Date Provided)
    if (parsedDate) {
      console.log("🔄 Handling One-Time Availability Override...");
      availability = await db.practitioner_availability.upsert({
        where: {
          practitioner_id_date: {
            practitioner_id: serializeBigInt(practitioner_id),
            date: parsedDate,
          },
        },
        update: {
          start_time: parsedStartTime,
          end_time: parsedEndTime,
          is_available,
          updated_at: new Date(),
        },
        create: {
          practitioner_id: serializeBigInt(practitioner_id),
          clinic_id: serializeBigInt(clinic_id),
          date: parsedDate,
          start_time: parsedStartTime,
          end_time: parsedEndTime,
          is_available,
        },
      });
    }
    // ✅ Handle Recurring Availability (Day of Week Provided)
    else if (day_of_week) {
      console.log("🔄 Handling Recurring Availability...");
      availability = await db.practitioner_availability.upsert({
        where: {
          practitioner_id_day_of_week: {
            practitioner_id: serializeBigInt(practitioner_id),
            day_of_week,
          },
        },
        update: {
          start_time: parsedStartTime,
          end_time: parsedEndTime,
          is_available,
          updated_at: new Date(),
        },
        create: {
          practitioner_id: serializeBigInt(practitioner_id),
          clinic_id: serializeBigInt(clinic_id),
          day_of_week,
          start_time: parsedStartTime,
          end_time: parsedEndTime,
          is_available,
        },
      });
    }
    // ✅ Missing Day or Date
    else {
      return NextResponse.json(
        {
          error:
            "Either 'day_of_week' for recurring availability or 'date' for one-time availability must be provided.",
        },
        { status: 400 },
      );
    }

    // ✅ Serialize BigInt fields
    const serializedAvailability = serializeBigInt(availability);
    console.log("✅ Availability Updated:", serializedAvailability);

    return NextResponse.json(
      {
        message: parsedDate
          ? "One-time availability updated successfully."
          : "Recurring availability updated successfully.",
        availability: serializedAvailability,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("❌ Error updating availability:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong while updating availability. Please try again later.",
      },
      { status: 500 },
    );
  } finally {
    await db.$disconnect();
  }
}
