// types/ably.ts

import type { Types } from "ably";
import type { Appointment } from "./appointment";

declare interface AblyChannelMessage {
  name: string;
  data: unknown;
}

declare interface AppointmentUpdateMessage extends AblyChannelMessage {
  name: "newAppointment";
  data: Appointment;
}

declare interface AblyClientConfig {
  key: string;
  clientId?: string;
}

declare interface AblyPublishOptions {
  channelName: string;
  eventName: string;
  data: unknown;
}

export type AblyMessageCallback = (message: Types.Message) => void;
