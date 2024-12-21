import { SerializableTurborepoAccessTraceResult } from "next/dist/build/turborepo-access-trace";
import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  name: string;
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
  clinicianEmail: string; // Changed from email to clinicianEmail
  clinicianPhone: string; // Added clinicianPhone
  userId: string;
  address: string;
  url: string;
  description: string;
  clinicContext: string;
  openingTime: string;
  closingTime: string;
  clinicType: string;
  clinicImage: string;
  clinicianName: string; // No change
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
