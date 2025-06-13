"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, User, Medal, FileText, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { updateDoctorStatus } from "@/actions/admin";
import useFetch from "@/hooks/use-fetch";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

// Define the Doctor type
type Doctor = {
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

type VerifiedDoctorsProps = {
  doctors: Doctor[];
};

export function VerifiedDoctors({ doctors }: VerifiedDoctorsProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const {
    loading,
    data,
    fn: submitStatusUpdate,
  } = useFetch(updateDoctorStatus);

  // Open doctor details dialog
  const handleViewDetails = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  // Close doctor details dialog
  const handleCloseDialog = () => {
    setSelectedDoctor(null);
  };

  // Handle reject doctor
  const handleRejectDoctor = async (doctorId: string) => {
    if (loading) return;

    const formData = new FormData();
    formData.append("doctorId", doctorId);
    formData.append("status", "REJECTED");

    await submitStatusUpdate(formData);
  };

  useEffect(() => {
    if (data?.success) {
      handleCloseDialog();
    }
  }, [data]);

  return (
    <div>
      <Card className="bg-muted/20 border-emerald-900/20">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            Verified Doctors
          </CardTitle>
          <CardDescription>
            Manage verified doctor accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No verified doctors at this time.
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="bg-background border-emerald-900/20 hover:border-emerald-700/30 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/20 rounded-full p-2">
                          <User className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {doctor.name || "Unnamed Doctor"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {doctor.specialty || "No specialty"} • {doctor.experience || 0} years
                            experience
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <Badge
                          variant="outline"
                          className="bg-emerald-900/20 border-emerald-900/30 text-emerald-400"
                        >
                          Verified
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(doctor)}
                          className="border-emerald-900/30 hover:bg-muted/80"
                        >
                          View Details
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

      {/* Doctor Details Dialog */}
      {selectedDoctor && (
        <Dialog open={!!selectedDoctor} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Doctor Details
              </DialogTitle>
              <DialogDescription>
                View doctor information and manage account status
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </h4>
                  <p className="text-base font-medium text-white">
                    {selectedDoctor.name || "Unnamed Doctor"}
                  </p>
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Email
                  </h4>
                  <p className="text-base font-medium text-white">
                    {selectedDoctor.email}
                  </p>
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Verification Date
                  </h4>
                  <p className="text-base font-medium text-white">
                    {format(new Date(selectedDoctor.createdAt), "PPP")}
                  </p>
                </div>
              </div>

              <Separator className="bg-emerald-900/20" />

              {/* Professional Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-white font-medium">
                    Professional Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Specialty
                    </h4>
                    <p className="text-white">{selectedDoctor.specialty || "No specialty"}</p>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Years of Experience
                    </h4>
                    <p className="text-white">
                      {selectedDoctor.experience || 0} years
                    </p>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Credentials
                    </h4>
                    <div className="flex items-center">
                      <a
                        href={selectedDoctor.credentialUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center"
                      >
                        View Credentials
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-emerald-900/20" />

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-white font-medium">
                    Service Description
                  </h3>
                </div>
                <p className="text-muted-foreground whitespace-pre-line">
                  {selectedDoctor.description || "No description provided"}
                </p>
              </div>
            </div>

            {loading && <BarLoader width={"100%"} color="#36d7b7" />}

            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => handleRejectDoctor(selectedDoctor.id)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="mr-2 h-4 w-4" />
                Reject Doctor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
