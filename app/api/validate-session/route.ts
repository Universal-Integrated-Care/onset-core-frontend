import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Validate User Session
 */
export async function GET(req: NextRequest) {
  try {
    // ✅ Extract session token from cookies
    const token = req.cookies.get("session_token")?.value;
    console.log("🔑 Session token:", token);

    if (!token) {
      console.warn("❌ No session token provided");
      return NextResponse.json(
        { error: "Unauthorized: No session token provided." },
        { status: 401 },
      );
    }

    // ✅ Fetch session with user relation
    const session = await prisma.sessions.findUnique({
      where: { session_token: token },
      include: { users: true },
    });

    console.log("📝 Session Data:", session);

    // ✅ Check if session exists and is not expired
    if (!session || session.expires < new Date()) {
      console.warn("❌ Invalid or expired session");
      return NextResponse.json(
        { error: "Session expired or invalid." },
        { status: 401 },
      );
    }

    // ✅ Check if user exists and has a valid clinic_id
    if (!session.users) {
      console.warn("❌ No user associated with this session");
      return NextResponse.json(
        { error: "User not found or invalid session." },
        { status: 401 },
      );
    }

    // ✅ Ensure user has a clinic_id if required for further validation
    const userData = {
      id: session.users.id,
      email: session.users.email,
      name: session.users.name,
      clinic_id: session.users.clinic_id
        ? Number(session.users.clinic_id) // Explicitly convert BigInt to Number
        : null,
    };

    console.log("✅ User Data to Return:", userData);

    // ✅ Return validated session and user data
    return NextResponse.json({
      valid: true,
      user: userData,
    });
  } catch (error: any) {
    console.error("❌ Error validating session:", error.message || error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
