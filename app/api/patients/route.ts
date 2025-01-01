import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";
import { getSession } from "@/lib/session";

/**
 * ✅ Fetch Patients for the User's Clinic
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
  } catch (error: any) {
    console.error("❌ Error fetching patients:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch patients." },
      { status: 500 },
    );
  }
}
