const { Server } = require("socket.io")
const { createServer } = require("http")

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Store active connections
const activeConnections = new Map()

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  // Join a room for a specific appointment
  socket.on("join-room", (appointmentId) => {
    socket.join(appointmentId)
    console.log(`Client ${socket.id} joined room ${appointmentId}`)
  })

  // Handle WebRTC signaling
  socket.on("offer", (data) => {
    socket.to(data.appointmentId).emit("offer", data.offer)
  })

  socket.on("answer", (data) => {
    socket.to(data.appointmentId).emit("answer", data.answer)
  })

  socket.on("ice-candidate", (data) => {
    socket.to(data.appointmentId).emit("ice-candidate", data.candidate)
  })

  // Handle call acceptance/rejection
  socket.on("call-accepted", (data) => {
    socket.to(data.appointmentId).emit("call-accepted")
  })

  socket.on("call-rejected", (data) => {
    socket.to(data.appointmentId).emit("call-rejected")
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// Start the server
const PORT = process.env.SIGNALING_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})
