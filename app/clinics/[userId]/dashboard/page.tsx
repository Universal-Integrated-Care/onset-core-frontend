"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StatCard from "@/components/StatCard";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/Datatable";
import PractitionerForm from "@/components/forms/PractitionerForm";
import PractitionerTable from "@/components/table/PractitionerTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Calendar,
  Stethoscope,
} from "lucide-react";
import DashboardLoader from "@/components/DashboardLoader";
import { Practitioner } from "@/components/table/practitionerColumns";
import BlockSlotsForm from "@/components/forms/BlockSlotsForm";

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
  const [showPractitioners, setShowPractitioners] = useState(false); // Toggle Practitioners Table
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Toggle Sidebar
  const [showBlockSlotsForm, setShowBlockSlotsForm] = useState(false);

  const [metadata, setMetadata] = useState<{
    practitionerTypes: string[];
    specializations: string[];
  }>({ practitionerTypes: [], specializations: [] });
  const [newPractitioner, setNewPractitioner] = useState<
    Practitioner | undefined
  >(undefined);
  const handleAddPractitioner = (practitioner: Practitioner) => {
    setNewPractitioner(practitioner);
    setShowForm(false); // Close the form after adding
  };

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
  console.log("✅ New Practitioner State in Dashboard:", newPractitioner);

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

        {/* Appointments Toggle */}
        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={() => {
            setShowPractitioners(false);
            setShowForm(false);
          }}
        >
          <Calendar className="h-5 w-5" />
          {!isSidebarCollapsed && <span>Appointments</span>}
        </Button>

        {/* Practitioners Toggle */}
        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={() => {
            setShowPractitioners(true);
            setShowForm(false);
          }}
        >
          <Stethoscope className="h-5 w-5" />
          {!isSidebarCollapsed && <span>Practitioners</span>}
        </Button>
        {/* Practitioner Calendar Toggle */}
        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={() => {
            if (clinicId) {
              router.push(`/clinics/${clinicId}/calendar`);
            } else {
              console.warn("⚠️ Clinic ID is not available.");
            }
          }}
        >
          <Calendar className="h-5 w-5" />
          {!isSidebarCollapsed && <span>Practitioner Calendar</span>}
        </Button>

        {/* Add Practitioner Toggle */}
        {showPractitioners && (
          <Button
            variant="default"
            className="w-full flex items-center gap-2 mt-2"
            onClick={() => {
              setShowForm(!showForm);
              setIsSidebarCollapsed(false); // Ensure sidebar is expanded
            }}
          >
            <UserPlus className="h-5 w-5" />
            {!isSidebarCollapsed && (
              <span>
                {showForm ? "Close Practitioner Form" : "Add Practitioner"}
              </span>
            )}
          </Button>
        )}

        {/* Block Slots Form */}
        {showBlockSlotsForm && selectedPractitionerId && (
          <div className="mt-4">
            <BlockSlotsForm
              apiUrl={`/api/practitioners/${selectedPractitionerId}/blocked`}
              onClose={() => setShowBlockSlotsForm(false)}
            />
          </div>
        )}

        {showForm && clinicId && (
          <div className="mt-4">
            <PractitionerForm
              clinicId={clinicId}
              practitionerTypes={metadata.practitionerTypes}
              specializations={metadata.specializations}
              onClose={() => setShowForm(false)}
              onAdd={handleAddPractitioner}
            />
          </div>
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

        {!showPractitioners ? (
          <>
            <section className="w-full space-y-4">
              <h1 className="header">Welcome 👋</h1>
              <p className="text-dark-700">
                Start the day with managing new appointments
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
                count={
                  appointments.filter((a) => a.status === "SCHEDULED").length
                }
                label="Scheduled Appointments"
                icon="/assets/icons/pending.svg"
              />
              <StatCard
                type="cancelled"
                count={
                  appointments.filter((a) => a.status === "CANCELLED").length
                }
                label="Cancelled Appointments"
                icon="/assets/icons/cancelled.svg"
              />
            </section>

            {/* Appointments Table */}
            <section>
              <DataTable
                columns={columns}
                data={appointments}
                clinicId={clinicId?.toString()}
              />
            </section>
          </>
        ) : (
          <section>
            <PractitionerTable newPractitioner={newPractitioner} />
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
