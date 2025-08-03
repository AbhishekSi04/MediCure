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
      return { success: true, message: "Payout requested successfully!", result };
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
    <div className="max-w-3xl mx-auto px-2 sm:px-4 py-2">
      <div className="mb-8">
        <h2 className=" text-xl md:text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">Earnings Overview</h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-6">Track your earnings, credits, and payout history at a glance.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex flex-col items-center shadow">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Total Earnings</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${earnings.totalEarnings}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex flex-col items-center shadow">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">This Month</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${earnings.thisMonthEarnings}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex flex-col items-center shadow">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Completed Appointments</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{earnings.completedAppointments}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex flex-col items-center shadow">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Avg. Per Month</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${earnings.averageEarningsPerMonth.toFixed(2)}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex flex-col items-center shadow">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Available Credits</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{earnings.availableCredits}</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-xl p-5 flex flex-col items-center shadow">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Available for Payout</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${earnings.availablePayout}</span>
          </div>
        </div>
      </div>
      <div className="mb-10">
        <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v9m0 0H7m5 0h5" /></svg>
            Request Payout
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Withdraw your available credits to your PayPal account. Minimum 1 credit required.</p>
          <PayoutForm availableCredits={earnings.availableCredits} onSuccess={fetchData} />
        </div>
      </div>
      <div>
        <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/30 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
            <svg className="h-5 w-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M5 6h14M7 18h10" /></svg>
            Payout History
          </h3>
          <div className="overflow-x-auto rounded-lg mt-4">
            <table className="w-full border bg-white dark:bg-slate-900 text-zinc-800 dark:text-zinc-200">
              <thead className="bg-blue-50 dark:bg-blue-900/10">
                <tr>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Credits</th>
                  <th className="p-2 font-medium">Net Amount</th>
                  <th className="p-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-zinc-400">No payouts yet.</td>
                  </tr>
                ) : (
                  payouts.map((p) => (
                    <tr key={p.id} className="border-t border-blue-100 dark:border-blue-900/20">
                      <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td className="p-2">{p.credits}</td>
                      <td className="p-2">${p.netAmount}</td>
                      <td className="p-2">
                        <span className={
                          p.status === "PROCESSED"
                            ? "text-green-600 dark:text-green-400 font-semibold"
                            : "text-yellow-600 dark:text-yellow-400 font-semibold"
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
      </div>
    </div>
  );
}
