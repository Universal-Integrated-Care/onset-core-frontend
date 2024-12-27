"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLoader from "@/components/DashboardLoader";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface PractitionerAvailabilityFormProps {
  practitionerId: string;
}

const PractitionerAvailabilityForm = ({
  practitionerId,
}: PractitionerAvailabilityFormProps) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch Slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch(
          `/api/practitioners/${practitionerId}/availability`,
        );
        if (!res.ok) throw new Error("Failed to fetch slots");
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (error) {
        setMessage({ type: "error", text: "Failed to load slots." });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [practitionerId]);

  // Add Slot
  const handleAddSlot = async () => {
    setMessage(null);
    try {
      const res = await fetch(
        `/api/practitioners/${practitionerId}/availability`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (!res.ok) throw new Error("Failed to add slot");

      const newSlot = await res.json();
      setSlots((prev) => [...prev, newSlot.slot]);
      setMessage({ type: "success", text: "Slot added successfully." });
      setFormData({ date: "", start_time: "", end_time: "" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add slot." });
    }
  };

  // Remove Slot
  const handleRemoveSlot = async (slotId: string) => {
    setMessage(null);
    try {
      const res = await fetch(
        `/api/practitioners/${practitionerId}/availability/${slotId}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Failed to remove slot");

      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      setMessage({ type: "success", text: "Slot removed successfully." });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to remove slot." });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practitioner Availability</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <DashboardLoader text="Loading Availability Slots..." />
        ) : (
          <>
            {/* Message Display */}
            {message && (
              <div
                className={`p-2 mb-4 text-sm rounded-md ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Add Availability Form */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Add Availability</h2>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  placeholder="Date"
                />
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  placeholder="Start Time"
                />
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  placeholder="End Time"
                />
              </div>
              <Button onClick={handleAddSlot} className="mt-2">
                Add Slot
              </Button>
            </div>

            {/* Display Slots */}
            <h2 className="text-lg font-semibold mt-6">Available Slots</h2>
            {slots.length === 0 ? (
              <p className="text-gray-500">No slots available.</p>
            ) : (
              <ul className="space-y-2 mt-4">
                {slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div>
                      <p>
                        📅 {slot.date} | ⏰ {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveSlot(slot.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PractitionerAvailabilityForm;
