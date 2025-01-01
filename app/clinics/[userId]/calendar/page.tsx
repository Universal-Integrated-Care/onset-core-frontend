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
        const appointmentEvents = appointmentsData.appointments.map(
          (appt: Appointment) => ({
            id: appt.id,
            title: `👤 Patient ID: ${appt.patient_id}`,
            start: appt.appointment_start_datetime,
            end: new Date(
              new Date(appt.appointment_start_datetime).getTime() +
                appt.duration * 60000,
            ).toISOString(),
            status: appt.status,
            backgroundColor:
              appt.status === "PENDING"
                ? "#fef3c7" // Light Yellow
                : appt.status === "SCHEDULED"
                  ? "#dbeafe" // Light Blue
                  : "#fee2e2", // Light Red
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
          (slot: BlockedSlot) => ({
            id: slot.id,
            title: `🚫 Blocked Slot`,
            start: slot.start_time,
            end: slot.end_time,
            backgroundColor: "#d1d5db", // Light Gray
            borderColor: "#6b7280",
            textColor: "#1f2937",
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
  }, [selectedPractitioner]);

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-gray-200 rounded-lg shadow-md">
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

      {/* Selected Practitioner Info */}
      {selectedPractitioner && (
        <div className="border border-gray-700 rounded-md bg-gray-800 p-4 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-100">
            {selectedPractitioner.name}
          </h2>
          <p className="text-sm text-gray-300">
            <strong>Email:</strong> {selectedPractitioner.email}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Phone:</strong> {selectedPractitioner.phone}
          </p>
          <p className="text-sm text-gray-300">
            <strong>Specialization:</strong>{" "}
            {selectedPractitioner.specialization.join(", ")}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <p className="text-center text-sm text-gray-400">
          Loading calendar data...
        </p>
      )}

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
              eventClick={(info) => alert(`Event: ${info.event.title}`)}
              eventMouseEnter={(info) => {
                info.el.title = `Status: ${info.event.extendedProps.status}`;
              }}
              height="auto"
            />
          </div>

          {/* Legend */}
          <div className="legend">
            <div>
              <span className="bg-yellow-400"></span> Pending
            </div>
            <div>
              <span className="bg-blue-400"></span> Scheduled
            </div>
            <div>
              <span className="bg-red-400"></span> Cancelled
            </div>
            <div>
              <span className="bg-gray-500"></span> Blocked
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PractitionerCalendar;
