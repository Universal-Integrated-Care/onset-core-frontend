"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyUserCredentials } from "@/lib/actions/user.action";

const LoginFormValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

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

  async function onSubmit(values: z.infer<typeof LoginFormValidation>) {
    setIsLoading(true);
    setError("");

    try {
      const result = await verifyUserCredentials(values);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        // Check if user has completed registration
        if (!result.user.hasClinic) {
          // Store user ID for registration completion
          localStorage.setItem(
            "registration_user_id",
            result.user.id.toString(),
          );
          router.push(`/clinics/${result.user.id}/register`);
          return;
        }

        // If registration is complete, store session and redirect to dashboard
        if (result.session) {
          localStorage.setItem("session_token", result.session.session_token);
          router.push("/dashboard");
        }
      }
    } catch (e) {
      console.error(e);
      setError("An error occurred during login");
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
            <h1 className="header">Welcome Back 🤗</h1>
            <p className="text-dark-700">Log in to your Onset account.</p>
          </section>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
            placeholder="johndoe@gmail.com"
            iconSrc="/assets/icons/email.svg"
            iconAlt="email"
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

      <button
        type="button"
        className="shad-button_outline w-full mt-4"
        onClick={(e) => {
          e.preventDefault();
          router.push("/");
        }}
      >
        Don't have an account? Sign up here
      </button>
    </div>
  );
};

export default LoginForm;
