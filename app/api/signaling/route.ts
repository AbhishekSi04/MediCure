import { NextResponse } from "next/server"
import { Server } from "socket.io"
import { createServer } from "http"

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    methods: ["GET", "POST"],
  },
})

// Store active connections
const activeConnections = new Map()

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  // Join a room for a specific appointment
  socket.on("join-room", (appointmentId: string) => {
    socket.join(appointmentId)
    console.log(`Client ${socket.id} joined room ${appointmentId}`)
  })

  // Handle WebRTC signaling
  socket.on("offer", (data: { appointmentId: string; offer: RTCSessionDescriptionInit }) => {
    socket.to(data.appointmentId).emit("offer", data.offer)
  })

  socket.on("answer", (data: { appointmentId: string; answer: RTCSessionDescriptionInit }) => {
    socket.to(data.appointmentId).emit("answer", data.answer)
  })

  socket.on("ice-candidate", (data: { appointmentId: string; candidate: RTCIceCandidateInit }) => {
    socket.to(data.appointmentId).emit("ice-candidate", data.candidate)
  })

  // Handle call acceptance/rejection
  socket.on("call-accepted", (data: { appointmentId: string }) => {
    socket.to(data.appointmentId).emit("call-accepted")
  })

  socket.on("call-rejected", (data: { appointmentId: string }) => {
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

export async function GET() {
  return NextResponse.json({ status: "Signaling server is running" })
} 