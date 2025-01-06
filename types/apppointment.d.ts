declare type AppointmentStatus = "scheduled" | "cancelled" | "pending";

declare interface AppointmentPayload {
  practitioner_id: number;
  appointment_start_datetime: string;
  appointment_context?: string;
  status: AppointmentStatus;
}
