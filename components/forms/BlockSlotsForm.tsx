"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";

// ✅ Define Zod Schema for Validation
const BlockSlotsFormSchema = z.object({
  start_datetime: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date(),
    )
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid start date format",
    }),
  end_datetime: z
    .preprocess(
      (val) => (typeof val === "string" ? new Date(val) : val),
      z.date(),
    )
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid end date format",
    }),
  is_blocked: z.boolean().default(true),
});

// ✅ Define Props
interface BlockSlotsFormProps {
  apiUrl: string; // API URL passed as a prop
  onClose: () => void; // Optional callback for closing modal
}

// ✅ Main Component
const BlockSlotsForm = ({ apiUrl, onClose }: BlockSlotsFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof BlockSlotsFormSchema>>({
    resolver: zodResolver(BlockSlotsFormSchema),
    defaultValues: {
      start_datetime: new Date(),
      end_datetime: new Date(),
      is_blocked: true,
    },
  });

  /**
   * ✅ Generic API Request Function
   */
  const apiRequest = async (
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
    payload?: Record<string, unknown>,
  ) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process request");
      }

      return await response.json();
    } catch (error: Error | unknown) {
      console.error(
        `❌ API Request Error (${method} ${url}):`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  };

  /**
   * ✅ Handle Form Submission
   */
  const onSubmit = async (values: z.infer<typeof BlockSlotsFormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        start_datetime: values.start_datetime.toISOString(),
        end_datetime: values.end_datetime.toISOString(),
        is_blocked: values.is_blocked,
      };

      await apiRequest(apiUrl, "POST", payload);

      console.log("✅ Slots blocked successfully");
      onClose?.(); // Close modal if onClose is provided
    } catch (err: Error | unknown) {
      console.error(
        "❌ Error blocking slots:",
        err instanceof Error ? err.message : err,
      );
      setError(err instanceof Error ? err.message : "Failed to block slots");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ✅ Render Form
   */
  return (
    <div className="p-6 bg-gray-800 text-gray-200 rounded-lg shadow-2xl max-w-lg mx-auto mt-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">
        🗓️ Block Practitioner Slots
      </h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Select the start and end datetime for blocking slots.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 animate-fade-in"
        >
          {/* ✅ Start DateTime Picker */}
          <div className="p-4 bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="start_datetime"
              label="Start Date & Time"
              placeholder="Select Start Date & Time"
              showTimeSelect
              dateformat="yyyy-MM-dd HH:mm"
            />
          </div>

          {/* ✅ End DateTime Picker */}
          <div className="p-4 bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="end_datetime"
              label="End Date & Time"
              placeholder="Select End Date & Time"
              showTimeSelect
              dateformat="yyyy-MM-dd HH:mm"
            />
          </div>

          {/* ✅ Submit Button */}
          <SubmitButton
            isLoading={isLoading}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-md w-full transition-all"
          >
            {isLoading ? "Blocking..." : "Block Slots"}
          </SubmitButton>

          {/* ✅ Error Message */}
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-900 rounded-md p-2 mt-2">
              {error}
            </p>
          )}
        </form>
      </Form>

      {/* ✅ Footer */}
      <div className="mt-6 text-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
};

export default BlockSlotsForm;
