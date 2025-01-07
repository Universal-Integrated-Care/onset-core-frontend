// hooks/useAblyAppointmentSubscription.ts
import { useState, useEffect } from "react";
import { getAblyClient } from "@/lib/alby";

export function useAblyAppointmentSubscription(clinicId: number) {
  const [appointments, setAppointments] = useState<AblyAppointmentMessage[]>(
    [],
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const ably = getAblyClient();
    const channel = ably.channels.get(`clinic_${clinicId}`);

    const setupSubscription = async () => {
      try {
        // Subscribe to new appointments
        await channel.subscribe("newAppointment", (message) => {
          setAppointments((currentAppointments) => {
            return [
              message.data as AblyAppointmentMessage,
              ...currentAppointments,
            ];
          });
        });

        // Handle connection state
        ably.connection.on(
          "failed",
          (stateChange: {
            current: string;
            previous: string;
            reason?: unknown;
          }) => {
            if (stateChange.current === "failed") {
              setError(new Error("Failed to connect to Ably"));
            }
          },
        );
      } catch (err) {
        console.error("Error setting up Ably subscription:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to connect to Ably"),
        );
      }
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      const cleanup = async () => {
        try {
          await channel.unsubscribe();
          ably.connection.off();
          channel.detach();
        } catch (err) {
          console.error("Error cleaning up Ably subscription:", err);
        }
      };
      cleanup();
    };
  }, [clinicId]);

  return { appointments, error };
}
