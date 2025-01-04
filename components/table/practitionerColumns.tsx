// ./components/table/practitionerColumns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import PractitionerActionsCell from "./PractitionerActionsCell"; // Adjust the import path as needed

// ✅ Define Practitioner Type
export type Practitioner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  practitioner_type: string;
  specialization: string;
  clinic_id?: string; // Ensure we have clinic_id if needed
};

// ✅ Define Columns with `handleDelete`
export const getPractitionerColumns = (
  handleDelete: (id: string) => Promise<void>,
): ColumnDef<Practitioner>[] => {
  return [
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
        <PractitionerActionsCell
          practitioner={row.original}
          handleDelete={handleDelete}
        />
      ),
    },
  ];
};
