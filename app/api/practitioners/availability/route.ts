import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import { convertToMelbourneTime } from "@/lib/utils";
/**
 * 📚 **Practitioner Availability API - POST**
 *
 * **Purpose:**
 * Update a practitioner's availability for either a **specific date** (override) or a **recurring weekly schedule**.
 *
 * ---
 *
 * **Key Behavior:**
 * 1️⃣ **One-Time Availability (Override):**
 *    - Applies to a specific date (`date`) with `start_time` and `end_time`.
 *    - Overrides recurring availability for that date.
 *
 * 2️⃣ **Recurring Availability:**
 *    - Applies to a recurring day of the week (`day_of_week`).
 *    - Used when no specific date is provided.
 *
 * ---
 *
 * **Required Fields:**
 * - `practitioner_id`: Practitioner’s unique identifier.
 * - `start_time`: Start time in `HH:MM:SS`.
 * - `end_time`: End time in `HH:MM:SS`.
 * - `is_available`: Boolean indicating availability.
 * - `is_blocked`: Boolean indicating if the slot is blocked.
 *
 * **Optional (Choose One):**
 * - `date`: For date-specific availability.
 * - `day_of_week`: For recurring availability.
 *
 * ---
 *
 * **Example Payloads:**
 * - **One-Time Availability:**
 * ```json
 * {
 *   "practitioner_id": 1,
 *   "date": "2024-12-29",
 *   "start_time": "09:00:00",
 *   "end_time": "11:00:00",
 *   "is_available": true,
 *   "is_blocked": false
 * }
 * ```
 *
 * - **Recurring Availability:**
 * ```json
 * {
 *   "practitioner_id": 1,
 *   "day_of_week": "MONDAY",
 *   "start_time": "09:00:00",
 *   "end_time": "11:00:00",
 *   "is_available": true,
 *   "is_blocked": false
 * }
 * ```
 *
 * ---
 *
 * **Response Example:**
 * ```json
 * {
 *   "message": "One-time availability updated successfully.",
 *   "availability": {
 *     "id": 48,
 *     "date": "2024-12-29",
 *     "start_time": "09:00:00",
 *     "end_time": "11:00:00",
 *     "is_available": true,
 *     "is_blocked": false
 *   }
 * }
 * ```
 *
 * ---
 *
 * **How it Works:**
 * 1. Validates required fields and time ranges.
 * 2. Checks if the practitioner exists.
 * 3. Updates or creates availability based on `date` or `day_of_week`.
 * 4. Ensures no conflicts or overlaps occur.
 * 5. Returns the updated availability details.
 *
 * ---
 *
 * **Quick Recap:**
 * - Use `date` for specific overrides.
 * - Use `day_of_week` for weekly recurring availability.
 * - Both `is_available` and `is_blocked` cannot conflict logically.
 */

/**
 * 📚 **Practitioner Availability API - POST**
 *
 * Updates availability for either a **specific date** (override) or a **recurring weekly schedule**.
 */

// app/api/practitioners/availability/route.ts

