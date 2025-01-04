import { SerializableTurborepoAccessTraceResult } from "next/dist/build/turborepo-access-trace";
import { Models } from "node-appwrite";

// Or if it's an object type
export interface ClinicType {
  id: number;
  name: string;
  description?: string;
}

export interface Patient extends Models.Document {
  userId: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

export interface Clinic extends Models.Document {
  name: string;
  phone: string;
  address: string | null;
  id: bigint;
  url: string | null;
  description: string | null;
  clinic_context: string | null;
  opening_time: Date | null;
  closing_time: Date | null;
  clinic_type: ClinicType[]; // Ensure this type is defined
  days_opened: DayOfWeek[]; // Ensure this type is defined
  created_at: Date | null;
  updated_at: Date | null;
  clinicianEmail: string; // Add missing properties
  clinicianPhone: string; // Add missing properties
  userId: number; // Add missing properties
  // Add any other properties that are required
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status;
  primaryPhysician: string;
  reason: string;
  note: string;
  userId: string;
  cancellationReason: string | null;
}

// Define DayOfWeek as a union of string literals
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
