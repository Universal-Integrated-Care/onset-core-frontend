"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt, convertToMelbourneTime } from "@/lib/utils";
import moment from "moment-timezone";

/**
 * Fetch Blocked Slots for a Practitioner (Date-specific and Recurring)
 */

/**
 * Fetch consolidated availability (recurring + date-specific) for a given practitioner on a given date.
 * Includes partial blocking and subtraction of booked appointments.
 *
 * Core Logic:
 * 1) Always fetch recurring intervals (day_of_week) for the requested date.
 * 2) Also fetch date-specific entries (which might override or block partial times).
 *   - If a date-specific slot has is_available=true, treat that chunk as available.
 *   - If a date-specific slot has is_available=false or is_blocked=true, treat that chunk as blocked.
 * 3) Combine the recurring base intervals and any "available" date-specific intervals into one set.
 * 4) Subtract from that set any "blocked" date-specific intervals + any booked appointments.
 * 5) Return the final free slots.
 */
export async function GET(req: NextRequest) {
  try {
    console.log(
      "➡️ Incoming Request Query:",
      req.nextUrl.searchParams.toString(),
    );

    const practitionerId = req.nextUrl.searchParams.get("practitioner_id");
    const dateParam = req.nextUrl.searchParams.get("date");
    console.log("🔎 practitionerId:", practitionerId, " dateParam:", dateParam);

    if (!practitionerId || !dateParam) {
      return NextResponse.json(
        { error: "Both 'practitioner_id' and 'date' are required." },
        { status: 400 },
      );
    }

    const pid = Number(practitionerId);
    if (isNaN(pid) || pid <= 0) {
      console.log("❌ Invalid Practitioner ID");
      return NextResponse.json(
        { error: "Invalid practitioner_id." },
        { status: 400 },
      );
    }

    // Convert date to Melbourne start/end
    const dateStart = moment
      .tz(`${dateParam}T00:00:00`, "Australia/Melbourne")
      .toISOString(true);
    const dateEnd = moment
      .tz(`${dateParam}T23:59:59.999`, "Australia/Melbourne")
      .toISOString(true);
    console.log("🕒 dateStart:", dateStart, " dateEnd:", dateEnd);

    if (!dateStart || isNaN(new Date(dateStart).getTime())) {
      console.log("❌ Invalid date format");
      return NextResponse.json(
        { error: `Invalid date: ${dateParam}` },
        { status: 400 },
      );
    }

    // Check if practitioner exists
    const practitioner = await prisma.practitioners.findUnique({
      where: { id: BigInt(pid) },
    });
    if (!practitioner) {
      console.log("❌ Practitioner not found");
      return NextResponse.json(
        { error: `No practitioner found with ID ${practitionerId}.` },
        { status: 400 },
      );
    }

    // Day of the week
    const dayOfWeek = moment
      .tz(dateStart, "Australia/Melbourne")
      .format("dddd")
      .toUpperCase();
    console.log("📅 Day of Week (from dateParam):", dayOfWeek);

    // ------------------------------------------------------------------
    // 1) Fetch recurring slots for this day_of_week
    // ------------------------------------------------------------------
    const recurringSlots = await prisma.practitioner_availability.findMany({
      where: {
        practitioner_id: BigInt(pid),
        date: null,
        day_of_week: dayOfWeek,
      },
      orderBy: { start_time: "asc" },
    });
    console.log("🔂 Recurring Slots (Original):", recurringSlots);

    // Map the 1900-01-01 recurring times to the requested date
    const mappedRecurring = recurringSlots.map((r) => {
      const mappedStart = mapRecurringTimeToDate(r.start_time, dateParam);
      const mappedEnd = mapRecurringTimeToDate(r.end_time, dateParam);
      return {
        ...r,
        date: new Date(dateParam),
        start_time: new Date(mappedStart),
        end_time: new Date(mappedEnd),
      };
    });
    console.log(
      "🔂 Recurring Slots (Mapped to requested date):",
      mappedRecurring,
    );

    // We'll build two sets: baseAvailable (from recurring + any date-specific with is_available=true)
    // and forcedBlocked (from date-specific that are blocked or is_available=false).
    // Then we'll subtract forcedBlocked + any appointments from baseAvailable.

    // ------------------------------------------------------------------
    // 2) Fetch date-specific entries
    // ------------------------------------------------------------------
    const dateSpecific = await prisma.practitioner_availability.findMany({
      where: {
        practitioner_id: BigInt(pid),
        date: new Date(dateParam),
      },
      orderBy: { start_time: "asc" },
    });
    console.log("🗓 Date-Specific Slots:", dateSpecific);

    // Build: (a) "baseAvailable" from recurring + dateSpecific with is_available=true
    //        (b) "forcedBlocked" from dateSpecific with is_blocked=true or is_available=false

    // A. baseAvailable from recurring
    let baseAvailable: { start: string; end: string }[] = mappedRecurring
      .filter((s) => s.is_available !== false && s.is_blocked !== true)
      .map((s) => ({
        start: convertToMelbourneTime(s.start_time.toISOString()),
        end: convertToMelbourneTime(s.end_time.toISOString()),
      }));

    // B. forcedBlocked from recurring (not usual, but in case recurring has is_blocked or is_available=false)
    let forcedBlocked: { start: string; end: string }[] = mappedRecurring
      .filter((s) => s.is_available === false || s.is_blocked === true)
      .map((s) => ({
        start: convertToMelbourneTime(s.start_time.toISOString()),
        end: convertToMelbourneTime(s.end_time.toISOString()),
      }));

    // Now integrate date-specific
    // If date-specific is_available=true => that chunk is forcibly available
    // If date-specific is_blocked=true or is_available=false => forcibly blocked
    for (const ds of dateSpecific) {
      const dsStart = convertToMelbourneTime(ds.start_time.toISOString());
      const dsEnd = convertToMelbourneTime(ds.end_time.toISOString());

      // is_available=true => add to baseAvailable
      if (ds.is_available === true && ds.is_blocked !== true) {
        baseAvailable.push({ start: dsStart, end: dsEnd });
      }
      // is_blocked=true or is_available=false => add to forcedBlocked
      if (ds.is_blocked === true || ds.is_available === false) {
        forcedBlocked.push({ start: dsStart, end: dsEnd });
      }
    }

    console.log("✅ Combined Base Available (before merges):", baseAvailable);
    console.log("⛔ Combined Forced Blocked (before merges):", forcedBlocked);

    // Merge any overlapping intervals in baseAvailable (so we don't have disjoint pieces)
    // We'll unify them first
    baseAvailable = mergeIntervals(baseAvailable);
    console.log("✅ Base Available (merged):", baseAvailable);

    // Also unify forcedBlocked intervals
    forcedBlocked = mergeIntervals(forcedBlocked);
    console.log("⛔ Forced Blocked (merged):", forcedBlocked);

    // ------------------------------------------------------------------
    // 3) Subtract forcedBlocked from baseAvailable
    // ------------------------------------------------------------------
    const afterBlocks = subtractIntervals(baseAvailable, forcedBlocked);
    console.log("🤝 Availability after forced blocks:", afterBlocks);

    // ------------------------------------------------------------------
    // 4) Subtract patient appointments
    // ------------------------------------------------------------------
    const appointments = await prisma.patient_appointments.findMany({
      where: {
        practitioner_id: BigInt(pid),
        appointment_start_datetime: {
          gte: new Date(dateStart),
          lte: new Date(dateEnd),
        },
        status: { not: "cancelled" },
      },
    });
    console.log("👥 Appointments:", appointments);

    // Build block intervals from appointments
    const appointmentBlocks = appointments.map((a) => {
      const st = convertToMelbourneTime(
        a.appointment_start_datetime.toISOString(),
      );
      const endValue =
        moment.tz(st, "Australia/Melbourne").valueOf() + a.duration * 60000;
      const en = moment.tz(endValue, "Australia/Melbourne").toISOString(true);
      return { start: st, end: en };
    });
    console.log("⛔ Appointment Intervals:", appointmentBlocks);

    const finalIntervals = subtractIntervals(afterBlocks, appointmentBlocks);
    console.log("🤝 Final Intervals After All Subtractions:", finalIntervals);

    // ------------------------------------------------------------------
    // 5) Format final intervals for response
    // ------------------------------------------------------------------
    const slots = finalIntervals.map((itv) => {
      const st = moment.tz(itv.start, "Australia/Melbourne");
      const en = moment.tz(itv.end, "Australia/Melbourne");
      return {
        date: dateParam,
        start_time: st.format("HH:mm:ss"),
        end_time: en.format("HH:mm:ss"),
      };
    });
    console.log("📤 Final Slots to Return:", slots);

    return NextResponse.json(
      {
        message: "Availability fetched successfully.",
        slots: serializeBigInt(slots),
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("❌ Error fetching availability:", err);
    return NextResponse.json(
      { error: "Failed to fetch availability." },
      { status: 500 },
    );
  }
}

/**
 * Convert a recurring slot date/time (1900-01-01 HH:mm:ss) into the actual requested date/time in Melbourne.
 */
function mapRecurringTimeToDate(slotDate: Date, requestedDate: string) {
  const slotMoment = moment.tz(slotDate.toISOString(), "Australia/Melbourne");
  const dateMoment = moment.tz(
    `${requestedDate}T00:00:00`,
    "Australia/Melbourne",
  );
  return dateMoment
    .hour(slotMoment.hour())
    .minute(slotMoment.minute())
    .second(slotMoment.second())
    .toISOString(true);
}

/**
 * Merge overlapping intervals in ascending order.
 * E.g. [09:00-10:00, 10:00-12:00] => [09:00-12:00]
 */
function mergeIntervals(intervals: { start: string; end: string }[]) {
  if (!intervals.length) return [];
  // Sort by start
  const sorted = intervals
    .map((itv) => ({
      s: moment.tz(itv.start, "Australia/Melbourne").valueOf(),
      e: moment.tz(itv.end, "Australia/Melbourne").valueOf(),
    }))
    .sort((a, b) => a.s - b.s);

  const merged: { s: number; e: number }[] = [];
  let current = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    // Overlap or contiguous
    if (next.s <= current.e) {
      current.e = Math.max(current.e, next.e);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  // Convert back
  return merged.map((m) => ({
    start: moment.tz(m.s, "Australia/Melbourne").toISOString(true),
    end: moment.tz(m.e, "Australia/Melbourne").toISOString(true),
  }));
}

/**
 * Subtract block intervals from availability intervals, splitting partial overlaps if needed.
 */
function subtractIntervals(
  avail: { start: string; end: string }[],
  blocks: { start: string; end: string }[],
) {
  if (!avail.length) return [];
  const toMs = (v: string) => moment.tz(v, "Australia/Melbourne").valueOf();
  let result = avail.map((a) => ({ s: toMs(a.start), e: toMs(a.end) }));
  const blocked = blocks.map((b) => ({ s: toMs(b.start), e: toMs(b.end) }));

  console.log(
    "📐 Subtracting intervals. Base count:",
    result.length,
    "Block count:",
    blocked.length,
  );

  blocked.sort((a, b) => a.s - b.s);

  for (const block of blocked) {
    const newRes: typeof result = [];
    for (const seg of result) {
      // No overlap
      if (block.e <= seg.s || block.s >= seg.e) {
        newRes.push(seg);
      } else {
        // Partial or full overlap
        if (block.s > seg.s) {
          newRes.push({ s: seg.s, e: block.s });
        }
        if (block.e < seg.e) {
          newRes.push({ s: block.e, e: seg.e });
        }
      }
    }
    result = newRes;
    console.log("🔄 After subtracting one block:", result);
  }

  // Filter out zero-length intervals
  const final = result
    .filter((seg) => seg.e > seg.s)
    .map((seg) => ({
      start: moment.tz(seg.s, "Australia/Melbourne").toISOString(true),
      end: moment.tz(seg.e, "Australia/Melbourne").toISOString(true),
    }));

  console.log("🚀 Final result after all blocks:", final);
  return final;
}
