"use server";

import prisma from "@/lib/prisma";

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
  appointments: Appointment[] | null;
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

    // Explicitly convert clinicId to number if it's bigint
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
        appointment_start_datetime: "desc", // Sort by latest first
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
