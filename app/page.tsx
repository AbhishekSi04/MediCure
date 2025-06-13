'use client'

import { PricingTable, useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { checkAndAllocateCredits } from "@/actions/credits";
import { checkUser } from "@/lib/checkUser";

export default function Home() {
  const { user: clerkUser } = useUser();
  const lastPlanRef = useRef<string | null>(null);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const handleSubscriptionChange = async () => {
      if (clerkUser) {
        // Get current subscription plan from Clerk
        const subscription = clerkUser.publicMetadata.subscription as string | undefined;
        const currentPlan = subscription || "free_user";

        // Skip the first load check
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          lastPlanRef.current = currentPlan;
          return;
        }

        // Only proceed if the plan has changed
        if (currentPlan !== lastPlanRef.current) {
          console.log("Subscription plan changed from", lastPlanRef.current, "to", currentPlan);
          lastPlanRef.current = currentPlan;
          
          const dbUser = await checkUser();
          if (!('error' in dbUser) && dbUser.role === 'PATIENT') {
            await checkAndAllocateCredits(dbUser);
          }
        }
      }
    };

    // Set up an interval to check for subscription changes
    const interval = setInterval(handleSubscriptionChange, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, [clerkUser]);

  return (
    <div className="">
      <PricingTable />
    </div>
  );
}
