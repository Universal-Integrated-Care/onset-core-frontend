"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyUserCredentials } from "@/lib/actions/user.action";

// Validation Schema
const LoginFormValidation = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Enum for Field Types
export enum FormFieldType {
  INPUT = "input",
  PASSWORD = "password",
}

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof LoginFormValidation>>({
    resolver: zodResolver(LoginFormValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle Form Submission
  async function onSubmit(values: z.infer<typeof LoginFormValidation>) {
    setIsLoading(true);
    setError("");

    try {
      const result = await verifyUserCredentials(values);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user && result.session?.session_token) {
        // Save session token in cookies
        document.cookie = `session_token=${result.session.session_token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=604800`;

        if (!result.user.hasClinic) {
          // Redirect to clinic registration if no clinic is associated
          router.push(`/clinics/${result.user.id}/register`);
          return;
        }

        // Redirect to the clinic dashboard
        router.push(`/clinics/${result.user.clinicId}/dashboard`);
      } else {
        setError("Failed to authenticate. Please try again.");
      }
    } catch (e) {
      console.error("Login Error:", e);
      setError("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* Form Wrapper */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 space-y-6"
        >
          {/* Header Section */}
          <section className="mb-12 space-y-4">
            <h1 className="header">Welcome 🤗</h1>
            <p className="text-dark-700">Please try Log in to your Onset account.</p>
          </section>

          {/* Error Message */}
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          {/* Email Field */}
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="johndoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
          />

          {/* Password Field */}
          <CustomFormField
            fieldType={FormFieldType.PASSWORD}
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            iconSrc="/assets/icons/lock.svg"
            iconAlt="password"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="shad-button_primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex-center gap-2">
                <div className="spinner" /> Loading...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </Form>

      {/* Signup Redirect Button */}
      <button
        type="button"
        className="shad-button_outline w-full mt-4"
        onClick={() => router.push("/signup")}
      >
        Don't have an account? Sign up here
      </button>
    </div>
  );
};

export default LoginForm;
