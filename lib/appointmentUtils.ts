import { serializeBigInt } from "@/lib/utils";
import { Prisma, dayofweek } from "@prisma/client";

export function getDayOfWeekEnum(dateString: string): dayofweek {
  const date = new Date(dateString);
  const days: dayofweek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  return days[date.getDay()];
}

/**
 * ✅ Create Appointment with moment.utc
 */
export async function createAppointment(
  db: Prisma.TransactionClient,
  body: CreateAppointmentBodyInitial,
  practitioner_id: number | bigint | null | undefined,
  appointment_start_datetime: string,
) {
  const {
    patient_id,
    assistant_id,
    duration,
    appointment_context,
    status = "scheduled" as AppointmentStatus,
  } = body;

  // Parse appointment start datetime using moment.utc

  // Ensure patient_id and clinic_id are not undefined
  if (patient_id === undefined) {
    throw new Error("Patient ID is required");
  }

  const clinic = await db.clinics.findFirst({
    where: {
      assistant_id,
    },
    select: {
      id: true,
    },
  });

  if (!clinic) {
    throw new Error(
      `No clinic found for the provided assistant_id: ${assistant_id}`,
    );
  }

  const clinic_id = await Number(clinic.id);
  console.log("🏥 Clinic ID for given assistant_id is:", clinic_id);

  if (clinic_id === undefined) {
    throw new Error("Clinic ID is required");
  }

  const appointment = await db.patient_appointments.create({
    data: {
      patient_id: serializeBigInt(patient_id),
      clinic_id: serializeBigInt(clinic_id),
      practitioner_id: practitioner_id
        ? serializeBigInt(practitioner_id)
        : null,
      appointment_start_datetime: appointment_start_datetime,
      duration: Number(duration),
      status,
      appointment_context: appointment_context || null,
    },
  });

  console.log("✅ Appointment Created:", appointment);
  return appointment;
}

export async function validateRequiredFields(
  body: CreateAppointmentBodyInitial,
) {
  const {
    patient_id,
    assistant_id,
    appointment_start_datetime,
    duration,
    status,
  } = body;

  if (
    !patient_id ||
    !assistant_id ||
    !appointment_start_datetime ||
    !duration
  ) {
    throw new Error(
      "Please ensure all required fields are provided: patient, clinic, appointment date & time, and duration.",
    );
  }

  if (
    !["scheduled", "cancelled", "pending"].includes(
      status || "pending" || "scheduled",
    )
  ) {
    throw new Error(
      "Invalid appointment status. Please choose between 'scheduled', 'cancelled', or 'pending'.",
    );
  }
}

/**
 * Validate Patient, Clinic, and Practitioner
 */
