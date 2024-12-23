import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("session_token")?.value;
    console.log("🔑 Session token:", token);

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: No session token provided." },
        { status: 401 },
      );
    }

    const session = await prisma.sessions.findUnique({
      where: { session_token: token },
      include: { users: true }, // Ensure `users` relation is correct
    });

    console.log("📝 Session Data:", session);

    if (!session || session.expires < new Date()) {
      return NextResponse.json(
        { error: "Session expired or invalid." },
        { status: 401 },
      );
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: session.users.id,
        email: session.users.email,
        name: session.users.name,
        clinic_id: session.users.clinic_id
          ? Number(session.users.clinic_id) // Convert BigInt to Number
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Error validating session:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
