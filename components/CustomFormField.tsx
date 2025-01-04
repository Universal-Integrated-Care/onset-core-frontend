"use client";
import React, { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldValues } from "react-hook-form";
import Image from "next/image";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { E164Number } from "libphonenumber-js/core";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export enum FormFieldType {
  INPUT = "input",
  PASSWORD = "password",
  CHECKBOX = "checkbox",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  DATE_PICKER = "datePicker",
  TIME_PICKER = "timePicker",
  SELECT = "select",
  SKELETON = "skeleton",
  PRACTITIONER_DATE_PICKER = "practitionerDatePicker", // ✅ Add new type
}

interface CustomProps {
  control: Control<Record<string, unknown>>;
  fieldType: FormFieldType;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  dateformat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: {
    value: unknown;
    onChange: (value: unknown) => void;
  }) => React.ReactNode;
}

const RenderField = ({
  field,
  props,
}: {
  field: FieldValues;
  props: CustomProps;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          {props.iconSrc && (
            <Image
              src={props.iconSrc}
              height={24}
              width={24}
              alt={props.iconAlt || "icon"}
              className="ml-2"
            />
          )}
          <FormControl>
            <Input
              placeholder={props.placeholder}
              {...field}
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      );

    case FormFieldType.PASSWORD:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          {props.iconSrc && (
            <Image
              src={props.iconSrc}
              height={24}
              width={24}
              alt={props.iconAlt || "icon"}
              className="ml-2"
            />
          )}
          <FormControl>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={props.placeholder}
                {...field}
                className="shad-input border-0 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </FormControl>
        </div>
      );

    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="AU"
            placeholder={props.placeholder}
            international
            withCountryCallingCode
            value={(field.value as E164Number) || undefined}
            onChange={field.onChange}
            className="input-phone"
          />
        </FormControl>
      );

    case FormFieldType.DATE_PICKER:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          <Image
            src="/assets/icons/calendar.svg"
            height={24}
            width={24}
            alt="calendar"
            className="ml-2"
          />
          <FormControl>
            <DatePicker
              selected={
                field.value instanceof Date
                  ? field.value
                  : new Date(field.value)
              }
              onChange={(date) => field.onChange(date)}
              dateFormat={props.dateformat ?? "yyyy-MM-dd HH:mm"}
              showTimeSelect={props.showTimeSelect ?? false}
              timeIntervals={15}
              timeFormat="HH:mm"
              timeCaption="Time"
              placeholderText={props.placeholder}
              wrapperClassName="date-picker"
            />
          </FormControl>
        </div>
      );
    case FormFieldType.PRACTITIONER_DATE_PICKER:
      return (
        <div className="flex rounded-md border border-dark-500 bg-dark-400">
          <Image
            src="/assets/icons/calendar.svg"
            height={24}
            width={24}
            alt="calendar"
            className="ml-2"
          />
          <FormControl>
            <DatePicker
              selected={
                field.value instanceof Date
                  ? field.value
                  : new Date(field.value)
              }
              onChange={(date) => field.onChange(date)}
              dateFormat="yyyy-MM-dd" // Ensures only the date is shown
              placeholderText={props.placeholder}
              wrapperClassName="date-picker"
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      );

    case FormFieldType.TIME_PICKER:
      return (
        <div className="flex rounded-md border-dark-500 bg-dark-400">
          <Image
            src="/assets/icons/clock.svg"
            height={24}
            width={24}
            alt="clock"
            className="ml-2"
          />
          <FormControl>
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={30}
              timeCaption=""
              dateFormat="h:mm aa"
              timeFormat="h:mm aa"
              placeholderText={props.placeholder}
              wrapperClassName="date-picker"
            />
          </FormControl>
        </div>
      );

    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            onValueChange={(value) => {
              if (value) {
                console.log("Select value changing to:", value);
                field.onChange(value);
              }
            }}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <SelectTrigger className="shad-select-trigger">
                <SelectValue placeholder={props.placeholder}>
                  {field.value &&
                    props.children &&
                    Array.isArray(React.Children.toArray(props.children)) &&
                    React.Children.toArray(props.children).find(
                      (
                        child,
                      ): child is React.ReactElement<{
                        value: unknown;
                        children?: React.ReactNode;
                      }> =>
                        React.isValidElement(child) &&
                        typeof child.props === "object" &&
                        child.props !== null &&
                        "value" in child.props,
                    )?.props?.value === field.value &&
                    React.Children.toArray(props.children).find(
                      (
                        child,
                      ): child is React.ReactElement<{
                        value: unknown;
                        children?: React.ReactNode;
                      }> =>
                        React.isValidElement(child) &&
                        typeof child.props === "object" &&
                        child.props !== null &&
                        "value" in child.props &&
                        child.props.value === field.value,
                    )?.props?.children}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="shad-select-content">
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );

    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            className="shad-textArea"
            disabled={props.disabled}
          />
        </FormControl>
      );

    case FormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-4">
            <Checkbox
              id={props.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label htmlFor={props.name} className="checkbox-label">
              {props.label}
            </label>
          </div>
        </FormControl>
      );

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;

    default:
      break;
  }
};

const CustomFormField = (props: CustomProps) => {
  const { control, fieldType, name, label } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel>{label}</FormLabel>
          )}
          <RenderField field={field} props={props} />
          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
