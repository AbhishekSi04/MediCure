"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Video } from "lucide-react"
import { format } from "date-fns"

interface AppointmentCardProps {
  appointment: {
    id: string
    startTime: Date
    endTime: Date
    status: string
    notes?: string | null
    patientDescription?: string | null
    videoSessionId?: string | null
    doctor: {
      name: string | null
      id: string
      specialty: string | null
    }
  }
  userRole: "DOCTOR" | "PATIENT"
  refetchAppointments?: () => void
}

export default function AppointmentCard({ appointment, userRole }: AppointmentCardProps) {
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

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-emerald-400" />
            <span className="font-medium text-white">
              {userRole === "PATIENT" ? appointment.doctor.name : "Patient"}
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
      </div>
    </Card>
  )
} 