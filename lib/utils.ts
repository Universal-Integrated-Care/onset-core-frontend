import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import moment from "moment-timezone";
/**
 * Converts a timestamp to Australia/Melbourne time.
 * @param {string} timestamp - The input timestamp in ISO format (e.g., "2024-01-01T12:00:00Z").
 * @returns {string} - Converted timestamp in Australia/Melbourne timezone.
 */
export function convertToMelbourneTime(timestamp) {
  if (!timestamp) {
    throw new Error("Timestamp is required");
  }

  const melbourneTime = moment.tz(timestamp, "Australia/Melbourne");
  return melbourneTime.toISOString(true);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseStringify = (value: unknown) =>
  JSON.parse(JSON.stringify(value));

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date | string) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    // weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    year: "numeric", // numeric year (e.g., '2023')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-AU",
    dateTimeOptions,
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-AU",
    dateDayOptions,
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-AU",
    dateOptions,
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-AU",
    timeOptions,
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function encryptKey(passkey: string) {
  return btoa(passkey);
}

export function decryptKey(passkey: string) {
  return atob(passkey);
}

/**
 * ✅ Helper Function to Serialize BigInt
 * Converts BigInt values to String to prevent JSON serialization errors.
 */
export function serializeBigInt(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  } else if (obj !== null && typeof obj === "object") {
    const serializedObj: Record<string, unknown> = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        serializedObj[key] = obj[key].toString();
      } else if (obj[key] instanceof Date) {
        serializedObj[key] = obj[key].toISOString();
      } else {
        serializedObj[key] = serializeBigInt(obj[key]);
      }
    }
    return serializedObj;
  }
  return obj; // Return the original object if it's not an array or object
}

export async function validateISODateTime(datetime: string): void {
  if (!moment(datetime, moment.ISO_8601, true).isValid()) {
    throw new Error(
      "Invalid appointment_start_datetime format. Use ISO format: 'YYYY-MM-DDTHH:MM:SSZ' or with timezone offset.",
    );
  }
}

/**
 * Calculates the end time of an appointment given the start time and duration.
 * @param {string} startDatetime - Start time in ISO format.
 * @param {number} durationInMinutes - Duration of the appointment in minutes.
 * @returns {string} - End time in ISO format adjusted to Melbourne timezone.
 */
export async function calculateAppointmentEndTime(
  startDatetime: string,
  durationInMinutes: number,
): string {
  if (!durationInMinutes || durationInMinutes <= 0) {
    throw new Error("Duration must be a positive number.");
  }

  // Convert start time to Melbourne timezone
  const startTime = moment.tz(startDatetime, "Australia/Melbourne");

  if (!startTime.isValid()) {
    throw new Error("Invalid startDatetime provided for end time calculation.");
  }

  // Add duration
  const endTime = startTime.clone().add(durationInMinutes, "minutes");

  return endTime.toISOString(true); // Preserve Melbourne timezone offset
}

/**
 * Extracts only the date from a datetime string in Melbourne timezone.
 * @param {string} datetime - The ISO datetime string to extract the date from.
 * @returns {string} - The date in 'YYYY-MM-DD' format.
 */
export function extractDateFromMelbourneTime(datetime: string): string {
  const melbourneTime = moment.tz(datetime, "Australia/Melbourne");

  if (!melbourneTime.isValid()) {
    throw new Error("Invalid datetime provided for date extraction.");
  }

  // Extract only the date portion
  return melbourneTime.format("YYYY-MM-DD");
}

/**
 * Extracts the day of the week in ENUM format (e.g., MONDAY, TUESDAY)
 * from a datetime string in Melbourne timezone.
 *
 * @param {string} datetime - The ISO datetime string.
 * @returns {string} - The day of the week in uppercase ENUM format.
 */
export async function getDayOfWeekEnum(datetime: string): string {
  const melbourneTime = moment.tz(datetime, "Australia/Melbourne");

  if (!melbourneTime.isValid()) {
    throw new Error("Invalid datetime provided for day extraction.");
  }

  // Extract the day of the week and return in ENUM format
  return melbourneTime.format("dddd").toUpperCase();
}

/**
 * ✅ Format Time to ISO with Melbourne Timezone
 */
export async function formatDateTimeToMelbourne(
  date: string,
  time: string,
): string {
  if (!date || !time) {
    throw new Error("Both date and time must be provided.");
  }
  return convertToMelbourneTime(`${date}T${time}:00`);
}
