"use server"

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function verifyAdmin(){
    const { userId }= await auth();
    if(!userId){
        return null;
    }

    try {
        const user = await db.user.findUnique({
          where: {
            clerkUserId: userId,
          },
        });
        
        if(user?.role=="ADMIN"){
            return true;
        }
      } catch (error) {
        console.error("Failed to verify admin", error);
        return false;
      }
}

export type AdminResponse = {
  success: boolean;
  message?: string;
  doctors?: any[];
  payouts?:any[];
  redirect?: string;
};

/**
 * Gets all doctors with pending verification
 */
export async function getPendingDoctors(): Promise<AdminResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "Unauthorized for app",
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized for admin",
      };
    }

    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("doctors in db is ",doctors);

    return {
      success: true,
      doctors,
    };
  } catch (error) {
    console.error("[GET_PENDING_DOCTORS]", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

/**
 * Gets all verified doctors
 */
export async function getVerifiedDoctors(): Promise<AdminResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const doctors = await db.user.findMany({
      where: {
        role: "DOCTOR",
        verificationStatus: "VERIFIED",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      doctors,
    };
  } catch (error) {
    console.error("[GET_VERIFIED_DOCTORS]", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

/**
 * Updates a doctor's verification status
 */
export async function updateDoctorStatus(
  formData: FormData
): Promise<AdminResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user || user.role !== "ADMIN") {
      return {
        success: false,
        message: "Unauthorized",
      };
    }

    const doctorId = formData.get("doctorId") as string;
    const status = formData.get("status") as "VERIFIED" | "REJECTED";

    if (!doctorId || !status) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const doctor = await db.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || doctor.role !== "DOCTOR") {
      return {
        success: false,
        message: "Doctor not found",
      };
    }

    await db.user.update({
      where: { id: doctorId },
      data: {
        verificationStatus: status,
      },
    });

    revalidatePath("/admin");

    return {
      success: true,
      message: `Doctor ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.error("[UPDATE_DOCTOR_STATUS]", error);
    return {
      success: false,
      message: "Internal server error",
    };
  }
}

/**
 * Suspends or reinstates a doctor
 */
export async function updateDoctorActiveStatus(formData:any) {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) throw new Error("Unauthorized");
  
    const doctorId = formData.get("doctorId");
    const suspend = formData.get("suspend") === "true";
  
    if (!doctorId) {
      throw new Error("Doctor ID is required");
    }
  
    try {
      const status = suspend ? "PENDING" : "VERIFIED";
  
      await db.user.update({
        where: {
          id: doctorId,
        },
        data: {
          verificationStatus: status,
        },
      });
  
      revalidatePath("/admin");
      return { success: true };
    } catch (error:any) {
      console.error("Failed to update doctor active status:", error);
      throw new Error(`Failed to update doctor status: ${error.message}`);
    }
}

// set the doctor payout status
// export async function updateDoctorPayoutStatus(
//   formData: FormData
// ): Promise<AdminResponse> {
//   try {
//     const { userId } = await auth();

//     if (!userId) {
//       return {
//         success: false,
//         message: "Unauthorized",
//       };
//     }

//     const user = await db.user.findUnique({
//       where: { clerkUserId: userId },
//     });

//     if (!user || user.role !== "ADMIN") {
//       return {
//         success: false,
//         message: "Unauthorized",
//       };
//     }

//     const doctorId = formData.get("doctorId") as string;
//     const payoutStatus = formData.get("status") as "PROCESSING" | "PROCESSED";

//     if (!doctorId || !status) {
//       return {
//         success: false,
//         message: "Missing required fields",
//       };
//     }

//     const doctor = await db.user.findUnique({
//       where: { id: doctorId },
//     });

//     if (!doctor || doctor.role !== "DOCTOR") {
//       return {
//         success: false,
//         message: "Doctor not found",
//       };
//     }

//     await db.payout.update({
//       where: { id: doctorId },
//       data: {
//         status: payoutStatus,
//       },
//     });

//     revalidatePath("/admin");

//     return {
//       success: true,
//       message: `Doctor ${payoutStatus.toLowerCase()} successfully`,
//     };
//   } catch (error) {
//     console.error("[UPDATE_DOCTOR_STATUS]", error);
//     return {
//       success: false,
//       message: "Internal server error",
//     };
//   }
// }

/**
 * Approve a payout (admin marks as processed)
 */
export async function approvePayout(payoutId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Optionally: check if user is admin here

  try {
    const payout = await db.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new Error("Payout not found");
    if (payout.status === "PROCESSED") throw new Error("Already processed");

    const updated = await db.payout.update({
      where: { id: payoutId },
      data: {
        status: "PROCESSED",
        processedAt: new Date(),
        processedBy: userId,
      },
    });

    // get doctorId
    const findDoctor = await db.payout.findUnique({
      where: { id: payoutId },
      include: {
        doctor: true,
      },
    });

    const doctorId = findDoctor?.doctorId;
    const updateDoctorCredits = await db.user.update({
      where:{ id : doctorId},
      data: {
        credits : 0,
      }
    })

    revalidatePath("/admin");

    return { success: true, payout: updated };
  } catch (error:any) {
    throw new Error("Failed to approve payout: " + error.message);
  }
}

/**
 * Get all pending payouts (for admin)
 */
export async function getPendingPayouts()  {
  // Optionally: check if user is admin here
  try {
    const payouts = await db.payout.findMany({
      where: { status: "PROCESSING" },
      orderBy: { createdAt: "asc" },
      include: { doctor: true },
    });
    return { success:true , payouts };
  } catch (error:any) {
    throw new Error("Failed to fetch pending payouts: " + error.message);
  }
}

/**
 * Get all approved payouts (for admin)
 */
export async function getApprovedPayouts() {
  // Optionally: check if user is admin here
  try {
    const payouts = await db.payout.findMany({
      where: { status: "PROCESSED" },
      orderBy: { processedAt: "desc" },
      include: { doctor: true },
    });
    return { payouts };
  } catch (error:any) {
    throw new Error("Failed to fetch approved payouts: " + error.message);
  }
}