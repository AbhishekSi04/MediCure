"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react"
import { toast } from "sonner"
import { io, Socket } from "socket.io-client"

interface VideoCallModalProps {
  isOpen: boolean
  onClose: () => void
  appointmentId: string
  userRole: "DOCTOR" | "PATIENT"
  videoSessionId: string | null | undefined
}

export function VideoCallModal({
  isOpen,
  onClose,
  appointmentId,
  userRole,
  videoSessionId,
}: VideoCallModalProps) {
  const [isCallAccepted, setIsCallAccepted] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const socketRef = useRef<Socket | null>(null)

  // Initialize WebRTC connection
  useEffect(() => {
    if (!isOpen) return

    const initializeWebRTC = async () => {
      try {
        setIsLoading(true)
        // Connect to signaling server
        const socket = io(process.env.NEXT_PUBLIC_SIGNALING_SERVER_URL || "http://localhost:3001")
        socketRef.current = socket

        // Join the room for this appointment
        socket.emit("join-room", appointmentId)

        // Get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        localStreamRef.current = stream

        // Set local video stream
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }

        // Create peer connection
        const configuration = {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            // Add your TURN server configuration here
          ],
        }
        const peerConnection = new RTCPeerConnection(configuration)
        peerConnectionRef.current = peerConnection

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream)
        })

        // Handle incoming stream
        peerConnection.ontrack = (event) => {
          console.log("Received remote track:", event.streams[0])
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0]
          }
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              appointmentId,
              candidate: event.candidate,
            })
          }
        }

        // Handle ICE connection state changes
        peerConnection.oniceconnectionstatechange = () => {
          console.log("ICE Connection State:", peerConnection.iceConnectionState)
          if (peerConnection.iceConnectionState === "connected") {
            setIsLoading(false)
          }
        }

        // Handle incoming ICE candidates
        socket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
          try {
            await peerConnection.addIceCandidate(candidate)
          } catch (error) {
            console.error("Error adding ICE candidate:", error)
          }
        })

        // If doctor initiates the call
        if (userRole === "DOCTOR") {
          const offer = await peerConnection.createOffer()
          await peerConnection.setLocalDescription(offer)
          socket.emit("offer", {
            appointmentId,
            offer,
          })
        }

        // Handle incoming offers
        socket.on("offer", async (offer: RTCSessionDescriptionInit) => {
          try {
            await peerConnection.setRemoteDescription(offer)
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)
            socket.emit("answer", {
              appointmentId,
              answer,
            })
          } catch (error) {
            console.error("Error handling offer:", error)
          }
        })

        // Handle incoming answers
        socket.on("answer", async (answer: RTCSessionDescriptionInit) => {
          try {
            await peerConnection.setRemoteDescription(answer)
          } catch (error) {
            console.error("Error handling answer:", error)
          }
        })

        // Handle call acceptance
        socket.on("call-accepted", () => {
          setIsCallAccepted(true)
          setIsCallActive(true)
        })

        // Handle call rejection
        socket.on("call-rejected", () => {
          toast.error("Call was rejected")
          onClose()
        })

      } catch (error) {
        console.error("Error initializing WebRTC:", error)
        toast.error("Failed to initialize video call")
      } finally {
        setIsLoading(false)
      }
    }

    initializeWebRTC()

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [isOpen, userRole, appointmentId, onClose])

  const handleAcceptCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("call-accepted", { appointmentId })
    }
    setIsCallAccepted(true)
    setIsCallActive(true)
  }

  const handleRejectCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("call-rejected", { appointmentId })
    }
    onClose()
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!isVideoOff)
      }
    }
  }

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    setIsCallActive(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Video Call</DialogTitle>
        </DialogHeader>
        
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white">Connecting...</div>
            </div>
          )}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
          />
        </div>

        {!isCallAccepted && userRole === "PATIENT" ? (
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Accept Call
            </Button>
            <Button
              onClick={handleRejectCall}
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={toggleMute}
              variant="outline"
              className={isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"}
            >
              {isMuted ? (
                <MicOff className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-4 w-4 text-white" />
              )}
            </Button>
            <Button
              onClick={toggleVideo}
              variant="outline"
              className={isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-500 hover:bg-gray-600"}
            >
              {isVideoOff ? (
                <VideoOff className="h-4 w-4 text-white" />
              ) : (
                <Video className="h-4 w-4 text-white" />
              )}
            </Button>
            <Button
              onClick={endCall}
              variant="outline"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 