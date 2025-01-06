"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import PractitionerAvailabilityForm from "../components/forms/PractitionerAvailabilityForm";

interface PractitionerAvailabilityModalProps {
  practitionerId: string;
  clinicId: string;
  type: "recurring" | "override";
  onUpdate?: (updatedData?: unknown) => void; // callback
}

const PractitionerAvailabilityModal = ({
  practitionerId,
  clinicId,
  type,
  onUpdate,
}: PractitionerAvailabilityModalProps) => {
  const [open, setOpen] = useState(false);

  /**
   * ✅ Close Handler
   */
  const handleCloseModal = (updatedData?: unknown) => {
    setOpen(false);
    if (onUpdate && updatedData) {
      onUpdate(updatedData);
    }
  };
  console.log(clinicId, "clinicId");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="text-blue-500">
          {type === "recurring"
            ? "Set Fixed Availability"
            : "Block Availability"}
        </Button>
      </DialogTrigger>

      <DialogContent className="shad-dialogue sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "recurring"
              ? "Set Recurring Availability"
              : "Block Availability"}
          </DialogTitle>
          <DialogDescription>
            {type === "recurring"
              ? "Set a recurring day of week availability"
              : "Set availability for a specific date"}
          </DialogDescription>
        </DialogHeader>

        <PractitionerAvailabilityForm
          practitionerId={practitionerId}
          type={type}
          onClose={handleCloseModal}
        />
      </DialogContent>
    </Dialog>
  );
};

export default PractitionerAvailabilityModal;
