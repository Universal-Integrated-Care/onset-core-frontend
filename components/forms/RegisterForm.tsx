"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl } from "@/components/ui/form";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../submitButton";
import { useState } from "react";
import { RegisterFormValidation } from "@/lib/validation";
import { useRouter } from "next/navigation";
import { clinicType } from "@/constants";
import { SelectItem } from "@radix-ui/react-select";
import FileUploader from "../FileUploader";
import { useEffect } from "react"; // Add useEffect here

const RegisterForm = ({ user }: { user: User }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>("");

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
  // Add these debug logs
  console.log("Initial form values:", form.getValues());

  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log("Form values changed:", value);
      console.log("Current clinic type:", value.clinicType);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleProcessingComplete = (text: string) => {
    setExtractedText(text);
    console.log("Extracted text from files:", text);
  };

  async function onSubmit(values: z.infer<typeof RegisterFormValidation>) {
    console.log(values);
    setIsLoading(true);

    let formData = {
      name: values.name,
      phone: values.phone,
      address: values.address,
      clinicWebsite: values.clinicWebsite,
      clinicType: values.clinicType,
      clinicInformation: extractedText,
      monday: values.monday,
      tuesday: values.tuesday,
      wednesday: values.wednesday,
      thursday: values.thursday,
      friday: values.friday,
      saturday: values.saturday,
      sunday: values.sunday,
      mondayOpenTime: values.mondayOpenTime,
      mondayCloseTime: values.mondayCloseTime,
      tuesdayOpenTime: values.tuesdayOpenTime,
      tuesdayCloseTime: values.tuesdayCloseTime,
      wednesdayOpenTime: values.wednesdayOpenTime,
      wednesdayCloseTime: values.wednesdayCloseTime,
      thursdayOpenTime: values.thursdayOpenTime,
      thursdayCloseTime: values.thursdayCloseTime,
      fridayOpenTime: values.fridayOpenTime,
      fridayCloseTime: values.fridayCloseTime,
      saturdayOpenTime: values.saturdayOpenTime,
      saturdayCloseTime: values.saturdayCloseTime,
      sundayOpenTime: values.sundayOpenTime,
      sundayCloseTime: values.sundayCloseTime,
    };

    try {
      console.log(formData, "form data");
      if (user) {
        // router.push(`/dashboard/${user.$id}/register`);
      }
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
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="monday"
                label="Monday"
              />
            </div>

            {form.watch("monday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="mondayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="mondayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="tuesday"
                label="Tuesday"
              />
            </div>

            {form.watch("tuesday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="tuesdayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="tuesdayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="wednesday"
                label="Wednesday"
              />
            </div>

            {form.watch("wednesday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="wednesdayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="wednesdayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="thursday"
                label="Thursday"
              />
            </div>

            {form.watch("thursday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="thursdayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="thursdayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="friday"
                label="Friday"
              />
            </div>

            {form.watch("friday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="fridayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="fridayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="saturday"
                label="Saturday"
              />
            </div>

            {form.watch("saturday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="saturdayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="saturdayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-32">
              <CustomFormField
                fieldType={FormFieldType.CHECKBOX}
                control={form.control}
                name="sunday"
                label="Sunday"
              />
            </div>

            {form.watch("sunday") && (
              <div className="flex items-center gap-4 flex-1">
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="sundayOpenTime"
                  placeholder="Opening Time"
                />
                <span className="text-dark-700">to</span>
                <CustomFormField
                  fieldType={FormFieldType.TIME_PICKER}
                  control={form.control}
                  name="sundayCloseTime"
                  placeholder="Closing Time"
                />
              </div>
            )}
          </div>
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
