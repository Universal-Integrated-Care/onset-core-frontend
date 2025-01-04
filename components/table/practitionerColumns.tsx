"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import PractitionerAvailabilityModal from "@/components/PractitionerAvailabilityModal";

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
      cell: ({ row }) => {
        const { toast } = useToast();
        const [isDeleting, setIsDeleting] = useState(false);

        // 🗑️ Handle Delete
        const handleDeleteClick = async () => {
          setIsDeleting(true);
          try {
            await handleDelete(row.original.id);

            toast({
              title: "✅ Practitioner Deleted",
              description: `"${row.original.name}" has been successfully deleted.`,
              variant: "default",
              className:
                "bg-green-600 text-white p-4 rounded-lg shadow-md border border-green-500",
            });
          } catch (error: unknown) {
            console.error(
              "❌ Error deleting practitioner:",
              error instanceof Error ? error.message : String(error),
            );
            toast({
              title: "❌ Error",
              description:
                error instanceof Error
                  ? error.message
                  : String(error) || "Failed to delete practitioner.",
              variant: "destructive",
              className:
                "bg-red-600 text-white p-4 rounded-lg shadow-md border border-red-500",
            });
          } finally {
            setIsDeleting(false);
          }
        };

        // Determine if you have clinic_id in row.original
        const clinicId = (row.original as Practitioner).clinic_id || "";

        return (
          <div className="flex items-center gap-2">
            {/* 🗑️ Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="text-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>

            {/* 📅 Recurring Availability */}
            <PractitionerAvailabilityModal
              type="recurring"
              practitionerId={row.original.id}
              clinicId={clinicId}
              onUpdate={() => {
                toast({
                  title: "✅ Recurring Updated",
                  description: `"${row.original.name}" recurring schedule updated successfully.`,
                  variant: "default",
                  className:
                    "bg-blue-600 text-white p-4 rounded-lg shadow-md border border-blue-500",
                });
              }}
            />

            {/* 📅 Override Availability */}
            <PractitionerAvailabilityModal
              type="override"
              practitionerId={row.original.id}
              clinicId={clinicId}
              onUpdate={() => {
                toast({
                  title: "✅ Override Updated",
                  description: `"${row.original.name}" override availability updated successfully.`,
                  variant: "default",
                  className:
                    "bg-blue-600 text-white p-4 rounded-lg shadow-md border border-blue-500",
                });
              }}
            />
          </div>
        );
      },
    },
  ];
};
