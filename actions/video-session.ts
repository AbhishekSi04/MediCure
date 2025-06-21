"use server"

import { v4 as uuidv4 } from "uuid"
import { db } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function generateVideoSession(appointmentId: string) {
  try {
    const { userId } =await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    // Generate a unique video session ID
    const videoSessionId = uuidv4()

    // Update the appointment with the video session ID
    const updatedAppointment = await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        videoSessionId:videoSessionId,
      },
    })

    return { videoSessionId: updatedAppointment.videoSessionId }
  } catch (error) {
    console.error("Error generating video session:", error)
    throw new Error("Failed to generate video session")
  }
}

export async function deleteVideoSession(appointmentId: string) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error("Unauthorized")
    }

    // Remove the video session ID from the appointment
    const updatedAppointment = await db.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        videoSessionId: null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error deleting video session:", error)
    throw new Error("Failed to delete video session")
  }
} 