declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = "Male" | "Female" | "Other";
declare type Status = "pending" | "scheduled" | "cancelled";

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
  status: Status;
  note: string | undefined;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId: string;
  appointment: Appointment;
  type: string;
};

declare interface PractitionerAvailabilityQuery {
  practitioner_id: bigint;
  is_blocked: boolean;
  date?: Date;
  start_time?: { gte: Date };
  end_time?: { lte: Date };
}

declare interface PatientBasic {
  id: string;
  first_name: string;
  last_name: string;
}

declare interface BlockedSlot {
  id: string;
  start_time: string;
  end_time: string;
  date: string;
  day_of_week: string;
  is_blocked: boolean;
  is_available: boolean;
}

declare interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    patientId?: string;
    patientName?: string;
    duration: number;
    status: string;
  };
}

declare interface Appointment {
  id: string;
  patient_id: string;
  appointment_start_datetime: string;
  duration: number;
  status: string;
  clinic_id: string;
}

declare interface StatCardProps {
  count: number;
  label: string;
  icon: string;
  type: "appointments" | "pending" | "cancelled";
}

declare interface DataTableRow {
  id: string;
  [key: string]: unknown;
}
