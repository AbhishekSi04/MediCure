import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SPECIALTIES } from "@/lib/specialities";

export default async function DoctorsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center mb-8 sm:mb-12 py-8 sm:py-12 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-500 mb-3 sm:mb-4 px-4">
          Find Your Doctor
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl px-4">
          Browse by specialty or view all available healthcare providers
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 px-4 sm:px-0">
        {SPECIALTIES.map((specialty) => (
          <Link key={specialty.name} href={`/doctors/${specialty.name}`}>
            <Card className="hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 cursor-pointer border-slate-200 dark:border-slate-700 h-full group">
              <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center text-center h-full">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <div className="text-blue-600 dark:text-blue-400 text-lg sm:text-xl">{specialty.icon}</div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-tight">{specialty.name}</h3>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}