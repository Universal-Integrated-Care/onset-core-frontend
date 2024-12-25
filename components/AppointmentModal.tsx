"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import AppointmentForm from "./forms/AppointmentForm";

const AppointmentModal = ({
  type,
  appointmentId,
}: {
  type: "schedule" | "cancel";
  patientId: string;
  appointmentId: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${type === "schedule" && "text-green-500"}`}
        >
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialogue sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          <DialogDescription>
            Please update the details(if required) to {type} an appointment
          </DialogDescription>
        </DialogHeader>
        <AppointmentForm />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
