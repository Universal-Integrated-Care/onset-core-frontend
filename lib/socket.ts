import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      path: "/api/socket", // Ensure this matches the server path
    });

    socket.on("connect", () => {
      console.log("✅ Connected to Socket.IO server");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from Socket.IO server");
    });
  }

  return socket;
};
