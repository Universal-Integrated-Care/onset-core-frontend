"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { EventApi } from "@fullcalendar/core";

const FullscreenCalendar = () => {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<
    {
      id: string;
      title: string;
      start: string;
      end: string;
      backgroundColor: string;
      borderColor: string;
      textColor: string;
      extendedProps: {
        patientId?: string;
        patientName?: string;
        duration: number;
        status: string;
      };
    }[]
  >([]);

  const [patientMap, setPatientMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const practitionerId = searchParams.get("practitioner");

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({ visible: false, content: "", x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsRes = await fetch("/api/patients");
        const patientsData = await patientsRes.json();
        const pMap = Object.fromEntries(
          patientsData.patients.map((p: Patient) => [
            p.id,
            `${p.first_name} ${p.last_name}`,
          ]),
        );
        setPatientMap(pMap);
        console.log("👥 Patients:", patientMap);

        // Fetch appointments and blocked slots
        const [appointmentsRes, blockedRes] = await Promise.all([
          fetch(`/api/appointments/practitioners/${practitionerId}`),
          fetch(`/api/practitioners/${practitionerId}/blocked`),
        ]);

        const appointmentsData = await appointmentsRes.json();
        const blockedData = await blockedRes.json();

        const allEvents = [
          ...appointmentsData.appointments.map((appt: Appointment) => ({
            id: appt.id,
            title: `👤 ${pMap[appt.patient_id] || "Unknown Patient"}`,
            start: appt.appointment_start_datetime,
            end: new Date(
              new Date(appt.appointment_start_datetime).getTime() +
                appt.duration * 60000,
            ).toISOString(),
            backgroundColor:
              appt.status === "pending"
                ? "#fef3c7"
                : appt.status === "scheduled"
                  ? "#dbeafe"
                  : "#fee2e2",
            borderColor:
              appt.status === "pending"
                ? "#facc15"
                : appt.status === "scheduled"
                  ? "#3b82f6"
                  : "#ef4444",
            textColor: "#111827",
            extendedProps: {
              patientId: appt.patient_id,
              patientName: pMap[appt.patient_id] || "Unknown Patient",
              duration: appt.duration,
              status: appt.status,
            },
          })),
          ...blockedData.blockedSlots.map((slot: BlockedSlot) => ({
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
          })),
        ];

        setEvents(allEvents);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (practitionerId) {
      fetchData();
    }
  }, [patientMap, practitionerId]);

  const handleMouseEnter = (info: { event: EventApi; jsEvent: MouseEvent }) => {
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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-100 text-gray-200">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-100 p-6">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        eventMouseEnter={handleMouseEnter}
        eventMouseLeave={handleMouseLeave}
        height="100%"
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
        expandRows={true}
        handleWindowResize={true}
        aspectRatio={1.8}
        allDaySlot={false}
        nowIndicator={true}
        dayMaxEvents={true}
        slotDuration="00:15:00"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        scrollTime="08:00:00"
      />

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
  );
};

export default FullscreenCalendar;
