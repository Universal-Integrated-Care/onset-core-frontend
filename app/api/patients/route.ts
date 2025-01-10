import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import { getSession } from "@/lib/session";

/**
 * ✅ Fetch Patients for the User's Clinic
 */

// app/api/patients/route.ts

/**
 * @swagger
 * /api/patients:
 *   get:
 *     tags:
 *       - Patients
 *     summary: Fetch patients for authenticated user's clinic
 *     description: Retrieves all patients associated with the clinic of the currently authenticated user
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved patients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 patients:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: The patient's unique identifier
 *                       first_name:
 *                         type: string
 *                         description: Patient's first name
 *                       last_name:
 *                         type: string
 *                         description: Patient's last name
 *                       email:
 *                         type: string
 *                         format: email
 *                         description: Patient's email address
 *                       phone:
 *                         type: string
 *                         description: Patient's contact number
 *                       patient_type:
 *                         type: string
 *                         description: Type or category of patient
 *                       medicare_number:
 *                         type: string
 *                         description: Patient's Medicare number
 *                       medicare_expiry:
 *                         type: string
 *                         format: date
 *                         description: Medicare card expiry date
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of when the patient was created
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of last update to patient record
 *       401:
 *         description: Authentication required or invalid session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized. Please log in."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch patients."
 * components:
 *   securitySchemes:
 *     sessionAuth:
 *       type: apiKey
 *       in: cookie
 *       name: session
 *       description: Session-based authentication
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ Validate Session
    const session = await getSession(req);
    if (!session || !session.user || !session.user.clinic_id) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    const userClinicId = session.user.clinic_id;

    // ✅ Fetch Patients by Clinic ID
    const patients = await prisma.patients.findMany({
      where: {
        clinic_id: BigInt(userClinicId),
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        patient_type: true,
        medicare_number: true,
        medicare_expiry: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ patients: serializeBigInt(patients) });
  } catch (error) {
    console.error(
      "❌ Error fetching patients:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Failed to fetch patients." },
      { status: 500 },
    );
  }
}

/* POST /api/patients   */
export async function POST(req: NextRequest) {
  try {
    // ✅ Parse incoming JSON data
    const data = await req.json();

    const {
      assistant_id,
      first_name,
      last_name,
      medicare_number,
      medicare_expiry,
      email,
      phone,
      patient_context,
    } = data;

    // ✅ Validate Required Fields
    if (!assistant_id || !first_name) {
      return NextResponse.json(
        {
          error: "Missing required fields: assistant_id, first_name.",
        },
        { status: 400 },
      );
    }

    console.log("🔍 Searching for clinic with phone number:", assistant_id);

    // ✅ Lookup Clinic ID by Clinic Phone
    const clinic = await prisma.clinics.findFirst({
      where: {
        assistant_id: assistant_id,
      },
      select: {
        id: true,
      },
    });

    if (!clinic) {
      return NextResponse.json(
        { error: "No clinic found with the provided assistant_id." },
        { status: 404 },
      );
    }

    console.log("🏥 Found Clinic ID:", clinic.id);

    let isPrimaryContact = true;

    // ✅ Check if Phone Number Already Exists
    if (phone) {
      const existingPatients = await prisma.patients.findMany({
        where: {
          phone: phone,
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          is_primary_contact: true,
        },
      });

      if (existingPatients.length > 0) {
        console.log(
          `🔄 Shared phone number detected. Existing patients:`,
          existingPatients,
        );
        isPrimaryContact = false; // Mark as non-primary contact for shared phone numbers
      }
    }

    // ✅ Check if Email Already Exists (if provided)
    if (email) {
      const existingEmailPatient = await prisma.patients.findFirst({
        where: {
          email: email,
        },
        select: {
          first_name: true,
          last_name: true,
        },
      });

      if (existingEmailPatient) {
        return NextResponse.json(
          {
            error: `Email already exists under the patient: ${existingEmailPatient.first_name} ${existingEmailPatient.last_name || ""}.`,
          },
          { status: 400 },
        );
      }
    }

    // ✅ Provide Default Values
    const finalPatientContext =
      patient_context?.trim() || "No specific context provided.";

    // ✅ Create the patient with shared phone handling
    const patient = await prisma.patients.create({
      data: {
        clinic_id: clinic.id,
        first_name,
        last_name: last_name || null,
        patient_type: "EXISTING", // Default value enforced
        medicare_number,
        medicare_expiry: medicare_expiry || null,
        email: email || null,
        phone,
        is_primary_contact: isPrimaryContact, // Flag set based on phone existence
        patient_context: finalPatientContext,
      },
    });

    console.log("✅ Patient created:", patient);

    return NextResponse.json(
      {
        message: "Patient created successfully.",
        patient: serializeBigInt(patient),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Error creating patient:", error);
    return NextResponse.json(
      { error: "Failed to create patient." },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
