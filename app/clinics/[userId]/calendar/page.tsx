"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import BlockSlotsForm from "@/components/forms/BlockSlotsForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar, Stethoscope } from "lucide-react";
import DashboardLoader from "@/components/DashboardLoader";

interface Practitioner {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  practitioner_type: string;
  clinic_id?: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  appointment_start_datetime: string;
  duration: number;
  status: string;
}

interface BlockedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
}

const PractitionerCalendar = () => {
  const router = useRouter();
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] =
    useState<Practitioner | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [patientMap, setPatientMap] = useState<{ [key: string]: string }>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({ visible: false, content: "", x: 0, y: 0 });

  // Session validation and initial data fetch
  useEffect(() => {
    const validateAndFetchData = async () => {
      try {
        const res = await fetch("/api/validate-session", {
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        if (!data.valid || !data.user) {
          router.push("/login");
          return;
        }

        const clinicId = Number(data.user.clinic_id);
        const userId = data.user.id;

        if (isNaN(clinicId) || clinicId <= 0) {
          router.push("/login");
          return;
        }

        setClinicId(clinicId);
        setUserId(userId);
        setIsValidSession(true);
      } catch (error) {
        console.error("❌ Error during initialization:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    validateAndFetchData();
  }, [router]);

  // Fetch practitioners
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const res = await fetch(`/api/practitioners`);
        if (!res.ok) throw new Error("Failed to fetch practitioners");
        const data = await res.json();
        setPractitioners(data.practitioners || []);
      } catch (error) {
        console.error("❌ Error fetching practitioners:", error);
      }
    };
    fetchPractitioners();
  }, []);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patients`);
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();
        const pMap = Object.fromEntries(
          data.patients.map((p: PatientBasic) => [
            p.id,
            `${p.first_name} ${p.last_name}`,
          ]),
        );
        setPatientMap(pMap);
      } catch (error) {
        console.error("❌ Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, []);

  // Fetch calendar data
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!selectedPractitioner?.id) return;

      setIsLoading(true);
      try {
        const [appointmentsRes, blockedRes] = await Promise.all([
          fetch(`/api/appointments/practitioners/${selectedPractitioner.id}`),
          fetch(`/api/practitioners/${selectedPractitioner.id}/blocked`),
        ]);

        if (!appointmentsRes.ok || !blockedRes.ok) {
          throw new Error("Failed to fetch calendar data");
        }

        const appointmentsData = await appointmentsRes.json();
        const blockedData = await blockedRes.json();

        const appointmentEvents = appointmentsData.appointments.map(
          (appt: Appointment) => ({
            id: appt.id,
            title: `👤 ${patientMap[appt.patient_id] || "Unknown Patient"}`,
            start: appt.appointment_start_datetime,
            end: new Date(
              new Date(appt.appointment_start_datetime).getTime() +
                appt.duration * 60000,
            ).toISOString(),
            status: appt.status,
            backgroundColor:
              appt.status === "PENDING"
                ? "#fef3c7"
                : appt.status === "SCHEDULED"
                  ? "#dbeafe"
                  : "#fee2e2",
            borderColor:
              appt.status === "PENDING"
                ? "#facc15"
                : appt.status === "SCHEDULED"
                  ? "#3b82f6"
                  : "#ef4444",
            textColor: "#111827",
            extendedProps: {
              patientId: appt.patient_id,
              patientName: patientMap[appt.patient_id] || "Unknown Patient",
              duration: appt.duration,
              status: appt.status,
            },
          }),
        );

        const blockedEvents = blockedData.blockedSlots.map(
          (slot: BlockedSlot) => ({
            id: slot.id,
            title: "🚫 Blocked Slot",
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: "#d1d5db",
            borderColor: "#6b7280",
            textColor: "#1f2937",
            extendedProps: {
              status: "Blocked",
              duration: Math.round(
                (new Date(slot.end_time).getTime() -
                  new Date(slot.start_time).getTime()) /
                  60000,
              ),
            },
          }),
        );

        setEvents([...appointmentEvents, ...blockedEvents]);
      } catch (error) {
        console.error("❌ Error fetching calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [selectedPractitioner, patientMap]);

  const handleNavigation = (path: string) => {
    if (!userId) return;

    switch (path) {
      case "dashboard":
        router.push(`/clinics/${userId}/dashboard`);
        break;
      case "practitioners":
        router.push(`/clinics/${userId}/dashboard?view=practitioners`);
        break;
      case "calendar":
        router.push(`/clinics/${userId}/calendar`);
        break;
      default:
        console.warn("Unknown navigation path:", path);
    }
  };

  const handleMouseEnter = (info: {
    event: {
      extendedProps: {
        patientName?: string;
        duration: number;
        status: string;
      };
    };
    jsEvent: { clientX: number; clientY: number };
  }) => {
    const { patientName, duration, status } = info.event.extendedProps;
    const tooltipContent =
      status === "Blocked"
        ? `📝 Status: ${status}\n⏱ Duration: ${duration || "N/A"} mins`
        : `📝 Status: ${status}\n👤 Patient: ${patientName}\n⏱ Duration: ${
            duration || "N/A"
          } mins`;

    setTooltip({
      visible: true,
      content: tooltipContent,
      x: info.jsEvent.clientX,
      y: info.jsEvent.clientY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  };

  const openFullscreenCalendar = () => {
    if (selectedPractitioner) {
      window.open(
        `/clinics/${userId}/calendar/fullscreen?practitioner=${selectedPractitioner.id}`,
        "_blank",
        "width=1200,height=800",
      );
    }
  };

  if (isLoading) {
    return <DashboardLoader text="Loading Calendar, please wait..." />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-dark-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "transition-all duration-300 bg-dark-200 shadow-lg p-4 space-y-4 min-h-screen",
          isSidebarCollapsed ? "w-20" : "w-64",
        )}
      >
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

        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={() => handleNavigation("dashboard")}
        >
          <Calendar className="h-5 w-5" />
          {!isSidebarCollapsed && <span>Appointments</span>}
        </Button>

        <Button
          variant="default"
          className="w-full flex items-center gap-2"
          onClick={() => handleNavigation("practitioners")}
        >
          <Stethoscope className="h-5 w-5" />
          {!isSidebarCollapsed && <span>Practitioners</span>}
        </Button>

        <Button
          variant="default"
          className={cn(
            "w-full flex items-center gap-2",
            "bg-primary hover:bg-primary-dark",
          )}
        >
          <Calendar className="h-5 w-5" />
          {!isSidebarCollapsed && <span>Calendar</span>}
        </Button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-hidden">
        <div className="h-full flex flex-col p-4">
          {/* Header */}
          <header className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-gray-100">Calendar View</h1>
              <p className="text-gray-400 text-xs">
                Manage appointments and blocked slots
              </p>
            </div>
          </header>

          {/* Controls */}
          <div className="space-y-2 mb-4">
            <div className="flex gap-4">
              <Select
                className="flex-1"
                onValueChange={(value) => {
                  const practitioner = practitioners.find(
                    (p) => p.id === value,
                  );
                  if (practitioner) {
                    setSelectedPractitioner(practitioner);
                  }
                }}
              >
                <SelectTrigger className="bg-dark-300 text-gray-200 border-gray-600">
                  <SelectValue placeholder="Select Practitioner" />
                </SelectTrigger>
                <SelectContent className="bg-dark-300 text-gray-200">
                  {practitioners.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id}
                      className="hover:bg-dark-400"
                    >
                      {p.name} ({p.practitioner_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                className="bg-dark-300 text-gray-200 border-gray-600 hover:bg-dark-400"
                onClick={openFullscreenCalendar}
                disabled={!selectedPractitioner}
              >
                <span>Open Full Calendar</span>
              </Button>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white"
              onClick={() => setIsFormVisible(!isFormVisible)}
            >
              {isFormVisible
                ? "Hide Block Slots Form"
                : "Show Block Slots Form"}
            </Button>

            {isFormVisible && (
              <BlockSlotsForm
                apiUrl={`/api/practitioners/${selectedPractitioner?.id}/blocked`}
                onClose={() => setIsFormVisible(false)}
              />
            )}
          </div>

          {/* Calendar Container */}
          {selectedPractitioner && !isLoading && (
            <div className="flex-1 border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-dark-300 h-[calc(100vh-220px)]">
              <div className="h-full p-4">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                  }}
                  events={events}
                  editable={false}
                  eventMouseEnter={handleMouseEnter}
                  eventMouseLeave={handleMouseLeave}
                  height="100%"
                  aspectRatio={1.5}
                  eventTimeFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    meridiem: "short",
                  }}
                  slotLabelFormat={{
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  }}
                  dayHeaderFormat={{ weekday: "short", day: "numeric" }}
                  buttonText={{
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                  }}
                  handleWindowResize={true}
                  stickyHeaderDates={true}
                  expandRows={true}
                  allDaySlot={false}
                  nowIndicator={true}
                  dayMaxEvents={true}
                  slotDuration="00:15:00"
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                  scrollTime="08:00:00"
                />
              </div>
            </div>
          )}

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="fixed z-50 bg-dark-400 text-gray-200 text-sm rounded-md shadow-md p-2 pointer-events-none"
              style={{
                top: tooltip.y + 10,
                left: tooltip.x + 10,
              }}
            >
              {tooltip.content.split("\n").map((line, i) => (
                <div key={i} className="whitespace-nowrap">
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PractitionerCalendar;
