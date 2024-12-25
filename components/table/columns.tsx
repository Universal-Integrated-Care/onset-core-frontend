"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import AppointmentModal from "../AppointmentModal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "../StatusBadge";
import { formatDateTime } from "@/lib/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<Payment>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => <p className="text-14-medium">{row.original.patient}</p>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="min-w-[115px]">
        <StatusBadge status={row.original.status} />
      </div>
    ),
  },
  {
    accessorKey: "appointment_start_datetime",
    header: "Appointment",
    cell: ({ row }) => (
      <p className="text-14-regular min-w-[100px]">
        {formatDateTime(row.original.appointment_start_datetime).dateTime}
      </p>
    ),
  },
  {
    accessorKey: "practitioner",
    header: "Doctor",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          {/* Optional Image for Practitioner */}
          <Image
            src={"/assets/images/dr-remirez.png"}
            alt={row.original.practitioner || "Unknown Practitioner"}
            width={40}
            height={40}
            className="rounded-full"
          />
          <p className="whitespace-nowrap text-14-medium">
            {row.original.practitioner || "Unknown Practitioner"}
          </p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Actions</div>,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1">
          <AppointmentModal
            patient={row.original.patient}
            type={"schedule"}
            appointementId={row.original.id}
          />
          <AppointmentModal
            patient={row.original.patient}
            type={"cancel"}
            appointementId={row.original.id}
          />
        </div>
      );
    },
  },
];
