import { z } from "zod";
import { clinicType, dayOfWeek, GenderOptions } from "@/constants";

export const ClinicFormValidation = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
});

export const RegisterFormValidation = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),
    phone: z
      .string()
      .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(500, "Address must be at most 500 characters"),
    clinicWebsite: z
      .string()
      .min(5, "Must be at least 5 characters")
      .optional(),
    clinicType: z
      .enum(clinicType.map((type) => type.value) as [string, ...string[]])
      .default(clinicType[0].value), // This ensures it defaults to "GENERAL_PRACTICE"
    clinicInformation: z.string(),
    // Individual day fields
    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),
    mondayOpenTime: z.date().nullable(),
    mondayCloseTime: z.date().nullable(),
    tuesdayOpenTime: z.date().nullable(),
    tuesdayCloseTime: z.date().nullable(),
    wednesdayOpenTime: z.date().nullable(),
    wednesdayCloseTime: z.date().nullable(),
    thursdayOpenTime: z.date().nullable(),
    thursdayCloseTime: z.date().nullable(),
    fridayOpenTime: z.date().nullable(),
    fridayCloseTime: z.date().nullable(),
    saturdayOpenTime: z.date().nullable(),
    saturdayCloseTime: z.date().nullable(),
    sundayOpenTime: z.date().nullable(),
    sundayCloseTime: z.date().nullable(),
    // Keep daysOpened for final form submission
    daysOpened: z
      .array(z.enum([...dayOfWeek] as [string, ...string[]]))
      .optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one day is selected
      return (
        data.monday ||
        data.tuesday ||
        data.wednesday ||
        data.thursday ||
        data.friday ||
        data.saturday ||
        data.sunday
      );
    },
    {
      message: "Please select at least one day",
      path: ["daysOpened"], // This will show the error message on the days section
    },
  );

export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Select at least one doctor"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "Reason must be at least 2 characters")
    .max(500, "Reason must be at most 500 characters"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}
