"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../submitButton";
import { useState } from "react";
import { ClinicFormValidation } from "@/lib/validation";
import { createUser } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";

export enum FormFieldType {
  INPUT = "input",
  PASSWORD = "password",
  CHECKBOX = "checkbox",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

const ClinicForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof ClinicFormValidation>>({
    resolver: zodResolver(ClinicFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof ClinicFormValidation>) {
    setIsLoading(true);
    setError("");

    try {
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      const result = await createUser(userData);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        router.push(`/clinics/${result.user.id}/register`);
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-6"
        >
          <section className="mb-12 space-y-4">
            <h1 className="header">Hi there 👋</h1>
            <p className="text-dark-700">Get started with Onset.</p>
          </section>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Clinician name"
            placeholder="John Doe"
            iconSrc="/assets/icons/user.svg"
            iconAlt="user"
          />

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Clinician Email"
            placeholder="johndoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />

          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Mobile number"
            placeholder="(555) 123-4567"
          />

          <CustomFormField
            fieldType={FormFieldType.PASSWORD}
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            iconSrc="/assets/icons/lock.svg"
            iconAlt="password"
          />

          <CustomFormField
            fieldType={FormFieldType.PASSWORD}
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
            iconSrc="/assets/icons/lock.svg"
            iconAlt="password"
          />

          <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
        </form>
      </Form>
      <button
        type="button"
        className="shad-button_outline w-full mt-4"
        onClick={(e) => {
          e.preventDefault();
          router.push("/login");
        }}
      >
        Already have an account? Login here
      </button>
    </div>
  );
};

export default ClinicForm;
