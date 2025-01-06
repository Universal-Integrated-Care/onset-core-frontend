import { NextResponse, NextRequest } from "next/server";

export const config = {
  matcher: [
    "/clinics/:id/dashboard",
    "/clinics/:id/calendar",
    "/api/practitioners",
  ],
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
      // Get the host from request headers
      const host = req.headers.get("host");
      const protocol = host?.includes("localhost") ? "http" : "https";
      const validationUrl = new URL(
        "/api/validate-session",
        `${protocol}://${host}`,
      );

      console.log("🔍 Validation URL:", validationUrl.toString());

      const validationReq = new Request(validationUrl, {
        headers: {
          Cookie: `session_token=${token}`,
        },
        cache: "no-store",
      });

      const res = await fetch(validationReq);
      console.log("📡 Validation response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("❌ Session validation failed:", {
          status: res.status,
          error: errorText,
        });
        return NextResponse.redirect(new URL("/login", req.url));
      }

      const validationResult = await res.json();
      console.log("✅ Validation result:", JSON.stringify(validationResult));

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

      if (matchedClinicId !== null && matchedClinicId !== user.clinic_id) {
        console.warn(
          `🚫 Redirecting to user's actual clinic: ${user.clinic_id}`,
        );
        return NextResponse.redirect(
          new URL(`/clinics/${user.clinic_id}/dashboard`, req.url),
        );
      }
    } catch (error) {
      console.error("❌ Detailed Middleware Error:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        url: req.nextUrl.toString(),
      });
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
