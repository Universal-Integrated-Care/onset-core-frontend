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

interface AblyAppointmentMessage {
  id: string;
  patient_id: string | null;
  patient: string;
  practitioner: string;
  clinic_id: number;
  appointment_start_datetime: string | null;
  duration: number;
  status: string;
  appointment_context: string | null;
  created_at: string;
  updated_at: string;
}
