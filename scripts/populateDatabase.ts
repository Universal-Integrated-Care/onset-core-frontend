import prisma from "../lib/prisma";
import clinicsData from "../test_data/clinics.json";
import patientsData from "../test_data/patients.json";
import practitionersData from "../test_data/practitioner.json";
import availabilityData from "../test_data/practitioner_availability.json";
import usersData from "../test_data/users.json";
import bcrypt from "bcrypt";
import {
  clinictype,
  dayofweek,
  patienttype,
  practitionertype,
  specialization,
} from "@prisma/client";

// Utility to convert string time to Date
const parseTime = (time: string | null): Date | null => {
  return time ? new Date(`1970-01-01T${time}Z`) : null;
};

// Enum validation
const validateEnum = (value, enumObj) => {
  if (Object.values(enumObj).includes(value)) {
    return value;
  }
  throw new Error(`Invalid enum value: ${value}`);
};

// Main function
async function populateDatabase() {
  try {
    console.log("🚀 Populating Clinics...");
    for (const clinic of clinicsData.clinics) {
      await prisma.clinics.create({
        data: {
          name: clinic.name,
          address: clinic.address,
          phone: clinic.phone,
          url: clinic.url,
          description: clinic.description,
          clinic_context: clinic.clinic_context,
          opening_time: parseTime(clinic.opening_time),
          closing_time: parseTime(clinic.closing_time),
          clinic_type: clinic.clinic_type.map((type) =>
            validateEnum(type, clinictype),
          ),
          days_opened: clinic.days_opened.map((day) =>
            validateEnum(day, dayofweek),
          ),
        },
      });
    }

    console.log("🚀 Populating Patients...");
    for (const patient of patientsData.patients) {
      await prisma.patients.create({
        data: {
          first_name: patient.first_name,
          last_name: patient.last_name,
          patient_type: validateEnum(patient.patient_type, patienttype),
          medicare_number: patient.medicare_number,
          medicare_expiry: patient.medicare_expiry
            ? new Date(patient.medicare_expiry)
            : null,
          email: patient.email,
          phone: patient.phone,
          clinic_id: BigInt(patient.clinic_id),
          patient_context: patient.patient_context,
        },
      });
    }

    console.log("🚀 Populating Practitioners...");
    for (const practitioner of practitionersData.practitioners) {
      await prisma.practitioners.create({
        data: {
          name: practitioner.name,
          email: practitioner.email,
          phone: practitioner.phone,
          practitioner_type: validateEnum(
            practitioner.practitioner_type,
            practitionertype,
          ),
          clinic_id: BigInt(practitioner.clinic_id),
          bio: practitioner.bio,
          practitioner_image_url: practitioner.practitioner_image_url,
          specialization: practitioner.specialization.map((spec) =>
            validateEnum(spec, specialization),
          ),
        },
      });
    }

    console.log("🚀 Populating Practitioner Availability...");
    for (const slot of availabilityData) {
      await prisma.practitioner_availability.create({
        data: {
          practitioner_id: BigInt(slot.practitioner_id),
          clinic_id: BigInt(slot.clinic_id),
          day_of_week: slot.day_of_week
            ? validateEnum(slot.day_of_week, dayofweek)
            : null,
          date: slot.date ? new Date(slot.date) : null,
          start_time: parseTime(slot.start_time),
          end_time: parseTime(slot.end_time),
          is_available: slot.is_available,
        },
      });
    }

    console.log("🚀 Populating Users...");
    for (const user of usersData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.users.create({
        data: {
          email: user.email,
          name: user.name,
          phone: user.phone,
          password: hashedPassword,
          hasClinic: user.hasClinic,
          clinic_id: user.clinic_id ? BigInt(user.clinic_id) : null,
        },
      });
    }

    console.log("✅ Database population complete!");
  } catch (error) {
    console.error("❌ Error populating database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

populateDatabase();
