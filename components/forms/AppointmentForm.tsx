"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { updateAppointment } from "@/lib/actions/appointment.action";

// ✅ Define Zod Schema for Validation
const AppointmentFormSchema = z.object({
  practitioner_id: z.string().min(1, "Practitioner is required"),
  appointment_context: z.string().optional(),
  appointment_start_datetime: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date(),
    )
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid date format",
    }),
});

// ✅ Define Props
interface AppointmentFormProps {
  type: "schedule" | "cancel" | "reschedule";
  clinicId: string;
  appointmentId?: string;
  onClose: (
    updatedData: Partial<{
      status: AppointmentStatus;
      appointment_start_datetime: string;
    }>,
  ) => void; // Pass updated data back
}

// ✅ Main Component
const AppointmentForm = ({
  type,
  clinicId,
  appointmentId,
  onClose,
}: AppointmentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [practitioners, setPractitioners] = useState<
    { id: string; name: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof AppointmentFormSchema>>({
    resolver: zodResolver(AppointmentFormSchema),
    defaultValues: {
      practitioner_id: "",
      appointment_context: "",
      appointment_start_datetime: new Date(),
    },
  });

  /**
   * ✅ Fetch Practitioners
   */
  const fetchPractitioners = async () => {
    try {
      const response = await fetch(`/api/practitioners/clinics/${clinicId}`);
      if (!response.ok) throw new Error("Failed to fetch practitioners list");
      const data = await response.json();
      setPractitioners(data.practitioners || []);
    } catch (err: unknown) {
      console.error(
        "❌ Error fetching appointment:",
        err instanceof Error ? err.message : "Unknown error",
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch appointment details",
      );
    }
  };

  /**
   * ✅ Fetch Appointment Details for Prefill
   */
  const fetchAppointment = async () => {
    if (!appointmentId) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      if (!response.ok) throw new Error("Failed to fetch appointment details");
      const { appointment } = await response.json();

      form.reset({
        practitioner_id: appointment?.practitioner?.id?.toString() || "",
        appointment_context: appointment?.appointment_context || "",
        appointment_start_datetime: appointment?.appointment_start_datetime
          ? new Date(appointment.appointment_start_datetime)
          : new Date(),
      });
    } catch (err: unknown) {
      console.error(
        "❌ Error fetching appointment:",
        err instanceof Error ? err.message : "Unknown error",
      );
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch appointment details",
      );
    }
  };

  /**
   * ✅ Initial Data Fetching
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([fetchPractitioners(), fetchAppointment()]);
      } catch (err: unknown) {
        console.error("❌ Error during fetch:", err);
        setError(err instanceof Error ? err.message : `Failed to fetch data`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clinicId, appointmentId]);

  /**
   * ✅ Handle Form Submission
   */
  const onSubmit = async (values: z.infer<typeof AppointmentFormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!appointmentId) {
        throw new Error("Appointment ID is required for updates.");
      }

      const payload: AppointmentPayload = {
        practitioner_id: Number(values.practitioner_id),
        appointment_start_datetime:
          values.appointment_start_datetime.toISOString(),
        appointment_context: values.appointment_context,
        status: type === "cancel" ? "cancelled" : "scheduled",
      };

      await updateAppointment(Number(appointmentId), payload);

      console.log(
        `✅ Appointment ${type === "cancel" ? "Cancelled" : "Scheduled"} successfully`,
      );
      console.log("✅ Form submission succeeded, sending update:", {
        status: payload.status,
        appointment_start_datetime: payload.appointment_start_datetime,
      });
      // ✅ Close modal and pass updated data back
      onClose({
        status: payload.status as AppointmentStatus,
        appointment_start_datetime: payload.appointment_start_datetime,
      });
      window.location.reload();
    } catch (err: unknown) {
      console.error(
        "❌ Error submitting form:",
        err instanceof Error ? err.message : "Unknown error",
      );
      setError(
        err instanceof Error ? err.message : `Failed to ${type} appointment`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ✅ Determine Button Label
   */
  const buttonLabel = {
    cancel: "Cancel Appointment",
    schedule: "Schedule Appointment",
    reschedule: "Reschedule Appointment",
  }[type];

  /**
   * ✅ Loading State
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        🔄 Loading appointment details, please wait...
      </div>
    );
  }

  /**
   * ✅ Error State
   */
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        ❌ {error}
      </div>
    );
  }

  /**
   * ✅ Render Form
   */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {/* ✅ Practitioner Dropdown */}
        {type === "schedule" && (
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="practitioner_id"
            label="Doctor"
            placeholder="Select a doctor"
          >
            {practitioners.map((practitioner) => (
              <SelectItem
                key={practitioner.id}
                value={practitioner.id.toString()}
              >
                <div className="flex items-center gap-2">
                  <Image
                    src="/assets/images/dr-powell.png"
                    width={32}
                    height={32}
                    alt="doctor"
                    className="rounded-full border border-gray-300"
                  />
                  <p>{practitioner.name}</p>
                </div>
              </SelectItem>
            ))}
          </CustomFormField>
        )}

        {/* ✅ Date Picker */}
        <CustomFormField
          fieldType={FormFieldType.DATE_PICKER}
          control={form.control}
          name="appointment_start_datetime"
          label="Expected appointment date"
          showTimeSelect
          dateformat="yyyy-MM-dd - h:mm aa"
        />

        {/* ✅ Appointment Context */}
        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="appointment_context"
          label="Appointment Context"
          placeholder="Add appointment notes"
        />

        {/* ✅ Submit Button */}
        <SubmitButton
          isLoading={isLoading}
          className={`${
            type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"
          } w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
