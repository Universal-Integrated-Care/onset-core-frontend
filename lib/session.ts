import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Utility function to validate a session and return user data.
 */
export async function getSession(req: NextRequest) {
  try {
    // ✅ Extract session token from cookies
    const token = req.cookies.get("session_token")?.value;

    if (!token) {
      console.warn("❌ No session token provided");
      return null; // No session token, session invalid
    }

    // ✅ Fetch session from the database
    const session = await prisma.sessions.findUnique({
      where: { session_token: token },
      include: { users: true }, // Ensure the session includes user data
    });

    // ✅ Validate session
    if (!session || session.expires < new Date()) {
      console.warn("❌ Session invalid or expired");
      return null; // Invalid or expired session
    }

    // ✅ Return user data
    return {
      user: {
        id: session.users.id,
        email: session.users.email,
        name: session.users.name,
        clinic_id: session.users.clinic_id
          ? Number(session.users.clinic_id) // Ensure BigInt is converted
          : null,
      },
    };
  } catch (error) {
    console.error("❌ Error in getSession:", error);
    return null; // Return null on any error
  }
}
