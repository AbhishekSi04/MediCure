"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingDoctors } from "./_components/pending-doctors";
import { VerifiedDoctors } from "./_components/verified-doctors";
import { getPendingDoctors, getVerifiedDoctors, AdminResponse } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { toast } from "sonner";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("pending");
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "pending") {
            console.log("pending data is ",pendingData);
          await fetchPendingDoctors(new FormData());
        } else {
          await fetchVerifiedDoctors(new FormData());
        }
      } catch (error) {
        toast.error("Failed to fetch doctors data");
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Show error messages if any
  useEffect(() => {
    if (pendingError) {
      toast.error(pendingError.message);
    }
    if (verifiedError) {
      toast.error(verifiedError.message);
    }
  }, [pendingError, verifiedError]);

  return (
    <div className="container mx-auto py-8">
      <Tabs
        defaultValue="pending"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Doctors</TabsTrigger>
          <TabsTrigger value="verified">Verified Doctors</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isInitialLoad || pendingLoading ? (
            <div className="flex justify-center py-8">
              <BarLoader width={"100%"} color="#36d7b7" />
            </div>
          ) : (
            <PendingDoctors doctors={pendingData?.doctors || []} />
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {isInitialLoad || verifiedLoading ? (
            <div className="flex justify-center py-8">
              <BarLoader width={"100%"} color="#36d7b7" />
            </div>
          ) : (
            <VerifiedDoctors doctors={verifiedData?.doctors || []} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
