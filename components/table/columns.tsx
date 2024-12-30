"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import Image from "next/image";
import AppointmentModal from "../AppointmentModal";
import StatusBadge from "../StatusBadge";
import { formatDateTime } from "@/lib/utils";

// ✅ Define Appointment Type
export type Appointment = {
  id: string;
  patient: string;
  status: "scheduled" | "cancelled";
  appointment_start_datetime: string;
  practitioner: string;
  clinic_id: string;
  patient_id: string;
};

// ✅ Define Columns
export const columns: ColumnDef<Appointment>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "patient",
    header: "Patient",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => <p className="text-14-medium">{row.original.patient}</p>,
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => (
      <div className="min-w-[115px]">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "appointment_start_datetime",
    header: "Appointment Time",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => (
      <p className="text-14-regular min-w-[100px]">
        {formatDateTime(row.original.appointment_start_datetime).dateTime}
      </p>
    ),
  },
  {
    accessorKey: "practitioner",
    header: "Doctor",
    enableSorting: true,
    enableColumnFilter: true,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Image
          src={"/assets/images/dr-remirez.png"}
          alt={row.original.practitioner || "Unknown Practitioner"}
          width={40}
          height={40}
          className="rounded-full border border-gray-300"
        />
        <p className="whitespace-nowrap text-14-medium">
          {row.original.practitioner || "Unknown Practitioner"}
        </p>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row, handleRowUpdate }) => {
      const handleUpdate = (updatedData: Partial<Appointment>) => {
        handleRowUpdate(updatedData, row.original.id);
      };

      return (
        <div className="flex gap-1">
          {/* Schedule Appointment */}
          <AppointmentModal
            type="schedule"
            patientId={row.original.patient_id}
            appointmentId={row.original.id}
            clinicId={row.original.clinic_id}
            onUpdate={(updatedData) => handleUpdate(updatedData)}
          />

          {/* Cancel Appointment */}
          <AppointmentModal
            type="cancel"
            patientId={row.original.patient_id}
            appointmentId={row.original.id}
            clinicId={row.original.clinic_id}
            onUpdate={(updatedData) => handleUpdate(updatedData)}
          />
        </div>
      );
    },
  },
];
