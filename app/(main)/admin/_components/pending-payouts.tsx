"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { approvePayout } from "@/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// import { useRouter } from "next/router";


// Payout with doctor info
export type PayoutWithDoctor = {
  id: string;
  amount: number;
  credits: number;
  platformFee: number;
  netAmount: number;
  paypalEmail: string;
  status: "PROCESSING" | "PROCESSED";
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
  doctor: {
    id: string;
    name: string | null;
    email: string;
    specialty: string | null;
    experience: number | null;
    description: string | null;
    credentialUrl: string | null;
    createdAt: string;
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | null;
    role: "PATIENT" | "DOCTOR" | "ADMIN";
  };
};

type PendingPayoutsProps = {
  payouts: PayoutWithDoctor[];
};

export function PendingPayouts({ payouts }: PendingPayoutsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async (payoutId: string) => {
    setLoadingId(payoutId);
    try {
      await approvePayout(payoutId);
      toast.success("Payout approved!");
      // Optionally: refetch payouts here
    } catch (err: any) {
      toast.error(err.message || "Failed to approve payout");
    } finally {
      setLoadingId(null);
      router.refresh();
    }
  };

  return (
    <Card className="bg-muted/30 border-blue-900/20 dark:border-blue-400/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold dark:text-white text-slate-700">
          Pending Doctor Payouts
        </CardTitle>
        <CardDescription>
          Review and approve doctor payout requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No pending payouts at this time.
          </div>
        ) : (
          <div className="space-y-4">
            {payouts.map((payout) => (
              <Card
                key={payout.id}
                className="bg-background border-blue-900/20 dark:border-blue-400/20 hover:border-blue-500/40 dark:hover:border-blue-300/40 transition-all shadow-md rounded-xl"
              >
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-blue-100 dark:divide-blue-900/30">
                    {/* Doctor Info */}
                    <div className="p-4 md:p-5 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/20 border-blue-400 dark:border-blue-500 text-blue-600 dark:text-blue-300 font-semibold shadow-none px-3 py-1 text-xs">
                          Pending
                        </Badge>
                        <h3 className="font-semibold text-lg dark:text-white text-slate-700">
                          {payout.doctor.name || "Unnamed Doctor"}
                        </h3>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {payout.doctor.specialty || "No specialty"} • {payout.doctor.experience || 0} yrs exp
                      </div>
                      <div className="text-xs text-muted-foreground break-words">
                        Email: <span className="font-medium">{payout.doctor.email}</span>
                      </div>
                      <div className="text-xs text-muted-foreground break-words">
                        PayPal: <span className="font-medium">{payout.paypalEmail}</span>
                      </div>
                    </div>
                    {/* Payout Details & Action */}
                    <div className="p-4 md:p-5 flex flex-col justify-between h-full">
                      <div className="flex flex-col gap-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Credits</span>
                          <span className="font-bold text-blue-600 dark:text-blue-300">{payout.credits}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Net Amount</span>
                          <span className="font-bold text-blue-600 dark:text-blue-300">${payout.netAmount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Platform Fee</span>
                          <span className="font-bold text-slate-500 dark:text-slate-400">${payout.platformFee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Requested</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(payout.createdAt), "PPP")}</span>
                        </div>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={loadingId === payout.id}
                        onClick={() => handleApprove(payout.id)}
                        className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-400 font-semibold shadow"
                      >
                        {loadingId === payout.id ? "Approving..." : "Approve"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
