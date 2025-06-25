// chat-server.js
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Use environment variable in production
    methods: ["GET", "POST"]
  }
});

// Store users in rooms based on chatRoomId
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ chatRoomId }) => {
    socket.join(chatRoomId);
  });

  socket.on("leaveRoom", ({ chatRoomId }) => {
    socket.leave(chatRoomId);
  });

  socket.on("sendMessage", ({ chatRoomId, message }) => {
    // Broadcast to everyone in the room except sender
    socket.to(chatRoomId).emit("receiveMessage", message);
    // Optionally: Save message to DB here
  });

  socket.on("disconnect", () => {
    // Handle disconnect logic if needed
  });
});

const PORT = process.env.CHAT_PORT || 3002; // Use different port from signaling server
httpServer.listen(PORT, () => {
  console.log(`Chat Socket.IO server running on port ${PORT}`);
});