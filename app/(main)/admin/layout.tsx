import { verifyAdmin } from "@/actions/admin";
import { redirect } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, AlertCircle, Users, CreditCard } from "lucide-react";
// import { PageHeader } from "@/components/page-header";

export const metadata = {
  title: "Admin Settings - MediMeet",
  description: "Manage doctors, patients, and platform settings",
};

export default async function AdminLayout({ children }:any) {
  // Verify the user has admin access
  const isAdmin = await verifyAdmin();

  // Redirect if not an admin
  if (!isAdmin) {
    redirect("/onboarding");
  }

  return (
    <div className=" max-w-7xl container mx-auto px-4 py-6">
      <div className="flex flex-col items-center justify-center py-4 sm:py-2 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500 mb-3 sm:mb-4 px-4">
          Admin Dashboard
        </h1>
      </div>
      <Tabs
        defaultValue="pending"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-40 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
          <TabsTrigger
            value="pending"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <AlertCircle className="h-4 w-4 text-blue-400 mr-2 hidden md:inline" />
            <span>Pending Verification</span>
          </TabsTrigger>
          <TabsTrigger
            value="verified"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <Users className="h-4 w-4 mr-2 text-blue-400 hidden md:inline" />
            <span>Doctors</span>
          </TabsTrigger>
          <TabsTrigger
            value="payouts"
            className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
          >
            <CreditCard className="h-4 w-4 mr-2 text-blue-400 hidden md:inline" />
            <span>Payouts</span>
          </TabsTrigger>
        </TabsList>
        <div className="md:col-span-3">{children}</div>
      </Tabs>
    </div>
  );
}