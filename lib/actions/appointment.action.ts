"use server";

import prisma from "@/lib/prisma";

/* ------------------------------
    ✅ Appointment Interface
------------------------------- */
interface Appointment {
  id: number;
  patient_id: number;
  clinic_id: number;
  practitioner_id: number | null;
  appointment_start_datetime: Date;
  duration: number;
  status: string;
  appointment_context: string | null;
  created_at: Date;
  updated_at: Date;
}

interface AppointmentResponse {
  appointment?: Appointment | null;
  appointments?: Appointment[] | null;
  error?: string;
}

/* ------------------------------
    ✅ Get Appointments by Clinic ID (Latest First)
------------------------------- */
export const getAppointmentsByClinicId = async (
  clinicId: number | bigint,
): Promise<AppointmentResponse> => {
  try {
    if (!clinicId) {
      throw new Error("Clinic ID is required.");
    }

    const numericClinicId =
      typeof clinicId === "bigint" ? Number(clinicId) : clinicId;

    const appointments = await prisma.patient_appointments.findMany({
      where: {
        clinic_id: numericClinicId,
      },
      include: {
        patients: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
          },
        },
        practitioners: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        appointment_start_datetime: "desc",
      },
    });

    return { appointments };
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return {
      appointments: null,
      error: "An error occurred while fetching appointments.",
    };
  }
};

/* ------------------------------
    ✅ Update Appointment (Handles Schedule, Cancel, Edit)
------------------------------- */
export const updateAppointment = async (
  appointmentId: number,
  updates: {
    practitioner_id?: number;
    appointment_start_datetime?: Date;
    appointment_context?: string | null;
    status?: "SCHEDULED" | "CANCELLED" | "PENDING";
  },
): Promise<AppointmentResponse> => {
  try {
    if (!appointmentId) {
      throw new Error("Appointment ID is required for updates.");
    }

    const appointment = await prisma.patient_appointments.update({
      where: {
        id: appointmentId,
      },
      data: {
        ...updates,
        updated_at: new Date(),
      },
    });

    return { appointment };
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    return {
      appointment: null,
      error: "An error occurred while updating the appointment.",
    };
  }
};
