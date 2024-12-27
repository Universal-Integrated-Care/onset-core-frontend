"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StatCard from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/Datatable";
import PractitionerForm from "@/components/forms/PractitionerForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import DashboardLoader from "@/components/DashboardLoader";

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
  const [clinicId, setClinicId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false); // Toggle Practitioner Form
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Toggle Sidebar
  const [metadata, setMetadata] = useState<{
    practitionerTypes: string[];
    specializations: string[];
  }>({ practitionerTypes: [], specializations: [] });

  /**
   * ✅ Validate session and fetch appointments
   */
  useEffect(() => {
    const validateAndFetchData = async () => {
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

        if (!data.valid || !data.user) {
          console.error("❌ Invalid session data, redirecting to /login");
          router.push("/login");
          return;
        }

        const clinicId = Number(data.user.clinic_id);
        if (isNaN(clinicId) || clinicId <= 0) {
          console.error("❌ Invalid clinic_id, redirecting to /login");
          router.push("/login");
          return;
        }

        setClinicId(clinicId);
        setIsValidSession(true);

        const appointmentsData = await fetchAppointmentsByClinicId(clinicId);
        setAppointments(appointmentsData);

        // Fetch Metadata
        const metadataResponse = await fetch("/api/practitioners/meta");
        if (!metadataResponse.ok) throw new Error("Failed to fetch metadata");
        const metaData = await metadataResponse.json();
        setMetadata({
          practitionerTypes: metaData.practitionerTypes || [],
          specializations: metaData.specializations || [],
        });

        console.log("✅ Metadata Fetched:", metaData);
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchData();
  }, [router]);

  /**
   * ✅ Render Loading State
   */
  if (isLoading) {
    return <DashboardLoader text="Loading Dashboard, please wait..." />;
  }

  if (isValidSession === null) {
    return <DashboardLoader text="Validating session, please wait..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "transition-all duration-300 bg-dark-200 shadow-lg p-4 space-y-4 h-full overflow-y-auto",
          isSidebarCollapsed ? "w-20" : "w-1/4",
        )}
      >
        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>

        {/* Add Practitioner Toggle */}
        {!isSidebarCollapsed && (
          <>
            <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
            <Button
              variant="default"
              className="w-full flex items-center gap-2"
              onClick={() => setShowForm(!showForm)}
            >
              <UserPlus className="h-5 w-5" />
              {showForm ? "Close Practitioner Form" : "Add Practitioner"}
            </Button>
            {showForm && clinicId && (
              <div className="mt-4">
                <PractitionerForm
                  clinicId={clinicId}
                  practitionerTypes={metadata.practitionerTypes}
                  specializations={metadata.specializations}
                  onClose={() => setShowForm(false)}
                />
              </div>
            )}
          </>
        )}
      </aside>

      {/* Main Dashboard Section */}
      <main className="flex-1 space-y-6 overflow-auto p-6">
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

        {/* Appointments Table */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Appointments</h2>
          <DataTable columns={columns} data={appointments} />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
