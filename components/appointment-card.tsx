"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video } from "lucide-react"
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
      await deleteVideoSession(appointment.id)
      toast.success("Appointment marked as completed")
      refetchAppointments?.()
    } catch (error:any) {
      toast.error("Failed to complete appointment",error.message)
    }
  }

  const handleCancel = async () => {
    try {
      await cancelAppointment(appointment.id)
      toast.success("Appointment cancelled")
      refetchAppointments?.()
    } catch (error:any) {
      toast.error("Failed to cancel appointment",error.message)
    }
  }

  const handleGenerateVideoSession = async () => {
    try {
      setIsGeneratingSession(true)
      await generateVideoSession(appointment.id)
      toast.success("Video session generated")
      refetchAppointments?.()
    } catch (error:any) {
      toast.error("Failed to generate video session ",error.message)
    } finally {
      setIsGeneratingSession(false)
    }
  }

  // const handleDeleteVideoSession = async () => {
  //   try {
  //     await deleteVideoSession(appointment.id)
  //     toast.success("Video session deleted")
  //     refetchAppointments?.()
  //   } catch (error) {
  //     toast.error("Failed to delete video session")
  //   }
  // }

  return (
    <Card className="p-6 rounded-2xl shadow-md bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 text-zinc-900 dark:text-white">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {userRole === "PATIENT" ? appointment.doctor?.name || "Unknown Doctor" : "Patient"}
          </div>
          {appointment.doctor?.specialty && (
            <p className="text-sm text-blue-700 dark:text-blue-200">Specialty: {appointment.doctor.specialty}</p>
          )}
        </div>
        <Badge className={`${getStatusColor(appointment.status)} text-white`}>{appointment.status}</Badge>
      </div>

      <div className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {format(new Date(appointment.startTime), "MMMM d, yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {format(new Date(appointment.startTime), "h:mm a")} - {format(new Date(appointment.endTime), "h:mm a")}
        </div>
        {appointment.notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
            <p className="font-medium text-zinc-900 dark:text-white">Notes:</p>
            <p>{appointment.notes}</p>
          </div>
        )}
        {appointment.patientDescription && (
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
            <p className="font-medium text-zinc-900 dark:text-white">Patient Description:</p>
            <p>{appointment.patientDescription}</p>
          </div>
        )}
        {appointment.videoSessionId && (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
            <Video className="h-4 w-4" />
            Video session available
          </div>
        )}
      </div>

      {/* Action Buttons - Responsive row */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2">
        {/* {appointment.status === "SCHEDULED" && (
          // <Button onClick={() => setIsDetailsOpen(true)} variant="outline" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          //   <Eye className="h-4 w-4 mr-2" /> View Details
          // </Button>
        )} */}
        {appointment.status === "SCHEDULED" && userRole === "DOCTOR" && (
          <Button onClick={handleComplete} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
            Complete
          </Button>
        )}
        {appointment.status === "SCHEDULED" && (
          <Button onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            Cancel
          </Button>
        )}
        {appointment.status === "SCHEDULED" && userRole === "DOCTOR" && !appointment.videoSessionId && (
          <Button onClick={handleGenerateVideoSession} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" disabled={isGeneratingSession}>
            <Video className="h-4 w-4 mr-2" />
            {isGeneratingSession ? "Generating..." : "Generate Video Session"}
          </Button>
        )}
        {appointment.videoSessionId && appointment.status === "SCHEDULED" && (
          <Button onClick={() => setIsVideoCallOpen(true)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
            <Video className="h-4 w-4 mr-2" />
            Start Video Call
          </Button>
        )}
        {/* {appointment.videoSessionId && appointment.status === "SCHEDULED" && userRole === "DOCTOR" && (
          <Button onClick={handleDeleteVideoSession} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
            Delete Session
          </Button>
        )} */}
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />
              {userRole === "PATIENT" ? appointment.doctor?.name : "Patient"}
            </div>
            {appointment.doctor?.specialty && (
              <>
                <p className="text-white font-medium">Specialty:</p>
                <p>{appointment.doctor.specialty}</p>
              </>
            )}
            {appointment.notes && (
              <>
                <p className="text-white font-medium">Notes:</p>
                <p>{appointment.notes}</p>
              </>
            )}
            {appointment.patientDescription && (
              <>
                <p className="text-white font-medium">Patient Description:</p>
                <p>{appointment.patientDescription}</p>
              </>
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
