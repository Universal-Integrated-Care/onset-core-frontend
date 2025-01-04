import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { serializeBigInt } from "@/lib/utils";

/**
 * ✅ Get Practitioner by ID
 */
type Props = {
  params: Promise<{
    practitionerId: string;
  }>;
};

/**
 * Fetch Practitioner by ID
 */
export async function GET(req: NextRequest, props: Props) {
  try {
    // ✅ Resolve params promise
    const { practitionerId } = await props.params;
    const practitioner = await prisma.practitioners.findUnique({
      where: { id: BigInt(practitionerId) },
      select: {
        id: true,
        clinic_id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        bio: true,
      },
    });

    if (!practitioner) {
      return NextResponse.json(
        { error: "Practitioner not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ practitioner: serializeBigInt(practitioner) });
  } catch (error: Error | unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error fetching practitioner details:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch practitioner details." },
      { status: 500 },
    );
  }
}

/**
 * ✅ Delete Practitioner by ID
 */
export async function DELETE(req: NextRequest, props: Props) {
  try {
    // ✅ Resolve params promise
    const { practitionerId } = await props.params;

    // ✅ Validate ID
    if (!practitionerId) {
      console.error("❌ Missing Practitioner ID");
      return NextResponse.json(
        { error: "Practitioner ID is required for deletion." },
        { status: 400 },
      );
    }

    console.log(`🛠️ Deleting Practitioner with ID: ${practitionerId}`);

    // ✅ Check if practitioner exists
    const existingPractitioner = await prisma.practitioners.findUnique({
      where: { id: BigInt(practitionerId) },
    });

    if (!existingPractitioner) {
      console.error("❌ Practitioner Not Found");
      return NextResponse.json(
        { error: "Practitioner not found." },
        { status: 404 },
      );
    }

    // ✅ Delete the practitioner
    await prisma.practitioners.delete({
      where: { id: BigInt(practitionerId) },
    });

    console.log(
      `✅ Practitioner with ID ${practitionerId} deleted successfully`,
    );

    return NextResponse.json(
      {
        message: `Practitioner with ID ${practitionerId} deleted successfully.`,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("❌ Error Deleting Practitioner:", error);

    // Prisma-specific error handling
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Practitioner not found or already deleted." },
        { status: 404 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete practitioner.";
    return NextResponse.json(
      {
        error: errorMessage,
        details: error,
      },
      { status: 500 },
    );
  }
}
