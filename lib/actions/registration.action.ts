"use server";

import { PrismaClient } from "@prisma/client";
import { RegisterFormValidation } from "@/lib/validation";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

interface CreateClinicParams {
  userId: number;
  formData: z.infer<typeof RegisterFormValidation>;
}

interface ClinicResponse {
  clinic?: any;
  session?: {
    session_token: string;
  };
  error?: string;
}

export const createClinic = async ({
  userId,
  formData,
}: CreateClinicParams): Promise<ClinicResponse> => {
  try {
    // Start a transaction to ensure all operations succeed or fail together
    return await prisma.$transaction(async (tx) => {
      // Process the days
      const daysOpened = [];
      if (formData.monday) daysOpened.push("MONDAY");
      if (formData.tuesday) daysOpened.push("TUESDAY");
      if (formData.wednesday) daysOpened.push("WEDNESDAY");
      if (formData.thursday) daysOpened.push("THURSDAY");
      if (formData.friday) daysOpened.push("FRIDAY");
      if (formData.saturday) daysOpened.push("SATURDAY");
      if (formData.sunday) daysOpened.push("SUNDAY");

      // For opening hours, we'll use the first checked day's times
      // or default to null if no days are selected
      let openingTime = null;
      let closingTime = null;

      // Find the first day that's checked and use its times
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

      // Create the clinic
      const clinic = await tx.clinics.create({
        data: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          url: formData.clinicWebsite,
          clinic_type: [formData.clinicType],
          days_opened: daysOpened,
          opening_time: openingTime,
          closing_time: closingTime,
        },
      });

      // Create a new session linking the user to the clinic
      const sessionToken = uuidv4();
      const session = await tx.sessions.create({
        data: {
          user_id: userId,
          clinic_id: clinic.id,
          session_token: sessionToken,
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return {
        clinic,
        session: {
          session_token: session.session_token,
        },
      };
    });
  } catch (error) {
    console.error("Error creating clinic:", error);
    return {
      error: "An error occurred while creating the clinic",
    };
  }
};

// Function to verify if a user has access to a clinic
export const verifyClinicAccess = async (
  userId: number,
  clinicId: number,
): Promise<boolean> => {
  try {
    const session = await prisma.sessions.findFirst({
      where: {
        user_id: userId,
        clinic_id: clinicId,
        expires: {
          gt: new Date(), // Check if session hasn't expired
        },
      },
    });

    return !!session;
  } catch (error) {
    console.error("Error verifying clinic access:", error);
    return false;
  }
};
