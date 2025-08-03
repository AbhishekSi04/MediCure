"use client";

import { useState, useEffect } from "react";
import {  TabsContent } from "@/components/ui/tabs";
import { PendingDoctors } from "./_components/pending-doctors";
import { VerifiedDoctors } from "./_components/verified-doctors";
import { getPendingDoctors, getVerifiedDoctors, AdminResponse, getPendingPayouts } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";
import { PendingPayouts } from "./_components/pending-payouts";
// import { TabContext } from "./layout";

export default function AdminPage() {
  // const [activeTab, setActiveTab] = useState<"pending" | "verified" | "payouts">("pending");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    loading: pendingLoading,
    data: pendingData,
    error: pendingError,
    fn: fetchPendingDoctors,
  } = useFetch<AdminResponse>(getPendingDoctors);

  const {
    loading: verifiedLoading,
    data: verifiedData,
    error: verifiedError,
    fn: fetchVerifiedDoctors,
  } = useFetch<AdminResponse>(getVerifiedDoctors);

  const {
    loading: payoutLoading,
    data: payoutData,
    error: payoutError,
    fn: fetchPendingPayouts,
  } = useFetch<AdminResponse>(getPendingPayouts);

  // console.log("payout data is ",payoutData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchPendingDoctors(new FormData());
        fetchVerifiedDoctors(new FormData());
        fetchPendingPayouts(new FormData());
        // if (activeTab === "pending") {
        //     // console.log("pending data is ",pendingData);
        //   await fetchPendingDoctors(new FormData());
        // } else if(activeTab === "verified") {
        //   await fetchVerifiedDoctors(new FormData());
        // }
        // else{
        //   await fetchPendingPayouts(new FormData());
        // }
      } catch (error) {
        toast.error("Failed to fetch doctors data");
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchData();
  }, []);

  // Show error messages if any
  useEffect(() => {
    if (pendingError) {
      toast.error(pendingError.message);
    }
    if (verifiedError) {
      toast.error(verifiedError.message);
    }
    if (payoutError) {
      toast.error(payoutError.message);
    }
  }, [pendingError, verifiedError,payoutError]);

  return (
    <div className="container mx-auto ">
      {/* <Tabs
        defaultValue="pending"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      > */}
        {/* <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Doctors</TabsTrigger>
          <TabsTrigger value="verified">Verified Doctors</TabsTrigger>
        </TabsList> */}

        <TabsContent value="pending" className="space-y-4">
            {(isInitialLoad || pendingLoading) ? (
              
              <div className="flex justify-center py-8">
                <BarLoader width={"100%"} color="#60A5FA" />
              </div>
            ) : (
              <PendingDoctors doctors={pendingData?.doctors || []} />
            )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
            {isInitialLoad || verifiedLoading ? (
              <div className="flex justify-center py-8">
                <BarLoader width={"100%"} color="##60A5FA" />
              </div>
            ) : (
              <VerifiedDoctors doctors={verifiedData?.doctors || []} />
            )}
        </TabsContent>

        <TabsContent  value="payouts" className="space-y-4">
          {isInitialLoad || payoutLoading ? (
            <div className="flex justify-center py-8">
              <BarLoader width={"100%"} color="#60A5FA" />
            </div>
          ) : (
            <PendingPayouts payouts={payoutData?.payouts || []} />
          )}
        </TabsContent>
      {/* </Tabs> */}
    </div>
  );
}
