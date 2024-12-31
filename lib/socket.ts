// /lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io({
      path: "/api/socket", // Must match the server path
      transports: ["websocket"], // Force WebSocket for better performance
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection Error:", err.message);
    });
  }

  return socket;
};
