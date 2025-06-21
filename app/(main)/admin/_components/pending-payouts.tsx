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
    <Card className="bg-muted/20 border-emerald-900/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">
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
                className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-white">
                        {payout.doctor.name || "Unnamed Doctor"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {payout.doctor.specialty || "No specialty"} • {payout.doctor.experience || 0} years experience
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Email: {payout.doctor.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PayPal: {payout.paypalEmail}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Badge variant="outline" className="bg-amber-900/20 border-amber-900/30 text-amber-400">
                        Pending
                      </Badge>
                      <div className="text-sm text-white">
                        Credits: <span className="font-bold">{payout.credits}</span>
                      </div>
                      <div className="text-sm text-white">
                        Net Amount: <span className="font-bold">${payout.netAmount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Requested: {format(new Date(payout.createdAt), "PPP")}
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        disabled={loadingId === payout.id}
                        onClick={() => handleApprove(payout.id)}
                        className="mt-2"
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
