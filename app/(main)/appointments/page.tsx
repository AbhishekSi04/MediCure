import { getPatientAppointments } from "@/actions/patient";
import AppointmentCard from "@/components/appointment-card";
// import { PageHeader } from "@/components/page-header";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/onboarding";

export default async function PatientAppointmentsPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "PATIENT") {
    redirect("/onboarding");
  }

  const { appointments, error } = await getPatientAppointments();

  if(appointments?.length==undefined) return;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      
      <h1 className="text-2xl text-center sm:text-3xl md:text-4xl font-bold text-blue-500 dark:text-blue-400 mb-3 sm:mb-4 px-4">My Appointments</h1>

      <Card className="border-blue-900/20 dark:border-blue-400/30 bg-white dark:bg-zinc-900 shadow-md transition-colors">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center text-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
            Your Scheduled Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-400 dark:text-red-300">Error: {error}</p>
            </div>
          ) : appointments?.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  userRole="PATIENT"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-zinc-400 dark:text-zinc-600 mb-3" />
              <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-100 mb-2">
                No appointments scheduled
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                You don&apos;t have any appointments scheduled yet. Browse our
                doctors and book your first consultation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}