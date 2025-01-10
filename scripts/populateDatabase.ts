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
import { convertToMelbourneTime } from "../lib/utils";

// Define enum value types
type EnumValue<T> = T[keyof T];
type PrismaEnum = {
  [key: string]: string;
};

// Enum validation with proper typing
const validateEnum = <T extends PrismaEnum>(
  value: EnumValue<T>,
  enumObj: T,
): EnumValue<T> => {
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
          opening_time: convertToMelbourneTime(clinic.opening_time),
          closing_time: convertToMelbourneTime(clinic.closing_time),
          clinic_type: clinic.clinic_type.map((type) =>
            validateEnum<typeof clinictype>(
              type as EnumValue<typeof clinictype>,
              clinictype,
            ),
          ),
          days_opened: clinic.days_opened.map((day) =>
            validateEnum<typeof dayofweek>(
              day as EnumValue<typeof dayofweek>,
              dayofweek,
            ),
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
          patient_type: validateEnum<typeof patienttype>(
            patient.patient_type as EnumValue<typeof patienttype>,
            patienttype,
          ),
          medicare_number: patient.medicare_number,
          medicare_expiry: patient.medicare_expiry,
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
          practitioner_type: validateEnum<typeof practitionertype>(
            practitioner.practitioner_type as EnumValue<
              typeof practitionertype
            >,
            practitionertype,
          ),
          clinic_id: BigInt(practitioner.clinic_id),
          bio: practitioner.bio,
          practitioner_image_url: practitioner.practitioner_image_url,
          specialization: practitioner.specialization.map((spec) =>
            validateEnum<typeof specialization>(
              spec as EnumValue<typeof specialization>,
              specialization,
            ),
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
            ? validateEnum<typeof dayofweek>(
                slot.day_of_week as EnumValue<typeof dayofweek>,
                dayofweek,
              )
            : null,
          date: slot.date ? new Date(slot.date) : null,
          start_time: convertToMelbourneTime(slot.start_time),
          end_time: convertToMelbourneTime(slot.end_time),
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
