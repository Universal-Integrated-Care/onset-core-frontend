"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";
import { useState } from "react";
import { ClinicFormValidation } from "@/lib/validation";
import { createUser } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import { SelectItem } from "@/components/ui/select";
import { clinicType } from "@/constants";

const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
}: {
  userId: string;
  patientId: string;
  type: "create" | "cancel";
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof ClinicFormValidation>>({
    resolver: zodResolver(ClinicFormValidation),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
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
      // setIsLoading(false);
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
            <h1 className="header">Appointment Confirmation</h1>
            <p className="text-dark-700">
              Finalize the appointment details below.
            </p>
          </section>

          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <CustomFormField
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="clinicType"
            label="Clinic Type"
            placeholder="Select Clinic Type"
          >
            {clinicType.map((clinic, i) => (
              <SelectItem key={`clinic-type-${i}`} value={clinic.value}>
                <div className="flex cursor-pointer items-center gap-2">
                  <p>{clinic.label}</p>
                </div>
              </SelectItem>
            ))}
          </CustomFormField>
          <CustomFormField
            control={form.control}
            fieldType={FormFieldType.DATE_PICKER}
            name={`Schedule`}
            label="Expected Appointment Date"
            showTimeSelect
            placeholder="Opening Time"
            dateformat="dd/MM/yyyy h:mm aa"
          />
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="address"
            label="Address"
            placeholder="14 Street Melbourne"
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

export default AppointmentForm;
