"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const res = await fetch("/api/validate-session", {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("❌ Invalid session, redirecting to /login");
          router.push("/login");
          return;
        }

        const data = await res.json();
        console.log("🔄 Client Validation Result:", data);

        if (!data.valid) {
          console.error("❌ Invalid session, redirecting to /login");
          router.push("/login");
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error("❌ Client validation error:", error);
        router.push("/login");
      }
    };

    validateSession();
  }, [router]);

  if (isValidSession === null) {
    return <p>🔄 Validating session, please wait...</p>;
  }

  return (
    <div>
      <h1>🏥 Welcome to the Clinic Dashboard!</h1>
      <p>Your session is valid.</p>
    </div>
  );
};

export default Dashboard;
