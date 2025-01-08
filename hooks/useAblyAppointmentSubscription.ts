import { useState, useEffect } from "react";
import { getAblyClient } from "@/lib/alby";
import Ably from "ably";

interface ConnectionStateChange {
  current: string;
  previous: string;
  reason?: unknown;
}

export function useAblyAppointmentSubscription(clinicId: number) {
  const [appointments, setAppointments] = useState<AblyAppointmentMessage[]>(
    [],
  );
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const ably = getAblyClient();
    const channel = ably.channels.get(`clinic_${clinicId}`);

    const handleMessage = (message: Ably.Message) => {
      if (!isSubscribed) return;
      setAppointments((currentAppointments) => [
        message.data as AblyAppointmentMessage,
        ...currentAppointments,
      ]);
    };

    const handleConnectionFailure = (stateChange: ConnectionStateChange) => {
      if (!isSubscribed) return;
      if (stateChange.current === "failed") {
        setError(new Error("Failed to connect to Ably"));
      }
    };

    try {
      channel.subscribe("newAppointment", handleMessage);
      ably.connection.on("failed", handleConnectionFailure);
    } catch (err) {
      console.error("Error setting up Ably subscription:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to connect to Ably"),
      );
    }

    return () => {
      isSubscribed = false;
      channel.unsubscribe("newAppointment", handleMessage);
      ably.connection.off("failed", handleConnectionFailure);
    };
  }, [clinicId]);

  return { appointments, error };
}