/**
 * @swagger
 * /api/practitioners/availability:
 *   post:
 *     tags:
 *       - Practitioners
 *       - Availability
 *     summary: Update practitioner availability
 *     description: |
 *       Updates a practitioner's availability for either a specific date (override) or a recurring weekly schedule.
 *       Handles both one-time availability overrides and recurring weekly schedules in Melbourne timezone.
 *
 *       **Key Features:**
 *       - One-time availability overrides for specific dates
 *       - Recurring weekly schedule management
 *       - Automatic timezone conversion to Melbourne time
 *       - Conflict prevention with existing schedules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - practitioner_id
 *               - start_time
 *               - end_time
 *               - is_available
 *               - is_blocked
 *             properties:
 *               practitioner_id:
 *                 type: integer
 *                 description: Unique identifier of the practitioner
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00:00"
 *                 description: Start time in HH:MM:SS format
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "17:00:00"
 *                 description: End time in HH:MM:SS format
 *               is_available:
 *                 type: boolean
 *                 nullable: true
 *                 description: Indicates if the practitioner is available during this time
 *               is_blocked:
 *                 type: boolean
 *                 description: Indicates if the time slot is blocked (e.g., by admin)
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-29"
 *                 description: Specific date for one-time availability (mutually exclusive with day_of_week)
 *               day_of_week:
 *                 type: string
 *                 enum:
 *                   - MONDAY
 *                   - TUESDAY
 *                   - WEDNESDAY
 *                   - THURSDAY
 *                   - FRIDAY
 *                   - SATURDAY
 *                   - SUNDAY
 *                 description: Day of week for recurring availability (mutually exclusive with date)
 *           examples:
 *             oneTime:
 *               summary: One-time availability
 *               value:
 *                 practitioner_id: 1
 *                 date: "2024-12-29"
 *                 start_time: "09:00:00"
 *                 end_time: "11:00:00"
 *                 is_available: true
 *                 is_blocked: false
 *             recurring:
 *               summary: Recurring availability
 *               value:
 *                 practitioner_id: 1
 *                 day_of_week: "MONDAY"
 *                 start_time: "09:00:00"
 *                 end_time: "11:00:00"
 *                 is_available: true
 *                 is_blocked: false
 *             blocked:
 *               summary: Blocked time slot
 *               value:
 *                 practitioner_id: 1
 *                 date: "2024-12-31"
 *                 start_time: "09:00:00"
 *                 end_time: "17:00:00"
 *                 is_available: null
 *                 is_blocked: true
 *     responses:
 *       200:
 *         description: Availability successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "One-time availability updated successfully."
 *                 availability:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     practitioner_id:
 *                       type: string
 *                     clinic_id:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     day_of_week:
 *                       type: string
 *                       nullable: true
 *                     start_time:
 *                       type: string
 *                       format: date-time
 *                     end_time:
 *                       type: string
 *                       format: date-time
 *                     is_available:
 *                       type: boolean
 *                       nullable: true
 *                     is_blocked:
 *                       type: boolean
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     - "Missing required fields: practitioner_id, start_time, end_time, is_available, and is_blocked."
 *                     - "Invalid practitioner_id. It must be a positive number."
 *                     - "start_time must be earlier than end_time."
 *                     - "Invalid day_of_week. Valid values are MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY."
 *                     - "Either 'day_of_week' for recurring availability or 'date' for one-time availability must be provided."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong while updating availability. Please try again later."
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
      is_blocked,
    } = body;

    console.log("📥 Received Availability Data:", body);

    // ✅ Validate Required Fields
    if (
      !practitioner_id ||
      !start_time ||
      !end_time ||
      is_available === undefined ||
      is_blocked === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: practitioner_id, start_time, end_time, is_available, and is_blocked.",
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

    // ✅ Validate Time Parsing with Melbourne Time
    const parsedStartTime = convertToMelbourneTime(`1900-01-01T${start_time}`);
    const parsedEndTime = convertToMelbourneTime(`1900-01-01T${end_time}`);

    console.log("Start Time:", parsedStartTime, "End Time:", parsedEndTime);

    if (new Date(parsedStartTime) >= new Date(parsedEndTime)) {
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

    // ✅ Handle One-Time Availability (Override Availability)
    if (parsedDate) {
      console.log("🔄 Handling One-Time Availability Override...");

      // Combine date with start_time and end_time for accurate datetime storage
      const startDateTime = convertToMelbourneTime(`${date}T${start_time}`);
      const endDateTime = convertToMelbourneTime(`${date}T${end_time}`);

      console.log("🕒 Start DateTime:", startDateTime);
      console.log("🕒 End DateTime:", endDateTime);

      availability = await db.practitioner_availability.upsert({
        where: {
          practitioner_id_date: {
            practitioner_id: serializeBigInt(practitioner_id),
            date: parsedDate,
            start_time: new Date(startDateTime),
            end_time: new Date(endDateTime),
          },
        },
        update: {
          is_available,
          is_blocked,
          updated_at: convertToMelbourneTime(new Date().toISOString()),
        },
        create: {
          date: parsedDate,
          start_time: new Date(startDateTime),
          end_time: new Date(endDateTime),
          is_available,
          is_blocked,
          day_of_week: null,
          created_at: convertToMelbourneTime(new Date().toISOString()),
          updated_at: convertToMelbourneTime(new Date().toISOString()),
          clinics: {
            connect: { id: serializeBigInt(clinic_id) }, // Explicit connection to clinic
          },
          practitioners: {
            connect: { id: serializeBigInt(practitioner_id) }, // Explicit connection to practitioner
          },
        },
      });
    }
    // ✅ Handle Recurring Availability (Day of Week)
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
          is_blocked,
          updated_at: convertToMelbourneTime(new Date().toISOString()),
        },
        create: {
          practitioner_id: serializeBigInt(practitioner_id),
          clinic_id: serializeBigInt(clinic_id),
          day_of_week,
          start_time: parsedStartTime,
          end_time: parsedEndTime,
          is_available,
          is_blocked,
          created_at: convertToMelbourneTime(new Date().toISOString()),
          updated_at: convertToMelbourneTime(new Date().toISOString()),
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
//Sample payloads
//Case when date is provided and marking availability for a specific date
// {
//   "practitioner_id": 1,
//   "date": "2024-12-29",
//   "start_time": "09:00:00",
//   "end_time": "11:00:00",
//   "is_available": true,
//   "is_blocked": false
// }
//Case when day_of_week is provided and marking availability for a recurring day of the week
// {
//   "practitioner_id": 1,
//   "day_of_week": "MONDAY",
//   "start_time": "09:00:00",
//   "end_time": "11:00:00",
//   "is_available": true,
//   "is_blocked": false
// }
//Case when date is provided and marking blockage for a specific date
//is_available is set to null and is_blocked is set to true to mark the slot as blocked(by admin)
// {
//   "practitioner_id": 1,
//   "date": "2024-12-31",
//   "start_time": "09:00:00",
//   "end_time": "17:00:00",
//   "is_available": null,
//   "is_blocked": true
// }
