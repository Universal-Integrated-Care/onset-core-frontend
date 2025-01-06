// types/socket.d.ts

import { Server as SocketIOServer } from "socket.io";

declare global {
  namespace globalThis {
    // eslint-disable-next-line no-var
    var io: SocketIOServer | undefined;
  }
}
