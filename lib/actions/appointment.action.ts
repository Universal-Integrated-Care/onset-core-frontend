"use server";

import prisma from "@/lib/prisma";
import { appointmentStatus } from "@/constants/index";

/* ------------------------------
    ✅ Types
------------------------------- */
// Define the enum type to match Prisma schema
type AppointmentStatus = typeof appointmentStatus[keyof typeof appointmentStatus];

// Base Prisma types matching schema
interface PrismaPatient {
  id: bigint;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

interface PrismaPractitioner {
  id: bigint;
  name: string;
  email: string;
  phone: string;
}

interface PrismaAppointment {
  id: bigint;
  patient_id: bigint;
  clinic_id: bigint;
  practitioner_id: bigint | null;
  appointment_start_datetime: Date;
  duration: number;
  status: AppointmentStatus;
  appointment_context: string | null;
  created_at: Date;
  updated_at: Date;
  // Include relations
  patients?: PrismaPatient;
  practitioners?: PrismaPractitioner;
}

// Converted types for application use
type ConvertBigIntToNumber<T> = T extends bigint | null ? number | null : T extends bigint ? number : T;

type Appointment = {
  [K in keyof Omit<PrismaAppointment, 'patients' | 'practitioners'>]: ConvertBigIntToNumber<PrismaAppointment[K]>
} & {
  patient?: Omit<PrismaPatient, 'id'> & { id: number };
  practitioner?: Omit<PrismaPractitioner, 'id'> & { id: number };
};

interface AppointmentResponse {
  appointment?: Appointment | null;
  appointments?: Appointment[] | null;
  error?: string;
}

/* ------------------------------
    ✅ Conversion Utilities
------------------------------- */
const convertPrismaAppointment = (prismaAppointment: PrismaAppointment): Appointment => ({
  id: Number(prismaAppointment.id),
  patient_id: Number(prismaAppointment.patient_id),
  clinic_id: Number(prismaAppointment.clinic_id),
  practitioner_id: prismaAppointment.practitioner_id ? Number(prismaAppointment.practitioner_id) : null,
  appointment_start_datetime: prismaAppointment.appointment_start_datetime,
  duration: prismaAppointment.duration,
  status: prismaAppointment.status,
  appointment_context: prismaAppointment.appointment_context,
  created_at: prismaAppointment.created_at,
  updated_at: prismaAppointment.updated_at,
  ...(prismaAppointment.patients && {
    patient: {
      id: Number(prismaAppointment.patients.id),
      first_name: prismaAppointment.patients.first_name,
      last_name: prismaAppointment.patients.last_name,
      email: prismaAppointment.patients.email,
      phone: prismaAppointment.patients.phone,
    }
  }),
  ...(prismaAppointment.practitioners && {
    practitioner: {
      id: Number(prismaAppointment.practitioners.id),
      name: prismaAppointment.practitioners.name,
      email: prismaAppointment.practitioners.email,
      phone: prismaAppointment.practitioners.phone,
    }
  })
});

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

    const prismaAppointments = await prisma.patient_appointments.findMany({
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
    }) as PrismaAppointment[];

    const appointments = prismaAppointments.map(convertPrismaAppointment);
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
    status?: AppointmentStatus;
  },
): Promise<AppointmentResponse> => {
  try {
    if (!appointmentId) {
      throw new Error("Appointment ID is required for updates.");
    }

    // Prepare the update data with proper status case handling
    const updateData = {
      ...updates,
      // Convert status to uppercase if it exists
      ...(updates.status && {
        status: updates.status.toUpperCase() as AppointmentStatus
      }),
      // Convert IDs to bigint if they exist
      ...(updates.practitioner_id && {
        practitioner_id: BigInt(updates.practitioner_id)
      }),
      updated_at: new Date()
    };

    const prismaAppointment = await prisma.patient_appointments.update({
      where: {
        id: BigInt(appointmentId),
      },
      data: updateData,
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
      }
    }) as PrismaAppointment;

    const appointment = convertPrismaAppointment(prismaAppointment);
    return { appointment };
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    if (error instanceof Error) {
      return {
        appointment: null,
        error: `Failed to update appointment: ${error.message}`
      };
    }
    return {
      appointment: null,
      error: "An error occurred while updating the appointment.",
    };
  }
};