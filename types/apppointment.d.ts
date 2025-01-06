declare type AppointmentStatus = "scheduled" | "cancelled" | "pending";

declare interface AppointmentPayload {
  practitioner_id: number;
  appointment_start_datetime: string;
  appointment_context?: string;
  status: AppointmentStatus;
}

interface CreateAppointmentBody {
  patient_id: number | bigint | undefined;
  clinic_id: number | bigint | undefined;
  practitioner_id?: number | bigint | null | undefined;
  duration: number;
  appointment_context?: string | null;
  status?: AppointmentStatus;
  appointment_start_datetime?: string;
}
