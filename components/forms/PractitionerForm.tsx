"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import { SelectItem } from "../ui/select";
import { useToast } from "@/hooks/use-toast"; // Toast Hook
import AddPractitionerButton from "@/components/AddPractitionerButton";

// ✅ Validation Schema
const PractitionerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  practitioner_type: z.string().min(1, "Practitioner type is required"),
  specialization: z.string().min(1, "Specialization is required"),
  bio: z.string().optional(),
});

interface PractitionerFormProps {
  clinicId: string;
  practitionerTypes: string[];
  specializations: string[];
  onClose: () => void;
}

const PractitionerForm = ({
  clinicId,
  practitionerTypes,
  specializations,
  onClose,
}: PractitionerFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // ✅ Add Loading State

  const form = useForm<z.infer<typeof PractitionerFormSchema>>({
    resolver: zodResolver(PractitionerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      practitioner_type: "",
      specialization: "",
      bio: "",
    },
  });

  /**
   * ✅ Handle Form Submission with Detailed Logs
   */
  const onSubmit = async (values: z.infer<typeof PractitionerFormSchema>) => {
    setIsLoading(true); // ✅ Set Loading State to True
    try {
      console.log("📥 Form Values Received:", values);

      const payload = {
        ...values,
        clinic_id: Number(clinicId),
      };

      console.log("📝 Payload Prepared for API Submission:", payload);

      const response = await fetch("/api/practitioners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📤 API Response Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Backend Error Details:", errorData);
        throw new Error(errorData.error || "Failed to add practitioner");
      }

      const responseData = await response.json();
      console.log("✅ API Response Data:", responseData);

      toast({
        title: "🎉 Practitioner Added",
        description: "The practitioner has been added successfully!",
        variant: "default",
        className:
          "bg-gray-900 text-gray-200 p-4 rounded-lg shadow-md border border-gray-700",
      });

      form.reset(); // Reset form fields
      onClose();
    } catch (err: any) {
      console.error("❌ Error adding practitioner:", err.message);
      toast({
        title: "❌ Error",
        description:
          err.message || "Failed to add practitioner. Please try again.",
        variant: "destructive",
        className:
          "bg-gray-900 text-gray-300 p-4 rounded-lg shadow-md border border-gray-700",
      });
    } finally {
      setIsLoading(false); // ✅ Set Loading State to False
    }
  };

  /**
   * ✅ Render Form
   */
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Practitioner Name"
          placeholder="Dr. John Doe"
        />

        {/* Email */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="email"
          label="Email"
          placeholder="example@clinic.com"
        />

        {/* Phone */}
        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="phone"
          label="Phone"
          placeholder="(123) 456-7890"
        />

        {/* Practitioner Type */}
        <CustomFormField
          fieldType={FormFieldType.SELECT}
          control={form.control}
          name="practitioner_type"
          label="Practitioner Type"
          placeholder="Select practitioner type"
        >
          {practitionerTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </CustomFormField>

        {/* Specialization (Single Select) */}
        <CustomFormField
          fieldType={FormFieldType.SELECT}
          control={form.control}
          name="specialization"
          label="Specialization"
          placeholder="Select specialization"
        >
          {specializations.map((spec) => (
            <SelectItem key={spec} value={spec}>
              {spec}
            </SelectItem>
          ))}
        </CustomFormField>

        {/* Bio */}
        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="bio"
          label="Bio"
          placeholder="Add practitioner bio"
        />

        {/* Submit Button with Loading State */}
        <AddPractitionerButton isLoading={isLoading} className="w-full">
          Add Practitioner
        </AddPractitionerButton>
      </form>
    </Form>
  );
};

export default PractitionerForm;
