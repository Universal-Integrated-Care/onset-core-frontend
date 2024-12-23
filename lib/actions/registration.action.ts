"use server";

import { RegisterFormValidation } from "@/lib/validation";
import { z } from "zod";

import prisma from "@/lib/prisma";

interface CreateClinicParams {
  userId: number;
  formData: z.infer<typeof RegisterFormValidation>;
}

interface ClinicResponse {
  clinic?: any;
  error?: string;
}

/* Create Clinic and Associate with User */
export const createClinic = async ({
  userId,
  formData,
}: CreateClinicParams): Promise<ClinicResponse> => {
  try {
    return await prisma.$transaction(async (tx) => {
      // Step 1: Process the days
      const daysOpened: string[] = [];
      if (formData.monday) daysOpened.push("MONDAY");
      if (formData.tuesday) daysOpened.push("TUESDAY");
      if (formData.wednesday) daysOpened.push("WEDNESDAY");
      if (formData.thursday) daysOpened.push("THURSDAY");
      if (formData.friday) daysOpened.push("FRIDAY");
      if (formData.saturday) daysOpened.push("SATURDAY");
      if (formData.sunday) daysOpened.push("SUNDAY");

      // Step 2: Handle opening and closing times
      let openingTime = null;
      let closingTime = null;

      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      for (const day of days) {
        if (formData[day]) {
          openingTime = formData[`${day}OpenTime`];
          closingTime = formData[`${day}CloseTime`];
          break;
        }
      }

      // Step 3: Create the clinic
      const clinic = await tx.clinics.create({
        data: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          url: formData.clinicWebsite,
          clinic_context: formData.clinicInformation,
          clinic_type: [formData.clinicType],
          days_opened: daysOpened,
          opening_time: openingTime,
          closing_time: closingTime,
        },
      });

      // Step 4: Update the user to associate with the clinic
      await tx.users.update({
        where: { id: userId },
        data: {
          hasClinic: true,
          clinic_id: clinic.id,
        },
      });

      return { clinic };
    });
  } catch (error) {
    console.error("Error creating clinic:", error);
    return { error: "An error occurred while creating the clinic" };
  }
};
