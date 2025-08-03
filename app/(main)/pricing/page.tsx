// import { redirect } from "next/navigation";
// import Link from "next/link";
import {  Shield } from "lucide-react";
import { PricingTable } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";

export default async function PricingPage() {
  return (
    <div className="relative min-h-screen ">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-blue-400/10 dark:bg-blue-800/20 rounded-full blur-2xl" />
      </div>
      <div className="container relative z-0 mx-auto px-4 py-12 flex flex-col items-center">
        {/* Header Section */}
        <div className="max-w-full mx-auto mb-12 text-center">
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/30 border-blue-400/30 dark:border-blue-700/30 px-4 py-1 text-blue-600 dark:text-blue-300 text-sm font-medium mb-4 shadow-sm"
          >
            Affordable Healthcare
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-blue-500 dark:bg-blue-400 bg-clip-text text-transparent mb-4 drop-shadow-sm">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            Choose the perfect consultation package that fits your healthcare
            needs with no hidden fees or long-term commitments
          </p>
        </div>
        {/* Pricing Table Section */}
        <section className="w-full py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-3">
                Choose Your Plan
              </h2>
              <p className="text-xl text-zinc-500 dark:text-zinc-400">
                Flexible pricing options to meet your healthcare needs
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-blue-100 dark:border-blue-900/30 flex flex-col items-center">
              <PricingTable />
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16 text-center bg-blue-50 dark:bg-blue-900/10 rounded-2xl shadow-lg p-8 border border-blue-100 dark:border-blue-900/20">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-blue-400 dark:text-blue-500" />
            Questions? We are Here to Help
          </h2>
          <p className="text-zinc-600 dark:text-zinc-300 mb-4">
            Contact our support team at <a href="mailto:abhisheksingh159084@gmail.com" className="underline text-blue-600 dark:text-blue-400">support@medimeet.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}