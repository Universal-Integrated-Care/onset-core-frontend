"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import AppointmentForm from "./forms/AppointmentForm";

interface AppointmentModalProps {
  type: "schedule" | "cancel";
  patientId: string;
  appointmentId?: string; // Optional for scheduling
  clinicId: string; // Required for API context
  onUpdate?: (
    updatedData: Partial<{
      status: string;
      appointment_start_datetime: string;
    }>,
  ) => void; // Callback for updating row state
}

const AppointmentModal = ({
  type,

  appointmentId,
  clinicId,
  onUpdate,
}: AppointmentModalProps) => {
  const [open, setOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ Fetch Appointment Data for Editing
   */
  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (type === "schedule" || !appointmentId) return; // Skip fetch for scheduling

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch appointment details");
        }
        const { appointment } = await res.json();
        setAppointmentData(appointment);
      } catch (error: Error | unknown) {
        console.error(
          "❌ Error fetching appointment details:",
          error instanceof Error ? error.message : error,
        );
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch appointment details",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (open && appointmentId) {
      fetchAppointmentData();
    }
  }, [open, appointmentId, type]);

  /**
   * ✅ Handle Modal Close with State Update
   */
  const handleCloseModal = (
    updatedData?: Partial<{
      status: string;
      appointment_start_datetime: string;
    }>,
  ) => {
    setOpen(false);
    if (onUpdate && updatedData) {
      onUpdate(updatedData); // Update row in the parent component
    }
  };

  /**
   * ✅ Render Loading State
   */
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
            <DialogDescription>
              Fetching appointment details, please wait.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * ✅ Render Error State
   */
  if (error) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription className="text-red-500">
              {error}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  /**
   * ✅ Render Main Modal Content
   */
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${
            type === "schedule" ? "text-green-500" : "text-red-500"
          }`}
        >
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialogue sm:max-w-md">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle className="capitalize">{type} Appointment</DialogTitle>
          <DialogDescription>
            {type === "cancel"
              ? "Are you sure you want to cancel this appointment?"
              : "Please review and confirm the appointment details."}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Pass Callbacks to AppointmentForm */}
        <AppointmentForm
          type={type}
          clinicId={clinicId}
          appointmentId={appointmentId || ""}
          onClose={(updatedData) => {
            handleCloseModal(updatedData);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
