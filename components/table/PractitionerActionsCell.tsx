// ./components/table/PractitionerActionsCell.tsx

"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import PractitionerAvailabilityModal from "@/components/PractitionerAvailabilityModal";
import { Practitioner } from "./practitionerColumns"; // Adjust the import path as needed

interface PractitionerActionsCellProps {
  practitioner: Practitioner;
  handleDelete: (id: string) => Promise<void>;
}

const PractitionerActionsCell: React.FC<PractitionerActionsCellProps> = ({
  practitioner,
  handleDelete,
}) => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const clinicId = practitioner.clinic_id || "";

  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await handleDelete(practitioner.id);
      toast({
        title: "✅ Practitioner Deleted",
        description: `"${practitioner.name}" has been successfully deleted.`,
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
        practitionerId={practitioner.id}
        clinicId={clinicId}
        onUpdate={() => {
          toast({
            title: "✅ Recurring Updated",
            description: `"${practitioner.name}" recurring schedule updated successfully.`,
            variant: "default",
            className:
              "bg-blue-600 text-white p-4 rounded-lg shadow-md border border-blue-500",
          });
        }}
      />

      {/* 📅 Override Availability */}
      <PractitionerAvailabilityModal
        type="override"
        practitionerId={practitioner.id}
        clinicId={clinicId}
        onUpdate={() => {
          toast({
            title: "✅ Override Updated",
            description: `"${practitioner.name}" override availability updated successfully.`,
            variant: "default",
            className:
              "bg-blue-600 text-white p-4 rounded-lg shadow-md border border-blue-500",
          });
        }}
      />
    </div>
  );
};

export default PractitionerActionsCell;
