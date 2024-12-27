import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Fetch practitionertype enum values
    const practitionerTypes = await prisma.$queryRaw<
      { enumlabel: string }[]
    >`SELECT enumlabel FROM pg_enum WHERE enumtypid = 'practitionertype'::regtype`;

    // Fetch specialization enum values
    const specializations = await prisma.$queryRaw<
      { enumlabel: string }[]
    >`SELECT enumlabel FROM pg_enum WHERE enumtypid = 'specialization'::regtype`;

    return NextResponse.json({
      practitionerTypes: practitionerTypes.map((t) => t.enumlabel),
      specializations: specializations.map((s) => s.enumlabel),
    });
  } catch (error: any) {
    console.error("❌ Error fetching enum values:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch enum values." },
      { status: 500 },
    );
  }
}
