import next from "next";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  try {
    await app.prepare();

    // ✅ Create the HTTP server
    const server = createServer((req, res) => {
      handle(req, res);
    });

    // ✅ Attach Socket.IO to the server
    const io = new SocketIOServer(server, {
      path: "/api/socket", // Matches client connection path
      cors: {
        origin: "*", // Allow all origins for testing
        methods: ["GET", "POST"],
      },
    });
    // ✅ Make io globally accessible
    (global as any).io = io;

    // ✅ Handle Socket.IO Events
    io.on("connection", (socket) => {
      console.log("✅ Client connected via Socket.IO");

      socket.on("ping", () => {
        console.log("🏓 Received ping from client");
        socket.emit("pong", "🏓 Pong from server!");
      });

      socket.on("appointmentCreated", (data) => {
        console.log("📅 New Appointment Created:", data);
        // Broadcast event to all clients
        io.emit("newAppointment", data);
      });

      socket.on("disconnect", () => {
        console.log("❌ Client disconnected");
      });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error starting server:", error);
    process.exit(1);
  }
}

startServer();
