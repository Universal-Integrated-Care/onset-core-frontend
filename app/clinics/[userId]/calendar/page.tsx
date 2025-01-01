"use client";

import { useEffect, useState } from "react";
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
import { io, Socket } from "socket.io-client";

interface Practitioner {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  practitioner_type: string;
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
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] =
    useState<Practitioner | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({ visible: false, content: "", x: 0, y: 0 });

  // Fetch practitioners from API
  useEffect(() => {
    const fetchPractitioners = async () => {
      try {
        const res = await fetch(`/api/practitioners`);
        if (!res.ok) {
          throw new Error("Failed to fetch practitioners.");
        }
        const data = await res.json();
        setPractitioners(data.practitioners || []);
      } catch (error) {
        console.error("❌ Error fetching practitioners:", error);
      }
    };

    fetchPractitioners();
  }, []);

  // Fetch appointments and blocked slots for selected practitioner
  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!selectedPractitioner) return;

      setIsLoading(true);
      try {
        const [appointmentsRes, blockedRes] = await Promise.all([
          fetch(`/api/appointments/practitioners/${selectedPractitioner.id}`),
          fetch(`/api/practitioners/${selectedPractitioner.id}/blocked`),
        ]);

        if (!appointmentsRes.ok || !blockedRes.ok) {
          throw new Error("Failed to fetch calendar data.");
        }

        const appointmentsData = await appointmentsRes.json();
        const blockedData = await blockedRes.json();

        // Map appointments
        // While Mapping Appointments
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
          }),
        );

        // Map blocked slots
        const blockedEvents = blockedData.blockedSlots.map(
          (slot: BlockedSlot) => {
            const startTime = new Date(slot.start_time);
            const endTime = new Date(slot.end_time);
            const duration = Math.round(
              (endTime.getTime() - startTime.getTime()) / 60000,
            ); // Duration in minutes

            return {
              id: slot.id,
              title: `🚫 Blocked Slot`,
              start: slot.start_time,
              end: slot.end_time,
              backgroundColor: "#d1d5db",
              borderColor: "#6b7280",
              textColor: "#1f2937",
              extendedProps: {
                status: "Blocked",
                duration: duration,
              },
            };
          },
        );

        setEvents([...appointmentEvents, ...blockedEvents]);
      } catch (error) {
        console.error("❌ Error fetching calendar data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarData();
  }, [selectedPractitioner]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch(`/api/patients`);
        if (!res.ok) {
          throw new Error("Failed to fetch patients.");
        }
        const data = await res.json();
        setPatients(data.patients || []);
      } catch (error) {
        console.error("❌ Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  const patientMap = Object.fromEntries(
    patients.map((p: any) => [p.id, `${p.first_name} ${p.last_name}`]),
  );

  // Tooltip Handlers
  // Tooltip Handlers
  const handleMouseEnter = (info: any) => {
    const { patientId, duration, status } = info.event.extendedProps;
    let tooltipContent = `📝 Status: ${status}\n⏱ Duration: ${duration || "N/A"} mins`;

    // Exclude patientId for Blocked events
    if (status !== "Blocked" && patientId) {
      tooltipContent = `📝 Status: ${status}\n👤 Patient: ${patientId}\n⏱ Duration: ${
        duration || "N/A"
      } mins`;
    }

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

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-gray-200 rounded-lg shadow-md relative">
      <h1 className="text-3xl font-bold text-gray-100 flex items-center gap-2">
        Practitioner Calendar 📅
      </h1>

      {/* Practitioner Dropdown */}
      <div className="relative z-50">
        <Select
          onValueChange={(value) => {
            const practitioner = practitioners.find((p) => p.id === value);
            setSelectedPractitioner(practitioner || null);
          }}
        >
          <SelectTrigger className="bg-gray-700 text-gray-200 border-gray-600">
            <SelectValue placeholder="Select Practitioner" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-gray-200">
            {practitioners.map((p) => (
              <SelectItem key={p.id} value={p.id} className="hover:bg-gray-700">
                {p.name} ({p.practitioner_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Block Slots Button */}
      <Button
        className="w-full"
        onClick={() => setIsFormVisible(!isFormVisible)}
      >
        {isFormVisible ? "Hide Block Slots Form" : "Show Block Slots Form"}
      </Button>
      {/* Block Slots Form */}
      {isFormVisible && (
        <BlockSlotsForm
          apiUrl={`/api/practitioners/${selectedPractitioner?.id}/blocked`}
          onClose={() => setIsFormVisible(false)}
        />
      )}

      {/* Block Slots Form */}
      {/* Calendar */}
      {selectedPractitioner && !isLoading && (
        <>
          <div className="border border-gray-700 rounded-lg overflow-hidden shadow-xl bg-gray-800 p-4">
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
              height="auto"
              eventTimeFormat={{
                hour: "numeric",
                minute: "2-digit",
                hour12: true, // ✅ Ensures 12-hour format
                meridiem: "short", // ✅ Display AM/PM
              }}
            />
          </div>

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="absolute z-50 bg-gray-800 text-gray-200 text-sm rounded-md shadow-md p-2 pointer-events-none"
              style={{
                top: tooltip.y + 10,
                left: tooltip.x + 10,
              }}
            >
              {tooltip.content.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PractitionerCalendar;
