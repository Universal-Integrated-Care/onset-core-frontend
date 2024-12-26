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
  type: "edit" | "schedule" | "create" | "cancel";
  clinicId: string;
  appointmentId?: string;
}

// ✅ Main Component
const AppointmentForm = ({
  type,
  clinicId,
  appointmentId,
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
      const response = await fetch(`/api/practitioners/${clinicId}`);
      if (!response.ok) throw new Error("Failed to fetch practitioners list");
      const data = await response.json();
      setPractitioners(data.practitioners || []);
    } catch (err: any) {
      console.error("❌ Error fetching practitioners:", err.message);
      setError(err.message || "Failed to fetch practitioners list");
    }
  };

  /**
   * ✅ Fetch Appointment Details
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
    } catch (err: any) {
      console.error("❌ Error fetching appointment:", err.message);
      setError(err.message || "Failed to fetch appointment details");
    }
  };

  /**
   * ✅ Combined Data Fetching Logic
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await Promise.all([fetchPractitioners(), fetchAppointment()]);
      } catch (err: any) {
        console.error("❌ Error during fetch:", err.message);
        setError(err.message || "Failed to fetch initial data");
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
      const endpoint =
        type === "edit"
          ? `/api/appointments/${appointmentId}`
          : `/api/appointments`;

      const method = type === "edit" ? "PUT" : "POST";

      const payload = {
        ...values,
        clinic_id: clinicId,
        appointment_start_datetime:
          values.appointment_start_datetime.toISOString(),
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${type} appointment`);
      }
    } catch (err: any) {
      console.error("❌ Error submitting form:", err.message);
      setError(err.message || "Failed to submit the appointment");
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
    create: "Create Appointment",
    edit: "Submit Appointment",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {/* ✅ Header Section */}
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="text-2xl font-semibold">New Appointment</h1>
            <p className="text-gray-500">
              Request a new appointment in 10 seconds.
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            {/* ✅ Practitioner Dropdown */}
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

            {/* ✅ Date Picker */}
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="appointment_start_datetime"
              label="Expected appointment date"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />

            {/* ✅ Appointment Context */}
            <CustomFormField
              fieldType={FormFieldType.TEXTAREA}
              control={form.control}
              name="appointment_context"
              label="Appointment Context"
              placeholder="Add appointment notes"
            />
          </>
        )}

        {/* ✅ Submit Button */}
        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
