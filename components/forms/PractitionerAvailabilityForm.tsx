"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";
import { SelectItem } from "../ui/select";
import { formatDateTimeToMelbourne } from "@/lib/utils";
import moment from "moment";

/**
 * ✅ Zod Validation Schema
 * Ensures that time fields are non-empty strings and day_of_week or date is provided accordingly.
 */
const PractitionerAvailabilityFormSchema = z.object({
  day_of_week: z.string().optional(), // Only for recurring
  date: z.date().optional(), // Use Date for override
  start_time: z.date(), // Use Date for start time
  end_time: z.date(), // Use Date for end time
});

/**
 * ✅ Props
 */
interface PractitionerAvailabilityFormProps {
  type: "recurring" | "override";
  practitionerId: string;
  clinicId: string;
  onClose: (updatedData?: any) => void;
}

/**
 * ✅ PractitionerAvailabilityForm
 */
const PractitionerAvailabilityForm = ({
  type,
  practitionerId,
  clinicId,
  onClose,
}: PractitionerAvailabilityFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ React Hook Form with default values
  const form = useForm<z.infer<typeof PractitionerAvailabilityFormSchema>>({
    resolver: zodResolver(PractitionerAvailabilityFormSchema),
    defaultValues: {
      day_of_week: type === "recurring" ? "MONDAY" : undefined,
      date:
        type === "override"
          ? new Date().toISOString().split("T")[0]
          : undefined,
      start_time: new Date(), // Keep as Date object
      end_time: new Date(), // Keep as Date object
    },
  });

  /**
   * ✅ Submit Handler
   */
  const onSubmit = async (
    values: z.infer<typeof PractitionerAvailabilityFormSchema>,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Construct the payload
      // Construct the payload
      const payload: any = {
        practitioner_id: Number(practitionerId),
        start_time: moment(values.start_time).format("HH:mm"), // Format to time string
        end_time: moment(values.end_time).format("HH:mm"), // Format to time string
      };
      console.log("📤 Payload to API:", payload);

      if (type === "recurring") {
        payload.day_of_week = values.day_of_week; // e.g., "MONDAY"
        payload.is_available = true;
        payload.is_blocked = null;
      } else {
        payload.date = moment(values.date).format("YYYY-MM-DD"); // Format date to string
        payload.is_blocked = true;
        payload.is_available = null;
      }

      console.log("📤 Payload to API:", payload);

      // ✅ Make POST Request to /api/practitioner/availability
      const response = await fetch("/api/practitioners/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Handle any error response
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update availability");
      }

      // Success feedback
      const responseData = await response.json();
      console.log("✅ Availability updated successfully:", responseData);

      // If success, notify parent via onClose callback
      onClose(responseData.availability);
    } catch (err: any) {
      console.error("❌ Error updating availability:", err.message);
      setError(err.message || "Failed to update availability");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ✅ Render Loading & Error States
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        Updating availability...
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center">❌ {error}</div>;
  }

  /**
   * ✅ Main Render
   */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Toggle fields for recurring vs override */}
        {type === "recurring" ? (
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="day_of_week"
            label="Day of Week"
          >
            {[
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ].map((day) => (
              <SelectItem key={day} value={day}>
                {day}
              </SelectItem>
            ))}
          </CustomFormField>
        ) : (
          <CustomFormField
            fieldType={FormFieldType.PRACTITIONER_DATE_PICKER}
            control={form.control}
            name="date"
            label="Select Date"
            placeholder="YYYY-MM-DD"
          />
        )}

        {/* Start Time */}
        <CustomFormField
          fieldType={FormFieldType.TIME_PICKER}
          control={form.control}
          name="start_time"
          label="Start Time"
        />

        {/* End Time */}
        <CustomFormField
          fieldType={FormFieldType.TIME_PICKER}
          control={form.control}
          name="end_time"
          label="End Time"
        />

        {/* Submit */}
        <SubmitButton
          isLoading={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-colors"
        >
          Save
        </SubmitButton>
      </form>
    </Form>
  );
};

export default PractitionerAvailabilityForm;
