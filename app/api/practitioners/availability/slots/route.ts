"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import moment from "moment-timezone";

/**
 * Fetch Blocked Slots for a Practitioner (Date-specific and Recurring)
 */

/**
 * @swagger
 * /api/practitioners/availability/slots:
 *   get:
 *     tags:
 *       - Practitioners
 *       - Availability
 *     summary: Fetch blocked availability slots for a practitioner
 *     description: |
 *       Retrieves blocked time slots for a specific practitioner, with optional date filtering.
 *       All times are handled in Melbourne timezone.
 *     parameters:
 *       - in: query
 *         name: practitioner_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the practitioner
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         example: "2024-01-02"
 *         description: Optional date to filter slots (YYYY-MM-DD format)
 *     responses:
 *       200:
 *         description: Successfully retrieved blocked slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Blocked slots fetched successfully."
 *                 blockedSlots:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Unique identifier for the slot
 *                       date:
 *                         type: string
 *                         format: date
 *                         nullable: true
 *                         description: The specific date for the slot (YYYY-MM-DD)
 *                       day_of_week:
 *                         type: string
 *                         enum: [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY]
 *                         nullable: true
 *                         description: Day of week for recurring slots
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         example: "09:00:00"
 *                         description: Start time in HH:mm:ss format (Melbourne timezone)
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         example: "17:00:00"
 *                         description: End time in HH:mm:ss format (Melbourne timezone)
 *                       is_blocked:
 *                         type: boolean
 *                         description: Whether the slot is blocked
 *                       is_available:
 *                         type: boolean
 *                         nullable: true
 *                         description: Whether the slot is available
 *             example:
 *               message: "Blocked slots fetched successfully."
 *               blockedSlots:
 *                 - id: "1"
 *                   date: "2024-01-02"
 *                   day_of_week: null
 *                   start_time: "09:00:00"
 *                   end_time: "12:00:00"
 *                   is_blocked: true
 *                   is_available: null
 *                 - id: "2"
 *                   date: null
 *                   day_of_week: "MONDAY"
 *                   start_time: "14:00:00"
 *                   end_time: "17:00:00"
 *                   is_blocked: true
 *                   is_available: false
 *       400:
 *         description: Invalid practitioner ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid practitioner ID. It must be a positive number."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch blocked slots. Please try again later."
 */
export async function GET(req: NextRequest) {
  try {
    const practitionerId = req.nextUrl.searchParams.get("practitioner_id");
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

    console.log("✅ Blocked Slots Fetched:", blockedSlots);

    // Map and serialize results
    const serializedBlockedSlots = blockedSlots.map((slot) => ({
      id: serializeBigInt(slot.id),
      date: slot.date ? slot.date.toISOString().split("T")[0] : null,
      day_of_week: slot.day_of_week,
      start_time: moment
        .tz(slot.start_time.toISOString(), "Australia/Melbourne")
        .format("HH:mm:ss"),
      end_time: moment
        .tz(slot.end_time.toISOString(), "Australia/Melbourne")
        .format("HH:mm:ss"),
      is_blocked: slot.is_blocked,
      is_available: slot.is_available,
    }));

    console.log("📤 Serialized Blocked Slots:", serializedBlockedSlots);

    return new NextResponse(
      JSON.stringify(
        serializeBigInt({
          message: "Blocked slots fetched successfully.",
          blockedSlots: serializedBlockedSlots,
        }),
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
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
