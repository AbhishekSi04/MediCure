"use server"

import { checkUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function checkAndAllocateCredits(user:any) {
    
    try {
        if(!user) {
            return {
                error: "User not found"
            }
        }
        
        // user is found
        // only if user is patient allocate them
        if(user.role !== "PATIENT") {
            // allocate credits
            return user;
        }
    
        // check user has any credits
        const {has} = await auth();
         // Check which plan the user has
         const hasBasic = has({ plan: "free_user" });
         const hasStandard = has({ plan: "standard" });
         const hasPremium = has({ plan: "premium" });
    
         let currentPlan = "free_user";
         let creditsToAllocate = 0;
    
         if(hasBasic) {
            currentPlan = "free_user";
            creditsToAllocate = 4;
         }
         else if(hasStandard) {
            currentPlan = "standard";
            creditsToAllocate = 20;
         }
         else if(hasPremium) {
            currentPlan = "premium";
            creditsToAllocate = 100;
         }
    
         // if user not have any plans
         if(!currentPlan) {
            return user;
         }
    
         // Allocate credits and create transaction record
        const updatedUser = await db.$transaction(async (tx) => {
            // Create transaction record
            await tx.creditTransaction.create({
              data: {
                userId: user.id,
                amount: creditsToAllocate,
                type: "CREDIT_PURCHASE",
                packageId: currentPlan,
              },
            });
    
         const updatedUser = await tx.user.update({
            where: {
                id: user.id
            },
            data: {
                credits: {increment: creditsToAllocate}
            }
         })
         return updatedUser;
         
        });
    
        revalidatePath("/doctors");
        revalidatePath("/appointments");

        console.log("updatedUser is :",updatedUser);
    
        return updatedUser;
        
    } catch (error:any) {
        console.error(
            "Failed to check subscription and allocate credits:",
            error.message
          );
          return null;
    }

}

export async function getCurrentSubscriptionPlan() {
  try {
    const { has } = await auth();
    
    const hasBasic = has({ plan: "free_user" });
    const hasStandard = has({ plan: "standard" });
    const hasPremium = has({ plan: "premium" });
    
    let currentPlan = "free_user";
    
    if (hasBasic) {
      currentPlan = "free_user";
    } else if (hasStandard) {
      currentPlan = "standard";
    } else if (hasPremium) {
      currentPlan = "premium";
    }
    
    return { plan: currentPlan };
  } catch (error: any) {
    console.error("Failed to get subscription plan:", error.message);
    return { plan: "free_user" };
  }
}