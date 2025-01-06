import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// app/api/session/validate/route.ts

/**
 * @swagger
 * /api/session/validate:
 *   get:
 *     tags:
 *       - Authentication
 *       - Session
 *     summary: Validate user session
 *     description: |
 *       Validates the current user session using the session token from cookies.
 *       Returns user data if the session is valid and not expired.
 *     parameters:
 *       - in: cookie
 *         name: session_token
 *         required: true
 *         schema:
 *           type: string
 *         description: Session token stored in cookies
 *     responses:
 *       200:
 *         description: Session is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Indicates if the session is valid
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: User's unique identifier
 *                       example: 1
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email address
 *                       example: "user@example.com"
 *                     name:
 *                       type: string
 *                       description: User's full name
 *                       example: "John Doe"
 *                     clinic_id:
 *                       type: integer
 *                       nullable: true
 *                       description: Associated clinic ID (if any)
 *                       example: 123
 *             example:
 *               valid: true
 *               user:
 *                 id: 1
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 clinic_id: 123
 *       401:
 *         description: Unauthorized - Invalid or expired session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *               examples:
 *                 noToken:
 *                   value:
 *                     error: "Unauthorized: No session token provided."
 *                   summary: No session token
 *                 expiredSession:
 *                   value:
 *                     error: "Session expired or invalid."
 *                   summary: Expired or invalid session
 *                 noUser:
 *                   value:
 *                     error: "User not found or invalid session."
 *                   summary: No user associated with session
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error."
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User's unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         name:
 *           type: string
 *           description: User's full name
 *         clinic_id:
 *           type: integer
 *           nullable: true
 *           description: Associated clinic ID
 */
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
  } catch (error: unknown) {
    console.error(
      "❌ Error validating session:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
