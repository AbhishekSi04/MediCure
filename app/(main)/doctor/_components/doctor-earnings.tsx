"use client";

import { useEffect, useState } from "react";
import { getDoctorEarnings, getDoctorPayouts, requestPayout } from "@/actions/payouts";
import { Button } from "@/components/ui/button";
import { useActionState} from "react";
import { useFormStatus } from "react-dom";

function validateEmail(email: string) {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function PayoutForm({ availableCredits, onSuccess }: { availableCredits: number; onSuccess: () => void }) {
  const [clientError, setClientError] = useState<string | null>(null);
  const { pending } = useFormStatus();
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    setClientError(null);
    const email = formData.get("paypalEmail") as string;
    if (!email) {
      setClientError("PayPal email is required.");
      return {};
    }
    if (!validateEmail(email)) {
      setClientError("Please enter a valid PayPal email address.");
      return {};
    }
    if (availableCredits < 1) {
      setClientError("You need at least 1 available credit to request a payout.");
      return {};
    }
    try {
      const result = await requestPayout(formData);
      onSuccess();
      return { success: true, message: "Payout requested successfully!" };
    } catch (err: any) {
      setClientError(err.message);
      return { error: err.message };
    }
  }, {});

  return (
    <form action={formAction} className="mb-6 flex flex-col sm:flex-row items-start gap-2 bg-muted/40 p-4 rounded-lg shadow">
      <input
        type="email"
        name="paypalEmail"
        placeholder="PayPal Email"
        className="border p-2 rounded w-full sm:w-auto flex-1"
        required
      />
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Requesting..." : "Request Payout"}
      </Button>
      <div className="w-full">
        {clientError && <div className="text-red-500 mt-2 text-sm">{clientError}</div>}
        {state?.success && <div className="text-green-600 mt-2 text-sm">{state.message}</div>}
      </div>
    </form>
  );
}

export default function DoctorEarnings() {
  const [earnings, setEarnings] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const fetchData = async () => {
    try {
      const { earnings } = await getDoctorEarnings();
      const { payouts } = await getDoctorPayouts();
      setEarnings(earnings);
      setPayouts(payouts);
    } catch (err: any) {
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  if (loading) return <div>Loading...</div>;
  if (fetchError) return <div className="text-red-500">{fetchError}</div>;
  if (!earnings) return <div>No earnings data found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Earnings Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-muted/40 p-4 rounded-lg shadow">
        <div className="font-semibold">Total Earnings:<br /><span className="font-normal">${earnings.totalEarnings}</span></div>
        <div className="font-semibold">This Month:<br /><span className="font-normal">${earnings.thisMonthEarnings}</span></div>
        <div className="font-semibold">Completed Appointments:<br /><span className="font-normal">{earnings.completedAppointments}</span></div>
        <div className="font-semibold">Avg. Per Month:<br /><span className="font-normal">${earnings.averageEarningsPerMonth.toFixed(2)}</span></div>
        <div className="font-semibold">Available Credits:<br /><span className="font-normal">{earnings.availableCredits}</span></div>
        <div className="font-semibold">Available for Payout:<br /><span className="font-normal">${earnings.availablePayout}</span></div>
      </div>
      <PayoutForm availableCredits={earnings.availableCredits} onSuccess={fetchData} />
      <h3 className="text-lg font-semibold mb-2 mt-8">Payout History</h3>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full border bg-white">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">Credits</th>
              <th className="p-2">Net Amount</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4 text-muted-foreground">No payouts yet.</td>
              </tr>
            ) : (
              payouts.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-2">{p.credits}</td>
                  <td className="p-2">${p.netAmount}</td>
                  <td className="p-2">
                    <span className={
                      p.status === "PROCESSED"
                        ? "text-green-600 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
