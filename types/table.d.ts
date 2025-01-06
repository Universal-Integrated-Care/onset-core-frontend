// types/appointment.ts
declare type AppointmentStatus = "scheduled" | "cancelled" | "pending";

declare interface Appointment {
  id: string;
  patient: string;
  status: AppointmentStatus;
  appointment_start_datetime: string;
  practitioner: string;
  clinic_id: string;
  patient_id: string;
  practitioner_id: number | null;
  duration: number;
  appointment_context: string | null;
  created_at: string;
  updated_at: string;
}

declare type UpdateData = Partial<{
  status: AppointmentStatus;
  appointment_start_datetime: string;
}>;

declare interface AppointmentModalProps {
  type: "schedule" | "cancel";
  patientId: string;
  appointmentId?: string;
  clinicId: string;
  onUpdate?: (updatedData: UpdateData) => void;
}

declare interface AppointmentFormProps {
  type: "schedule" | "cancel";
  clinicId: string;
  appointmentId: string;
  onClose: (updatedData: UpdateData) => void;
}

declare interface BaseData {
  id: string;
}

declare interface DataTableProps<TData extends BaseData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  clinicId: string;
  onRowUpdate?: (updatedData: UpdateData, rowId: string) => void;
}

declare type TableMeta = {
  handleRowUpdate?: (updatedData: UpdateData, rowId: string) => void;
};
