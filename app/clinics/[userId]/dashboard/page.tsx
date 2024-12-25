"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StatCard from "@/components/StatCard";
import { columns, Payment } from "@/components/table/columns";
import { DataTable } from "@/components/table/Datatable";

interface Appointment {
  id: number;
  patient_id: number;
  clinic_id: number;
  practitioner_id: number | null;
  appointment_start_datetime: Date;
  duration: number;
  status: string;
  appointment_context: string | null;
  created_at: Date;
  updated_at: Date;
}

async function fetchAppointmentsByClinicId(
  clinicId: number,
): Promise<Appointment[]> {
  try {
    const res = await fetch(`/api/appointments?clinicId=${clinicId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch appointments.");
    }

    const data = await res.json();
    return data.appointments || [];
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    return [];
  }
}

const Dashboard = () => {
  const router = useRouter();
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAndFetchData = async () => {
      try {
        // ✅ Session Validation
        const res = await fetch("/api/validate-session", {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("❌ Invalid session, redirecting to /login");
          router.push("/login");
          return;
        }

        const data = await res.json();
        console.log("🔄 Session Validation Result:", data);

        if (!data.valid || !data.user) {
          console.error("❌ Invalid session data, redirecting to /login");
          router.push("/login");
          return;
        }

        // ✅ Extract and Parse `clinic_id`
        const clinicId = Number(data.user.clinic_id);
        if (isNaN(clinicId) || clinicId <= 0) {
          console.error("❌ Invalid clinic_id, redirecting to /login");
          router.push("/login");
          return;
        }

        console.log("🏥 Parsed Clinic ID:", clinicId);

        setIsValidSession(true);

        // ✅ Fetch Appointments for the Clinic
        const appointmentsData = await fetchAppointmentsByClinicId(clinicId);
        console.log("📅 Fetched Appointments:", appointmentsData);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchData();
  }, [router]);

  if (isLoading) {
    return <p>🔄 Loading dashboard, please wait...</p>;
  }

  if (isValidSession === null) {
    return <p>🔄 Validating session, please wait...</p>;
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      {/* Header */}
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            alt="Logo"
            height={32}
            width={162}
            className="h-8 w-fit"
          />
        </Link>
        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            Start the day by managing new appointments
          </p>
        </section>

        {/* Stats Section */}
        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.length}
            label="Total Appointments"
            icon="/assets/icons/appointments.svg"
          />
          <StatCard
            type="pending"
            count={appointments.filter((a) => a.status === "SCHEDULED").length}
            label="Scheduled Appointments"
            icon="/assets/icons/pending.svg"
          />
          <StatCard
            type="cancelled"
            count={appointments.filter((a) => a.status === "CANCELLED").length}
            label="Cancelled Appointments"
            icon="/assets/icons/cancelled.svg"
          />
        </section>

        {/* Data Table Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Appointments</h2>
          <DataTable columns={columns} data={appointments} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
