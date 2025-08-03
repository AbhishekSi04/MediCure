import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getDoctorAppointments, getDoctorAvailability } from "@/actions/doctor";
// import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payouts";
import { AvailabilitySettings } from "./_components/availability-settings";
import { getCurrentUser } from "@/actions/onboarding";
import { redirect } from "next/navigation";
import { Calendar, Clock, DollarSign } from "lucide-react";
import DoctorAppointmentsList from "./_components/appointments-list";
import DoctorEarnings from "./_components/doctor-earnings";
import DoctorMessages from "./_components/doctor-messages";
// import { getDoctorEarnings, getDoctorPayouts } from "@/actions/payout";

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();

  const [appointmentsData, availabilityData] =
    await Promise.all([
      getDoctorAppointments(),
      getDoctorAvailability(),
      // getDoctorEarnings(),
      // getDoctorPayouts(),
    ]);

  //   // Redirect if not a doctor
  if (user?.role !== "DOCTOR") {
    redirect("/onboarding");
  }

  // If already verified, redirect to dashboard
  if (user?.verificationStatus !== "VERIFIED") {
    redirect("/doctor/verification");
  }

  return (
    <div className="max-w-7xl container mx-auto px-4 py-4">
      <div className="flex flex-col items-center justify-center py-4 sm:py-2 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500 mb-3 sm:mb-4 px-4">
          Doctor Dashboard
        </h1>
      </div>
    <Tabs
      defaultValue="earnings"
      className="grid grid-cols-1 md:grid-cols-4 gap-6"
    >
      <TabsList className="md:col-span-1 bg-muted/30 border h-14 md:h-60 flex sm:flex-row md:flex-col w-full p-2 md:p-1 rounded-md md:space-y-2 sm:space-x-2 md:space-x-0">
        <TabsTrigger
          value="earnings"
          className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
        >
          <DollarSign className="h-4 w-4 mr-2 hidden md:inline" />
          <span>Earnings</span>
        </TabsTrigger>
        <TabsTrigger
          value="appointments"
          className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
        >
          <Calendar className="h-4 w-4 mr-2 hidden md:inline" />
          <span>Appointments</span>
        </TabsTrigger>
        <TabsTrigger
          value="availability"
          className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
        >
          <Clock className="h-4 w-4 mr-2 hidden md:inline" />
          <span>Availability</span>
        </TabsTrigger>
        <TabsTrigger
          value="message"
          className="flex-1 md:flex md:items-center md:justify-start md:px-4 md:py-3 w-full"
        >
          <Clock className="h-4 w-4 mr-2 hidden md:inline" />
          <span>Messages</span>
        </TabsTrigger>
      </TabsList>
      <div className="md:col-span-3">
        <TabsContent value="appointments" className="border-none p-0">
          <DoctorAppointmentsList
            appointments={appointmentsData.appointments || []}
          />
        </TabsContent>
        <TabsContent value="availability" className="border-none p-0">
          <AvailabilitySettings slots={availabilityData.slots || []} />
        </TabsContent>
        <TabsContent value="earnings" className="border-none p-0">
          <DoctorEarnings
            // earnings={earningsData.earnings}
            // payouts={payoutsData.payouts}
          />
        </TabsContent>
        <TabsContent value="message" className="border-none p-0">
          <DoctorMessages  />
        </TabsContent>
      </div>
    </Tabs>
    </div>
  );
}