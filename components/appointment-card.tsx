"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video, Eye } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { completeAppointment, cancelAppointment } from "@/actions/appointments"
import { generateVideoSession, deleteVideoSession } from "@/actions/video-session"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { VideoCallModal } from "./video-call-modal"

interface AppointmentCardProps {
  appointment: {
    id: string
    startTime: Date
    endTime: Date
    status: string
    notes?: string | null
    patientDescription?: string | null
    videoSessionId?: string | null
    doctor?: {
      name: string | null
      id: string
      specialty: string | null
    } | null
  }
  userRole: "DOCTOR" | "PATIENT"
  refetchAppointments?: () => void
}

export default function AppointmentCard({ appointment, userRole, refetchAppointments }: AppointmentCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isGeneratingSession, setIsGeneratingSession] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-500"
      case "COMPLETED":
        return "bg-green-500"
      case "CANCELLED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleComplete = async () => {
    try {
      await completeAppointment(appointment.id)
      toast.success("Appointment marked as completed")
      refetchAppointments?.()
    } catch (error) {
      toast.error("Failed to complete appointment")
    }
  }

  const handleCancel = async () => {
    try {
      await cancelAppointment(appointment.id)
      toast.success("Appointment cancelled")
      refetchAppointments?.()
    } catch (error) {
      toast.error("Failed to cancel appointment")
    }
  }

  const handleGenerateVideoSession = async () => {
    try {
      setIsGeneratingSession(true)
      await generateVideoSession(appointment.id)
      toast.success("Video session generated successfully")
      refetchAppointments?.()
    } catch (error) {
      toast.error("Failed to generate video session")
    } finally {
      setIsGeneratingSession(false)
    }
  }

  const handleDeleteVideoSession = async () => {
    try {
      await deleteVideoSession(appointment.id)
      toast.success("Video session deleted successfully")
      refetchAppointments?.()
    } catch (error) {
      toast.error("Failed to delete video session")
    }
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-emerald-400" />
            <span className="font-medium text-white">
              {userRole === "PATIENT" ? appointment.doctor?.name || "Unknown Doctor" : "Patient"}
            </span>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} text-white`}>
            {appointment.status}
          </Badge>
        </div>

        <div className="flex items-center space-x-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(new Date(appointment.startTime), "MMMM d, yyyy")}</span>
        </div>

        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {format(new Date(appointment.startTime), "h:mm a")} -{" "}
            {format(new Date(appointment.endTime), "h:mm a")}
          </span>
        </div>

        {appointment.videoSessionId && (
          <div className="flex items-center space-x-2 text-emerald-400">
            <Video className="h-4 w-4" />
            <span>Video session available</span>
          </div>
        )}

        {appointment.notes && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Notes:</p>
            <p>{appointment.notes}</p>
          </div>
        )}

        {appointment.patientDescription && (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Patient Description:</p>
            <p>{appointment.patientDescription}</p>
          </div>
        )}

        {appointment.status === "SCHEDULED" && (
          <div className="flex gap-2 mt-2">
            <Button 
              onClick={() => setIsDetailsOpen(true)}
              variant="outline" 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {userRole === "DOCTOR" && (
              <Button 
                onClick={handleComplete}
                variant="outline" 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                Complete
              </Button>
            )}
            <Button 
              onClick={handleCancel}
              variant="outline" 
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              Cancel
            </Button>
          </div>
        )}

        {appointment.status === "SCHEDULED" && userRole === "DOCTOR" && !appointment.videoSessionId && (
          <Button
            onClick={handleGenerateVideoSession}
            variant="outline"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={isGeneratingSession}
          >
            <Video className="h-4 w-4 mr-2" />
            {isGeneratingSession ? "Generating..." : "Generate Video Session"}
          </Button>
        )}

        {appointment.videoSessionId && appointment.status === "SCHEDULED" && (
          <div className="flex gap-2">
            <Button
              onClick={() => setIsVideoCallOpen(true)}
              variant="outline"
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </Button>
            {userRole === "DOCTOR" && (
              <Button
                onClick={handleDeleteVideoSession}
                variant="outline"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Session
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-emerald-400" />
              <span className="font-medium">
                {userRole === "PATIENT" ? appointment.doctor?.name || "Unknown Doctor" : "Patient"}
              </span>
            </div>
            {appointment.doctor?.specialty && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Specialty:</p>
                <p>{appointment.doctor.specialty}</p>
              </div>
            )}
            {appointment.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Notes:</p>
                <p>{appointment.notes}</p>
              </div>
            )}
            {appointment.patientDescription && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Patient Description:</p>
                <p>{appointment.patientDescription}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <VideoCallModal
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        appointmentId={appointment.id}
        userRole={userRole}
        videoSessionId={appointment.videoSessionId}
      />
    </Card>
  )
}