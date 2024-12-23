import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/clinics/:id/dashboard"],
  runtime: "nodejs", // Ensure Node.js runtime
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;

  console.log("🔑 Token from cookie:", token);

  const protectedRoutes = ["/clinics/:id/dashboard"];
  const isProtectedRoute = protectedRoutes.some((path) =>
    new RegExp(`^${path.replace(":id", "\\d+")}$`).test(req.nextUrl.pathname),
  );

  if (isProtectedRoute) {
    if (!token) {
      console.warn("⚠️ No session token found, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      // Call validate-session API route
      const res = await fetch(`${req.nextUrl.origin}/api/validate-session`, {
        headers: { Cookie: `session_token=${token}` },
      });

      console.log("🔄 Validation response status:", res.status);

      if (!res.ok) {
        console.warn("❌ Session validation failed, redirecting to /login");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const { valid, user } = await res.json();
      console.log("✅ Validation Result:", { valid, user });

      if (!valid) {
        console.warn("❌ Session invalid, redirecting to /login");
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const clinicIdMatch = req.nextUrl.pathname.match(
        /\/clinics\/(\d+)\/dashboard/,
      );

      if (clinicIdMatch) {
        const clinicId = Number(clinicIdMatch[1]);
        console.log(
          "🏥 Requested Clinic ID:",
          clinicId,
          " | User Clinic ID:",
          user?.clinic_id,
        );

        if (user?.clinic_id !== clinicId) {
          console.warn("🚫 Clinic ID mismatch, redirecting to /unauthorized");
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
      }
    } catch (error) {
      console.error("❌ Middleware Error:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
