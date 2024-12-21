"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";
import { useState } from "react";
import { RegisterFormValidation } from "@/lib/validation";
import { createUser } from "@/lib/actions/clinic.action";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/actions/clinic.action";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { clinicType, GenderOptions, dayOfWeek } from "@/constants";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@radix-ui/react-select";
import FileUploader from "../FileUploader";
import { extractTextFromFiles } from "@/lib/parsers/fileParser";
import { useEffect } from "react"; // Add useEffect here

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof RegisterFormValidation>>({
    resolver: zodResolver(RegisterFormValidation),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      clinicWebsite: "",
      clinicType: "GENERAL_PRACTICE" as const, // Force it to be type-safe
      clinicInformation: [],
      daysOpened: [],
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    mode: "onChange",
  });
  // Add these debug logs
  console.log("Initial form values:", form.getValues());
  console.log("Default clinic type:", clinicType[0].value);

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values changed:", value);
      console.log("Current clinic type:", value.clinicType);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: z.infer<typeof RegisterFormValidation>) {
    console.log(values);
    setIsLoading(true);

    let formData = {
      name: values.name,
      phone: values.phone,
      address: values.address,
      clinicWebsite: values.clinicWebsite,
      clinicType: values.clinicType,
      daysOpened: values.daysOpened,
      clinicInformation: "",
    };

    // Extract and combine text from uploaded files
    if (values.clinicInformation && values.clinicInformation.length > 0) {
      formData.clinicInformation = await extractTextFromFiles(
        values.clinicInformation,
      );
      console.log(await formData.clinicInformation);
    }
    try {
      console.log(formData);
      // if (user) {
      //   router.push(`/clinics/${user.$id}/register`);
      // }
    } catch (e) {
      console.error(e);
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

        <section className="mb-12 space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Clinic Information</h2>
          </div>
        </section>

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

        <div className="flex flex-col gap-6 xl:flex-row">
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="address"
            label="Address"
            placeholder="14 Street Melbourne"
          />
        </div>

        {/* <section className="mb-12 space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Clinic Information</h2>
          </div>
        </section> */}
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
              <FileUploader files={field.value} onChange={field.onChange} />
            </FormControl>
          )}
        />

        <section className="space-y-6">
          <div className="mb-9 space-y-1">
            <h2 className="sub-header">Days Opened</h2>
          </div>

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="Monday"
            label="Monday"
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="tuesday"
            label="Tuesday"
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="wednesday"
            label="Wednesday"
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="thursday"
            label="Thursday"
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="friday"
            label="Friday"
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="saturday"
            label="Saturday"
          />

          <CustomFormField
            fieldType={FormFieldType.CHECKBOX}
            control={form.control}
            name="sunday"
            label="Sunday"
          />
        </section>

        <div className="flex flex-col gap-6 xl:flex-row"></div>
        <div className="flex flex-col gap-6 xl:flex-row"></div>
        <div className="flex flex-col gap-6 xl:flex-row"></div>

        <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
      </form>
    </Form>
  );
};

export default RegisterForm;
