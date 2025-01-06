/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

declare type Gender = "Male" | "Female" | "Other";

declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}
declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
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
  medicareNumber: string | undefined;
  identificationType: string | undefined;
  identificationNumber: string | undefined;
  identificationDocument: FormData | undefined;
  privacyConsent: boolean;
}

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: AppointmentStatus;
  note: string | undefined;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  appointment: Appointment;
  type: string;
};

interface FormValuesAll {
  email: string;
  password: string;
  phone: E164Number;
}

declare interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  patient_type: string;
  medicare_number: string;
  medicare_expiry: string;
  created_at: string;
  updated_at: string;
}

declare interface PatientsResponse {
  patients: Patient[];
}

interface Appointment {
  id: number;
  patient_id: number;
  appointment_start_datetime: string;
  duration: number;
  status: AppointmentStatus;
  patient_name: string;
}

interface AppointmentsResponse {
  appointments: Appointment[];
}

interface BlockedSlot {
  id: number;
  start_time: string;
  end_time: string;
}

interface BlockedSlotsResponse {
  blockedSlots: BlockedSlot[];
}

declare interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  status?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    patientId?: string;
    patientName?: string;
    duration?: number;
    status: string;
  };
}