export async function validateEntities(
  db: Prisma.TransactionClient,
  patient_id: number | bigint,
  clinic_id: number | bigint,
  practitioner_id: number | bigint | null | undefined,
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

/**
 * ✅ Check Duplicate Appointment with moment.utc
 */
export async function checkDuplicateAppointment(
  db: Prisma.TransactionClient,
  patient_id: number | bigint,
  clinic_id: number | bigint,
  appointment_start_datetime: string,
) {
  const existingAppointment = await db.patient_appointments.findFirst({
    where: {
      patient_id: serializeBigInt(patient_id),
      clinic_id: serializeBigInt(clinic_id),
      appointment_start_datetime: appointment_start_datetime,
      status: { not: "cancelled" },
    },
  });

  if (existingAppointment) {
    throw new Error(
      `An appointment already exists for the selected patient at this clinic on ${appointment_start_datetime}.`,
    );
  }

  console.log("✅ No duplicate appointment found.");
}

/**
 * ✅ Validate Practitioner Availability with moment.utc (No Z suffix)
 */
export async function validatePractitionerAvailability(
  db: Prisma.TransactionClient,
  practitioner_id: number | bigint,
  appointment_start_datetime: string,
  appointment_end_datetime: string,
  appointment_date: string,
  dayOfWeekEnum: dayofweek,
  duration: number,
) {
  console.log("🕒 Appointment Start timestamp:", appointment_start_datetime);
  console.log("🕒 Appointment End timestamp:", appointment_end_datetime);
  console.log("Duration ", duration);
  console.log("Appointment date", appointment_date);
  // ✅ Case 4: Blocked Slots on Specific Date and Time
  const blockedSlot = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id),
      is_blocked: true,
      is_available: null,
      OR: [
        {
          // Case 1: Overlaps with blocked slot
          start_time: { lt: appointment_end_datetime },
          end_time: { gt: appointment_start_datetime },
        },
        {
          // Case 2: Appointment fully overlaps the blocked slot
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
    `🔍 Checking Availability for Practitioner ID: ${practitioner_id}, Date: ${appointment_start_datetime}, Day: ${dayOfWeekEnum}, Start Time: ${appointment_start_datetime}, End Time: ${appointment_end_datetime}`,
  );

  const overlappingAppointment = await db.patient_appointments.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id),
      status: { not: "cancelled" },
      AND: [
        {
          appointment_start_datetime: {
            lt: appointment_end_datetime, // New appointment ends after existing starts
          },
        },
        {
          appointment_start_datetime: {
            gte: appointment_start_datetime, // New appointment starts before existing ends
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
  // ✅ Step 1: Check Specific Date Override
  const overrideAvailability = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id),
      is_available: true,
      is_blocked: false,
      date: appointment_start_datetime, // Specific date availability
      start_time: { lte: appointment_start_datetime },
      end_time: { gte: appointment_end_datetime },
    },
  });

  if (overrideAvailability) {
    console.log("✅ Specific date override found. Practitioner is available.");
    return;
  }

  console.log("🔄 No override found. Checking recurring availability...");

  // ✅ Step 2: Check Recurring Availability (Time-Only Comparison)
  const recurringAvailability = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id),
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
      practitioner_id: serializeBigInt(practitioner_id),
      is_available: false,
      OR: [
        {
          // Case 1: Existing slot starts before the appointment ends and ends after the appointment starts
          start_time: { lt: appointment_end_datetime },
          end_time: { gt: appointment_start_datetime },
        },
        {
          // Case 2: Appointment fully overlaps with an existing unavailable slot
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

/**
 * ✅ Update Practitioner Availability with moment.utc (No Z suffix)
 */
export async function updatePractitionerAvailability(
  db: Prisma.TransactionClient,
  practitioner_id: number | bigint,
  clinic_id: number | bigint,
  appointment_start_datetime: string,
  appointment_end_datetime: string,
) {
  console.log("🕒 Appointment Start timestamp:", appointment_start_datetime);
  console.log("🕒 Appointment End timestamp:", appointment_end_datetime);
  // ✅ Check for overlapping appointments
  const overlappingAppointment = await db.patient_appointments.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id),
      status: { not: "cancelled" },
      AND: [
        {
          appointment_start_datetime: {
            lt: appointment_start_datetime,
          },
        },
        {
          appointment_start_datetime: {
            gte: appointment_end_datetime,
          },
        },
      ],
    },
  });

  console.log("🔍 Overlapping Appointment Found:", overlappingAppointment);

  if (overlappingAppointment) {
    throw new Error(
      `The selected time slot (${appointment_start_datetime} is already booked for this practitioner.`,
    );
  }

  console.log(
    "✅ No overlapping appointments found. Proceeding to availability checks.",
  );

  // ✅ Check for Override Slot
  const existingOverride = await db.practitioner_availability.findFirst({
    where: {
      practitioner_id: serializeBigInt(practitioner_id),
      date: appointment_start_datetime,
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
    console.log({
      practitioner_id: serializeBigInt(practitioner_id),
      clinic_id: serializeBigInt(clinic_id),
      date: appointment_start_datetime,
      start_time: appointment_start_datetime, // Valid Date object for TIME
      end_time: appointment_end_datetime, // Valid Date object for TIME
      is_available: false,
    });

    await db.practitioner_availability.create({
      data: {
        practitioner_id: serializeBigInt(practitioner_id),
        clinic_id: serializeBigInt(clinic_id),
        date: appointment_start_datetime,
        start_time: appointment_start_datetime, // Valid Date object for TIME
        end_time: appointment_end_datetime, // Valid Date object for TIME
        is_available: false,
      },
    });
    console.log("✅ New override slot created and marked as unavailable.");
  }
}

/**
 * Validate Patient and Practitioner Association with Clinic
 */
export async function validatePatientPractitionerClinicAssociation(
  db: Prisma.TransactionClient,
  patient_id: number | bigint,
  practitioner_id: number | bigint,
  clinic_id: number | bigint,
) {
  const [patient, practitioner] = await Promise.all([
    db.patients.findUnique({
      where: { id: serializeBigInt(patient_id) },
      select: { clinic_id: true },
    }),
    db.practitioners.findUnique({
      where: { id: serializeBigInt(practitioner_id) },
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

/**
 * Fetch Appointment Details
 */
export async function fetchAppointmentDetails(
  db: Prisma.TransactionClient,
  appointmentId: number | bigint | undefined,
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
