import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/clinics/:id/dashboard",
    "/clinics/:id/calendar",
    "/api/practitioners",
  ],
  runtime: "nodejs",
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;

  console.log("🔑 Middleware Triggered");
  console.log("🔑 Full Request URL:", req.nextUrl.pathname);

  const protectedRoutes = [
    "/clinics/:id/dashboard",
    "/clinics/:id/calendar",
    "/api/practitioners",
  ];

  const isProtectedRoute = protectedRoutes.some((path) =>
    new RegExp(`^${path.replace(":id", "\\d+")}$`).test(req.nextUrl.pathname),
  );

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const res = await fetch(`${req.nextUrl.origin}/api/validate-session`, {
        headers: {
          Cookie: `session_token=${token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const validationResult = await res.json();

      if (!validationResult.valid) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const user = validationResult.user;

      // Extract clinic ID from URL
      const clinicIdMatchers = [
        /\/clinics\/(\d+)\/dashboard/,
        /\/clinics\/(\d+)\/calendar/,
      ];

      const matchedClinicId = clinicIdMatchers.reduce<number | null>(
        (match: number | null, regex: RegExp) => {
          const result = req.nextUrl.pathname.match(regex);
          return result ? Number(result[1]) : match;
        },
        null,
      );

      // If matched clinic ID exists, redirect to user's actual clinic
      if (matchedClinicId !== null && matchedClinicId !== user.clinic_id) {
        console.warn(
          `🚫 Redirecting to user's actual clinic: ${user.clinic_id}`,
        );
        return NextResponse.redirect(
          new URL(`/clinics/${user.clinic_id}/dashboard`, req.url),
        );
      }
    } catch (error) {
      console.error("❌ Middleware Error:", error);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
