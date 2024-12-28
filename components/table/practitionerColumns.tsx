"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// ✅ Define Practitioner Type
export type Practitioner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  practitioner_type: string;
  specialization: string;
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
          } catch (error: any) {
            console.error("❌ Error deleting practitioner:", error.message);
            toast({
              title: "❌ Error",
              description: error.message || "Failed to delete practitioner.",
              variant: "destructive",
              className:
                "bg-red-600 text-white p-4 rounded-lg shadow-md border border-red-500",
            });
          } finally {
            setIsDeleting(false);
          }
        };

        return (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={"text-red-500"}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        );
      },
    },
  ];
};
