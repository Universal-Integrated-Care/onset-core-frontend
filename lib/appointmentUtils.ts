import { PrismaClient } from "@prisma/client";
import { serializeBigInt } from "./utils";

interface AppointmentBody {
  patient_id: string;
  clinic_id: string;
  duration: number;
  appointment_context?: string;
  status?: string;
  appointment_start_datetime?: string;
}

export async function createAppointment(
  db: PrismaClient,
  body: AppointmentBody,
  practitioner_id: string | null,
  appointment_start_datetime: string,
) {
  const {
    patient_id,
    clinic_id,
    duration,
    appointment_context,
    status = "PENDING",
  } = body;

  // Parse appointment start datetime using your preferred method (e.g., moment.utc)
  //const appointment_start_datetime = new Date(); // Replace with actual parsing logic

  // Use transaction to ensure atomicity
  const appointment = await db.$transaction(async (prisma) => {
    // Step 2: Validate entities
    await validateEntities(prisma, patient_id, clinic_id, practitioner_id);

    // Step 3: Check for duplicate appointments
    await checkDuplicateAppointment(
      prisma,
      patient_id,
      clinic_id,
      appointment_start_datetime.toISOString(),
    );

    // Step 4: Validate practitioner availability if applicable
    if (practitioner_id) {
      // Define appointment end datetime based on duration
      const appointment_end_datetime = new Date(
        appointment_start_datetime.getTime() + duration * 60000,
      ).toISOString();

      // Replace with actual values for dayOfWeekEnum and appointment_date
      const dayOfWeekEnum = appointment_start_datetime.toLocaleString("en-US", {
        weekday: "long",
      });
      const appointment_date = appointment_start_datetime
        .toISOString()
        .split("T")[0];

      await validatePractitionerAvailability(
        prisma,
        practitioner_id,
        appointment_start_datetime.toISOString(),
        appointment_end_datetime,
        appointment_date,
        dayOfWeekEnum,
        duration,
      );

      // Update practitioner availability
      await updatePractitionerAvailability(
        prisma,
        practitioner_id,
        clinic_id,
        appointment_start_datetime.toISOString(),
        appointment_end_datetime,
      );
    }

    // Step 5: Create the appointment
    const createdAppointment = await prisma.patient_appointments.create({
      data: {
        patient_id: serializeBigInt(patient_id) as number | undefined,
        clinic_id: serializeBigInt(clinic_id) as number | undefined,
        practitioner_id: practitioner_id
          ? (serializeBigInt(practitioner_id) as number | undefined)
          : null,
        appointment_start_datetime: appointment_start_datetime,
        duration: Number(duration),
        status,
        appointment_context: appointment_context || null,
      },
    });

    console.log("✅ Appointment Created:", createdAppointment);
    return createdAppointment;
  });

  return appointment;
}
export async function validateRequiredFields(body: AppointmentBody) {
  const {
    patient_id,
    clinic_id,
    appointment_start_datetime,
    duration,
    status,
  } = body;

  if (!patient_id || !clinic_id || !appointment_start_datetime || !duration) {
    throw new Error(
      "Please ensure all required fields are provided: patient, clinic, appointment date & time, and duration.",
    );
  }

  if (!["SCHEDULED", "CANCELLED", "PENDING"].includes(status || "PENDING")) {
    throw new Error(
      "Invalid appointment status. Please choose between 'SCHEDULED', 'CANCELLED', or 'PENDING'.",
    );
  }
}
export async function validateEntities(
  db: PrismaClient, // Use the correct Prisma client type
  patient_id: string,
  clinic_id: string,
  practitioner_id: string,
) {
  const [patient, clinic, practitioner] = await Promise.all([
    db.patients.findUnique({ where: { id: serializeBigInt(patient_id) } }),
    db.clinics.findUnique({ where: { id: serializeBigInt(clinic_id) } }),
    practitioner_id
      ? db.practitioners.findUnique({
          where: { id: serializeBigInt(practitioner_id) },
        })
      : Promise.resolve(null),
  ]);

  // Check and throw errors for invalid data
  if (!patient) {
    throw new Error(`The patient ID ${patient_id} does not exist.`);
  }

  if (!clinic) {
    throw new Error(`The clinic ID ${clinic_id} is not valid.`);
  }

  if (practitioner_id && !practitioner) {
    throw new Error(
      `The practitioner ID ${practitioner_id} does not match any record.`,
    );
  }

  const isPatientRegistered = await db.patients.findFirst({
    where: {
      id: serializeBigInt(patient_id),
      clinic_id: serializeBigInt(clinic_id),
    },
  });

  if (!isPatientRegistered) {
    throw new Error(
      `The selected patient (ID: ${patient_id}) is not registered with the specified clinic (ID: ${clinic_id}).`,
    );
  }

  console.log(
    "✅ Validation successful: Patient, Clinic, and Practitioner IDs are valid.",
  );
}

