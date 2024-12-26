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
}

const AppointmentModal = ({
  type,
  patientId,
  appointmentId,
  clinicId,
}: AppointmentModalProps) => {
  const [open, setOpen] = useState(false);
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ✅ Fetch Appointment Data when Modal is Opened for Editing
   */
  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (type === "schedule" || !appointmentId) return; // No need to fetch for scheduling

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch appointment details");
        }
        const { appointment } = await res.json();
        setAppointmentData(appointment);
      } catch (error: any) {
        console.error("❌ Error fetching appointment details:", error.message);
        setError(error.message || "Failed to fetch appointment details");
      } finally {
        setIsLoading(false);
      }
    };

    if (open && appointmentId) {
      fetchAppointmentData();
    }
  }, [open, appointmentId, type]);

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
   * ✅ Main Modal Content
   */
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
            {type === "cancel" &&
              "Are you sure you want to cancel this appointment?"}
            {type === "schedule" &&
              "Please review and confirm the appointment details."}
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Pass `appointmentData` Down to the Form */}
        <AppointmentForm
          type={type}
          clinicId={clinicId}
          patientId={patientId}
          appointmentId={appointmentId || ""}
          appointmentData={appointmentData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentModal;
