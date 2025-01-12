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

// Define the appointment data interface
interface AppointmentData {
  id: string;
  patient_id: string;
  clinic_id: string;
  practitioner_id: number | null;
  status: AppointmentStatus;
  appointment_start_datetime: string;
  appointment_context: string | null;
  duration: number;
  created_at: string;
  updated_at: string;
  patient: string;
  practitioner: string;
}

// Update modal props interface
interface AppointmentModalProps {
  type: "schedule" | "cancel" | "reschedule";
  patientId: string;
  appointmentId?: string;
  clinicId: string;
  onUpdate?: (
    updatedData: Partial<{
      status: AppointmentStatus;
      appointment_start_datetime: string;
    }>,
  ) => void;
}

const AppointmentModal = ({
  type,
  patientId,
  appointmentId,
  clinicId,
  onUpdate,
}: AppointmentModalProps) => {
  const [open, setOpen] = useState(false);
  const [appointmentData, setAppointmentData] =
    useState<AppointmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("Patient ID from AppointmentModal prop", patientId);
  console.log("Data from AppointmentModal prop", appointmentData);

  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (type === "schedule" || !appointmentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch appointment details");
        }
        const { appointment } = await res.json();
        setAppointmentData(appointment as AppointmentData);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch appointment details";
        console.error("❌ Error fetching appointment details:", errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (open && appointmentId) {
      fetchAppointmentData();
    }
  }, [open, appointmentId, type]);

  const handleCloseModal = (
    updatedData?: Partial<{
      status: AppointmentStatus;
      appointment_start_datetime: string;
    }>,
  ) => {
    console.log("✅ Modal receiving update:", updatedData);
    setOpen(false);
    if (onUpdate && updatedData) {
      const typedData = {
        ...updatedData,
        status: updatedData.status as AppointmentStatus,
      };
      onUpdate(typedData);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={`capitalize ${
            type === "reschedule" ? "text-green-500" : "text-red-500"
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

        <AppointmentForm
          type={type}
          clinicId={clinicId}
          appointmentId={appointmentId || ""}
          onClose={handleCloseModal}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