export async function checkDuplicateAppointment(
  db: PrismaClient,
  patient_id: string,
  clinic_id: string,
  appointment_start_datetime: string,
) {
  const existingAppointment = await db.patient_appointments.findFirst({
    where: {
      patient_id: serializeBigInt(patient_id) as string,
      clinic_id: serializeBigInt(clinic_id) as string,
      appointment_start_datetime: appointment_start_datetime,
      status: { not: "CANCELLED" },
    },
  });

  if (existingAppointment) {
    throw new Error(
      `An appointment already exists for the selected patient at this clinic on ${appointment_start_datetime}.`,
    );
  }

  console.log("✅ No duplicate appointment found.");
}

export async function validatePractitionerAvailability(
  db: PrismaClient,
  practitioner_id: string,
  appointment_start_datetime: string,
  appointment_end_datetime: string,
  appointment_date: string,
  dayOfWeekEnum: string,
  duration: number,
) {
  console.log("🕒 Appointment Start timestamp:", appointment_start_datetime);
  console.log("🕒 Appointment Duration:", duration);
  console.log("🕒 Appointment End timestamp:", appointment_end_datetime);

  // Check for blocked slots
  const blockedSlot = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      is_blocked: true,
      is_available: null,
      OR: [
        {
          // Overlaps with blocked slot
          start_time: { lt: appointment_end_datetime },
          end_time: { gt: appointment_start_datetime },
        },
        {
          // Appointment fully overlaps the blocked slot
          start_time: { gte: appointment_start_datetime },
          end_time: { lte: appointment_end_datetime },
        },
      ],
    },
    select: {
      start_time: true,
      end_time: true,
    },
  });

  console.log("🔍 Blocked Slot Check:", blockedSlot);

  if (blockedSlot) {
    throw new Error(
      `The selected time slot (${appointment_start_datetime} to ${appointment_end_datetime}) is blocked by the practitioner from (${blockedSlot.start_time} to ${blockedSlot.end_time}).`,
    );
  }

  console.log(
    `🔍 Checking Availability for Practitioner ID: ${practitioner_id}, Date: ${appointment_date}, Day: ${dayOfWeekEnum}, Start Time: ${appointment_start_datetime}, End Time: ${appointment_end_datetime}`,
  );

  const overlappingAppointment = await db.patient_appointments.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      status: { not: "CANCELLED" },
      AND: [
        {
          appointment_start_datetime: {
            lt: appointment_end_datetime, // New appointment ends after existing starts
          },
        },
        {
          appointment_start_datetime: {
            gt: appointment_start_datetime, // New appointment starts before existing ends
          },
        },
      ],
    },
    select: {
      appointment_start_datetime: true,
      duration: true,
    },
  });

  if (overlappingAppointment) {
    throw new Error(
      `The selected time slot ${overlappingAppointment.appointment_start_datetime} for duration of ${overlappingAppointment.duration} minutes overlaps with another appointment.`,
    );
  }

  // Check Specific Date Override
  const overrideAvailability = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      is_available: true,
      is_blocked: false,
      date: appointment_date, // Specific date availability
      start_time: { lte: appointment_start_datetime },
      end_time: { gte: appointment_end_datetime },
    },
  });

  if (overrideAvailability) {
    console.log("✅ Specific date override found. Practitioner is available.");
    return;
  }

  console.log("🔄 No override found. Checking recurring availability...");

  // Check Recurring Availability (Time-Only Comparison)
  const recurringAvailability = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      is_available: true,
      date: null, // Ensure it's recurring availability
      day_of_week: dayOfWeekEnum,
      start_time: {
        lte: appointment_start_datetime,
      },
      end_time: {
        gte: appointment_end_datetime,
      },
      is_blocked: false,
    },
  });

  if (recurringAvailability) {
    console.log(
      "✅ Recurring availability matched. Practitioner is available.",
    );
    return;
  }

  const overlappingSlot = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      is_available: false,
      OR: [
        {
          // Overlaps with unavailable slot
          start_time: { lt: appointment_end_datetime },
          end_time: { gt: appointment_start_datetime },
        },
        {
          // Appointment fully overlaps with an unavailable slot
          start_time: { gte: appointment_start_datetime },
          end_time: { lte: appointment_end_datetime },
        },
      ],
    },
    select: {
      start_time: true,
      end_time: true,
    },
  });

  console.log("🔍 Overlapping Slot Check:", overlappingSlot);

  if (overlappingSlot) {
    throw new Error(
      `The practitioner is marked unavailable during the selected time slot ${overlappingSlot.start_time} - ${overlappingSlot.end_time}.`,
    );
  }

  console.log(
    "✅ Practitioner is not marked as unavailable on the selected date.",
  );
}

