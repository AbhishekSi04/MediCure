"use server"

import { db } from "@/lib/prisma";
import { addDays, addMinutes, endOfDay, format } from "date-fns";
import { getCurrentUser } from "./onboarding";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface TimeSlot {
  startTime: string;
  endTime: string;
  formatted: string;
  day: string;
}

interface AvailableSlots {
  [key: string]: TimeSlot[];
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(doctorId : string) {
    try {
      const doctor = await db.user.findUnique({
        where: {
          id: doctorId,
          role: "DOCTOR",
          verificationStatus: "VERIFIED",
        },
      });
  
      if (!doctor) {
        throw new Error("Doctor not found");
      }
  
      return { doctor };
    } catch (error) {
      console.error("Failed to fetch doctor:", error);
      throw new Error("Failed to fetch doctor details");
    }
  }


  
/**
 * Get available time slots for booking for the next 4 days
 */
export async function getAvailableTimeSlots(doctorId: string) {
  try {
    // Step 1: Check if doctor exists and is verified
    const doctor = await db.user.findUnique({
      where: {
        id: doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found or not verified");
    }

    // Step 2: Get doctor's availability
    const availability = await db.availability.findFirst({
      where: {
        doctorId: doctor.id,
        status: "AVAILABLE",
      },
    });

    if (!availability) {
      throw new Error("No availability set by doctor");
    }

    // Step 3: Get next 4 days
    const today = new Date();
    const nextFourDays = [
      today,
      addDays(today, 1),
      addDays(today, 2),
      addDays(today, 3)
    ];

    // Step 4: Get existing appointments
    const existingAppointments = await db.appointment.findMany({
      where: {
        doctorId: doctor.id,
        status: "SCHEDULED",
        startTime: {
          lte: endOfDay(nextFourDays[3]), // Up to end of 4th day
        },
      },
    });

    // Step 5: Generate available slots for each day
    const availableSlots: AvailableSlots = {};

    for (const day of nextFourDays) {
      const dayString = format(day, "yyyy-MM-dd");
      availableSlots[dayString] = [];

      // Get doctor's working hours for this day
      const workStart = new Date(availability.startTime);
      const workEnd = new Date(availability.endTime);

      // Set to current day
      workStart.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
      workEnd.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());

      // Generate 30-minute slots
      let currentSlot = new Date(workStart);
      while (currentSlot < workEnd) {
        const nextSlot = addMinutes(currentSlot, 30);

        // Skip past slots
        if (currentSlot < today) {
          currentSlot = nextSlot;
          continue;
        }

        // Check if slot is available
        const isSlotAvailable = !existingAppointments.some(appointment => {
          const apptStart = new Date(appointment.startTime);
          const apptEnd = new Date(appointment.endTime);
          return (
            (currentSlot >= apptStart && currentSlot < apptEnd) ||
            (nextSlot > apptStart && nextSlot <= apptEnd)
          );
        });

        if (isSlotAvailable) {
          availableSlots[dayString].push({
            startTime: currentSlot.toISOString(),
            endTime: nextSlot.toISOString(),
            formatted: `${format(currentSlot, "h:mm a")} - ${format(nextSlot, "h:mm a")}`,
            day: format(currentSlot, "EEEE, MMMM d"),
          });
        }

        currentSlot = nextSlot;
      }
    }

    // Step 6: Format result for UI
    const result = Object.entries(availableSlots).map(([date, slots]) => ({
      date,
      displayDate: slots.length > 0 ? slots[0].day : format(new Date(date), "EEEE, MMMM d"),
      slots,
    }));

    return { days: result };
  } catch (error: any) {
    console.error("Error getting available slots:", error);
    throw new Error("Failed to get available time slots: " + error.message);
  }
}


/**
 * Book a new appointment with a doctor
 */
// export async function bookAppointment(formData:FormData) {
//     const { userId } = await auth();
  
//     if (!userId) {
//       throw new Error("Unauthorized");
//     }
  
//     try {
//       // Get the patient user
//       const patient = await db.user.findUnique({
//         where: {
//           clerkUserId: userId,
//           role: "PATIENT",
//         },
//       });
  
//       if (!patient) {
//         throw new Error("Patient not found");
//       }
  
//       // Parse form data
//       const doctorId = formData.get("doctorId");
//       const startTime = new Date(formData.get("startTime"));
//       const endTime = new Date(formData.get("endTime"));
//       const patientDescription = formData.get("description") || null;
  
//       // Validate input
//       if (!doctorId || !startTime || !endTime) {
//         throw new Error("Doctor, start time, and end time are required");
//       }
  
//       // Check if the doctor exists and is verified
//       const doctor = await db.user.findUnique({
//         where: {
//           id: doctorId,
//           role: "DOCTOR",
//           verificationStatus: "VERIFIED",
//         },
//       });
  
//       if (!doctor) {
//         throw new Error("Doctor not found or not verified");
//       }
  
//       // Check if the patient has enough credits (2 credits per appointment)
//       if (patient.credits < 2) {
//         throw new Error("Insufficient credits to book an appointment");
//       }
  
//       // Check if the requested time slot is available
//       const overlappingAppointment = await db.appointment.findFirst({
//         where: {
//           doctorId: doctorId,
//           status: "SCHEDULED",
//           OR: [
//             {
//               // New appointment starts during an existing appointment
//               startTime: {
//                 lte: startTime,
//               },
//               endTime: {
//                 gt: startTime,
//               },
//             },
//             {
//               // New appointment ends during an existing appointment
//               startTime: {
//                 lt: endTime,
//               },
//               endTime: {
//                 gte: endTime,
//               },
//             },
//             {
//               // New appointment completely overlaps an existing appointment
//               startTime: {
//                 gte: startTime,
//               },
//               endTime: {
//                 lte: endTime,
//               },
//             },
//           ],
//         },
//       });
  
//       if (overlappingAppointment) {
//         throw new Error("This time slot is already booked");
//       }
  
//       // Create a new Vonage Video API session
//       const sessionId = await createVideoSession();
  
//       // Deduct credits from patient and add to doctor
//       const { success, error } = await deductCreditsForAppointment(
//         patient.id,
//         doctor.id
//       );
  
//       if (!success) {
//         throw new Error(error || "Failed to deduct credits");
//       }
  
//       // Create the appointment with the video session ID
//       const appointment = await db.appointment.create({
//         data: {
//           patientId: patient.id,
//           doctorId: doctor.id,
//           startTime,
//           endTime,
//           patientDescription,
//           status: "SCHEDULED",
//           videoSessionId: sessionId, // Store the Vonage session ID
//         },
//       });
  
//       revalidatePath("/appointments");
//       return { success: true, appointment: appointment };
//     } catch (error) {
//       console.error("Failed to book appointment:", error);
//       throw new Error("Failed to book appointment:" + error.message);
//     }
//   }

interface CreateAppointmentData {
  doctorId: string;
  startTime: string;
  endTime: string;
  description: string;
  notes?: string;
}

export async function createAppointment(data: CreateAppointmentData) {
  try {
    // Step 1: Get current user
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
        role: "PATIENT",
      },
    });

    if (!user) {
      throw new Error("Only patients can book appointments");
    }

    // Step 2: Validate doctor exists
    const doctor = await db.user.findUnique({
      where: {
        id: data.doctorId,
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
    });

    if (!doctor) {
      throw new Error("Doctor not found or not verified");
    }

    // Step 3: Check for overlapping appointments
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const overlappingAppointment = await db.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        status: "SCHEDULED",
        OR: [
          // Check if new appointment overlaps with existing ones
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } },
            ],
          },
        ],
      },
    });

    if (overlappingAppointment) {
      throw new Error("This time slot is no longer available");
    }

    // Step 4: Create the appointment
    const appointment = await db.appointment.create({
      data: {
        patientId: user.id,
        doctorId: data.doctorId,
        startTime: startTime,
        endTime: endTime,
        status: "SCHEDULED",
        patientDescription: data.description,
        notes: data.notes,
      },
      include: {
        doctor: {
          select: {
            name: true,
            email: true,
          },
        },
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/appointments");
    return { appointment };
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    throw new Error(error.message || "Failed to create appointment");
  }
}