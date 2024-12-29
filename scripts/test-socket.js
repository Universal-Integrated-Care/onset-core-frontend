const { io } = require("socket.io-client");

// Connect to the Socket.IO server
const socket = io("http://localhost:3000", {
  path: "/api/socket",
});

socket.on("connect", () => {
  console.log("✅ Connected to the Socket.IO server!");

  // Test `ping` event
  socket.emit("ping");
});

socket.on("pong", (message) => {
  console.log("🏓 Received from server:", message);
});

// Listen for new appointments
socket.on("newAppointment", (data) => {
  console.log("📅 New Appointment Event Received:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Disconnected from the server");
});
