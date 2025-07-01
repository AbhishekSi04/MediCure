import { redirect } from "next/navigation";
import { getDoctorsBySpecialty } from "@/actions/doctors-listing";
import { DoctorCard } from "../_components/doctor-card";

export default async function DoctorSpecialtyPage({ params }: { params: { speciality: string } }) {
  const { speciality } = await params;


  // Redirect to main doctors page if no specialty is provided
  if (!speciality) {
    redirect("/doctors");
  }

  // Fetch doctors by specialty
  const { doctors, error } = await getDoctorsBySpecialty(speciality);

  if (error) {
    console.error("Error fetching doctors:", error);
  }

  return (
    <div className="space-y-5 px-2 sm:px-4 py-4 max-w-7xl mx-auto">
      
      <h1 className="text-2xl px-3 py-4 text-blue-500 text-center font-bold">All Doctors of {speciality.split("%20").join(" ")}</h1>

      {doctors && doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor: any) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-white mb-2">
            No doctors available
          </h3>
          <p className="text-muted-foreground">
            There are currently no verified doctors in this specialty. Please
            check back later or choose another specialty.
          </p>
        </div>
      )}
    </div>
  );
}