export async function updatePractitionerAvailability(
  db: PrismaClient,
  practitioner_id: string,
  clinic_id: string,
  appointment_start_datetime: string,
  appointment_end_datetime: string,
) {
  console.log("🕒 Appointment Start timestamp:", appointment_start_datetime);
  console.log("🕒 Appointment End timestamp:", appointment_end_datetime);

  // Check for overlapping appointments
  const overlappingAppointment = await db.patient_appointments.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      status: { not: "CANCELLED" },
      AND: [
        {
          appointment_start_datetime: {
            lt: new Date(appointment_start_datetime).toISOString(),
          },
        },
        {
          appointment_start_datetime: {
            gt: new Date(appointment_end_datetime).toISOString(),
          },
        },
      ],
    },
  });

  console.log("🔍 Overlapping Appointment Found:", overlappingAppointment);

  if (overlappingAppointment) {
    throw new Error(
      `The selected time slot (${appointment_start_datetime}) is already booked for this practitioner.`,
    );
  }

  console.log(
    "✅ No overlapping appointments found. Proceeding to availability checks.",
  );

  // Check for Override Slot
  const existingOverride = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id) as string,
      date: appointment_start_datetime.split("T")[0],
      start_time: appointment_start_datetime,
      end_time: appointment_end_datetime,
    },
  });

  if (existingOverride) {
    console.log("✅ Override slot found. Marking as unavailable...");
    await db.practitioner_availability.update({
      where: { id: existingOverride.id },
      data: { is_available: false },
    });
    console.log("✅ Override slot marked as unavailable.");
  } else {
    console.log("✅ No override slot found. Creating a new override...");

    await db.practitioner_availability.create({
      data: {
        practitioner_id: serializeBigInt(practitioner_id) as string,
        clinic_id: serializeBigInt(clinic_id) as string,
        date: appointment_start_datetime.split("T")[0],
        start_time: appointment_start_datetime, // Ensure correct format
        end_time: appointment_end_datetime, // Ensure correct format
        is_available: false,
      },
    });
    console.log("✅ New override slot created and marked as unavailable.");
  }
}

export async function validatePatientPractitionerClinicAssociation(
  db: PrismaClient,
  patient_id: string,
  practitioner_id: string,
  clinic_id: string,
) {
  const [patient, practitioner] = await Promise.all([
    db.patients.findUnique({
      where: { id: serializeBigInt(patient_id) as string },
      select: { clinic_id: true },
    }),
    db.practitioners.findUnique({
      where: { id: serializeBigInt(practitioner_id) as string },
      select: { clinic_id: true },
    }),
  ]);

  if (!patient) {
    throw new Error(`No patient found with ID ${patient_id}.`);
  }

  if (!practitioner) {
    throw new Error(`No practitioner found with ID ${practitioner_id}.`);
  }

  if (patient.clinic_id !== practitioner.clinic_id) {
    throw new Error(
      `Patient (ID: ${patient_id}) and Practitioner (ID: ${practitioner_id}) do not belong to the same clinic (ID: ${clinic_id}).`,
    );
  }

  console.log(
    "✅ Patient and Practitioner belong to the same clinic. Validation passed.",
  );
}

export async function fetchAppointmentDetails(
  db: PrismaClient,
  appointmentId: string,
) {
  const detailedAppointment = await db.patient_appointments.findUnique({
    where: { id: appointmentId },
    include: {
      patients: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      practitioners: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!detailedAppointment) {
    throw new Error("Failed to retrieve appointment details after creation.");
  }

  return {
    id: detailedAppointment.id,
    patient_id: detailedAppointment.patients?.id || null,
    patient: detailedAppointment.patients
      ? `${detailedAppointment.patients.first_name} ${detailedAppointment.patients.last_name}`
      : "Unknown Patient",
    practitioner: detailedAppointment.practitioners
      ? detailedAppointment.practitioners.name
      : "Unknown Practitioner",
    clinic_id: detailedAppointment.clinic_id,
    appointment_start_datetime: detailedAppointment.appointment_start_datetime
      ? detailedAppointment.appointment_start_datetime.toISOString()
      : null,
    duration: detailedAppointment.duration,
    status: detailedAppointment.status,
    appointment_context: detailedAppointment.appointment_context,
    created_at: detailedAppointment.created_at.toISOString(),
    updated_at: detailedAppointment.updated_at.toISOString(),
  };
}
