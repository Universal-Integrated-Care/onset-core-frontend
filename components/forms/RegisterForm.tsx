"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";
import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";
import { useState, useEffect } from "react";
import { RegisterFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { clinicType } from "@/constants";
import { SelectItem } from "@radix-ui/react-select";
import FileUploader from "../FileUploader";
import { createClinic } from "@/lib/actions/registration.action";

interface User {
  id: number;
  email: string;
  name: string;
}

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState<string>("");

  const form = useForm<z.infer<typeof RegisterFormValidation>>({
    resolver: zodResolver(RegisterFormValidation),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      clinicWebsite: "",
      clinicType: "GENERAL_PRACTICE" as const,
      clinicInformation: "",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      mondayOpenTime: null,
      mondayCloseTime: null,
      tuesdayOpenTime: null,
      tuesdayCloseTime: null,
      wednesdayOpenTime: null,
      wednesdayCloseTime: null,
      thursdayOpenTime: null,
      thursdayCloseTime: null,
      fridayOpenTime: null,
      fridayCloseTime: null,
      saturdayOpenTime: null,
      saturdayCloseTime: null,
      sundayOpenTime: null,
      sundayCloseTime: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values changed:", value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleProcessingComplete = (text: string) => {
    setExtractedText(text);
    form.setValue("clinicInformation", text); // Update the form state directly
    console.log("Extracted text from files:", text);
  };

  /**
   * ✅ Handle Form Submission
   */
  async function onSubmit(values: z.infer<typeof RegisterFormValidation>) {
    setIsLoading(true);
    setError("");

    try {
      console.log("Form values submitted:", values);

      const result = await createClinic({
        userId: user.id,
        formData: values,
      });


      if (result.error) {
        console.error("Error from createClinic:", result.error);
        setError(result.error);
        return;
      }

      if (result.clinic) {
        console.log("Clinic created successfully:", result.clinic);

        // ✅ Redirect based on first-time registration flag
        if (result.isFirstTimeRegistration) {
          router.push("/login");
        } else {
          router.push(`/clinics/${result.clinic.id}/dashboard`);
        }
      } else {
        setError("Failed to retrieve clinic ID after creation.");
      }
    } catch (e) {
      console.error("Error during clinic registration:", e);
      setError("An unexpected error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-1 space-y-12"
      >
        <section className="mb-12 space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">Let us know about your Clinic</p>
        </section>

        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <CustomFormField
          fieldType={FormFieldType.INPUT}
          control={form.control}
          name="name"
          label="Clinic name"
          placeholder="John Doe"
          iconSrc="/assets/icons/user.svg"
          iconAlt="user"
        />

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="clinicWebsite"
            label="Clinic Website"
            placeholder="www.healthlifeclinic.com"
            iconSrc="/assets/icons/website.svg"
            iconAlt="website"
          />
          <CustomFormField
            fieldType={FormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone Number"
            placeholder="(555) 123-4567"
          />
        </div>

        <CustomFormField
          fieldType={FormFieldType.TEXTAREA}
          control={form.control}
          name="address"
          label="Address"
          placeholder="14 Street Melbourne"
        />

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
          fieldType={FormFieldType.SKELETON}
          control={form.control}
          name="clinicInformation"
          label="Clinic Information"
          renderSkeleton={(field) => (
            <FormControl>
              <FileUploader
                files={field.value}
                onChange={field.onChange}
                onProcessingComplete={handleProcessingComplete}
              />
            </FormControl>  
          )}
        />

        {/* Days Opened */}
        {[
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ].map((day) => (
          <div key={day} className="flex items-center gap-4">
            <CustomFormField
              fieldType={FormFieldType.CHECKBOX}
              control={form.control}
              name={day}
              label={day.charAt(0).toUpperCase() + day.slice(1)}
            />
          {form.watch(day as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday") && (                
            <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name={`${day}OpenTime`}
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name={`${day}CloseTime`}
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
        ))}

        <SubmitButton isLoading={isLoading}>Register Clinic</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
