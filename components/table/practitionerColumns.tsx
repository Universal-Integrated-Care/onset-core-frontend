"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import Image from "next/image";

// ✅ Define Practitioner Type
export type Practitioner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  practitioner_type: string;
  specialization: string;
};

// ✅ Define Columns
export const practitionerColumns: ColumnDef<Practitioner>[] = [
  {
    header: "ID",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <p className="text-14-medium">{row.original.name}</p>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <p className="text-14-medium">{row.original.email}</p>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <p className="text-14-medium">{row.original.phone}</p>,
  },
  {
    accessorKey: "practitioner_type",
    header: "Type",
    cell: ({ row }) => (
      <p className="text-14-medium">{row.original.practitioner_type}</p>
    ),
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
    cell: ({ row }) => (
      <p className="text-14-medium">{row.original.specialization}</p>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Edit
        </Button>
        <Button variant="destructive" size="sm">
          Delete
        </Button>
      </div>
    ),
  },
];
