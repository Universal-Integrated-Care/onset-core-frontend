import * as Ably from "ably";

// For client-side subscriptions
export function getAblyClient() {
  if (!process.env.NEXT_PUBLIC_ABLY_API_KEY) {
    throw new Error("NEXT_PUBLIC_ABLY_API_KEY is not set");
  }

  return new Ably.Realtime({
    key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
    clientId: "appointment-system",
    autoConnect: typeof window !== "undefined",
  });
}

// For server-side publishing
export function getAblyServerClient() {
  if (!process.env.ABLY_API_KEY) {
    throw new Error("ABLY_API_KEY is not set");
  }
  return new Ably.Rest(process.env.ABLY_API_KEY);
}

// Publishing function using server client
export async function publishAppointmentUpdate(
  clinicId: number,
  appointmentData: unknown,
) {
  try {
    const ably = getAblyServerClient(); // Changed to use server client
    const channelName = `clinic_${clinicId}`;
    const channel = ably.channels.get(channelName);

    await channel.publish("newAppointment", appointmentData);
    console.log(
      `✅ Published appointment update to channel: ${channelName}`,
      appointmentData,
    );
  } catch (error) {
    console.error("❌ Error publishing to Ably:", error);
    throw error;
  }
}
