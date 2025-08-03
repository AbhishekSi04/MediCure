"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { setAvailabilitySlots } from "@/actions/doctor";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";


interface AvailabilitySettingsProps {
  slots: any[];
}

export function AvailabilitySettings({ slots }: AvailabilitySettingsProps) {
  const [showForm, setShowForm] = useState(false);

  // Custom hook for server action
  const { loading, fn: submitSlots, data } = useFetch(setAvailabilitySlots);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
    },
  });

  function createLocalDateFromTime(timeStr: string) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const now = new Date();
    const date = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );
    return date;
  }

  // Handle slot submission
  const onSubmit = async (data: any) => {
    if (loading) return;

    const formData = new FormData();

    // const today = new Date().toISOString().split("T")[0];

    // Create date objects
    const startDate = createLocalDateFromTime(data.startTime);
    const endDate = createLocalDateFromTime(data.endTime);

    if (startDate >= endDate) {
      toast.error("End time must be after start time");
      return;
    }

    // Add to form data
    formData.append("startTime", startDate.toISOString());
    formData.append("endTime", endDate.toISOString());

    await submitSlots(formData);
  };

  useEffect(() => {
    if (data && data?.success) {
      setShowForm(false);
      toast.success("Availability slots updated successfully");
    }
  }, [data]);

  // Format time string for display
  const formatTimeString = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch (e) {
      return "Invalid time";
    }
  };

  return (
    <Card className="border-blue-200 dark:border-blue-900/40 bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
          Availability Settings
        </CardTitle>
        <CardDescription className="text-zinc-600 dark:text-zinc-300">
          Set your daily availability for patient appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Current Availability Display */}
        {!showForm ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-3">
                Current Availability
              </h3>

              {slots.length === 0 ? (
                <p className="text-muted-foreground">
                  You haven&apos;t set any availability slots yet. Add your
                  availability to start accepting appointments.
                </p>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center p-3 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40"
                    >
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                        <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-zinc-900 dark:text-white font-medium">
                          {formatTimeString(slot.startTime)} -{" "}
                          {formatTimeString(slot.endTime)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.appointment ? "Booked" : "Available"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Set Availability Time
            </Button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 border border-blue-200 dark:border-blue-900/40 rounded-md p-4 bg-blue-50 dark:bg-blue-900/10"
          >
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
              Set Daily Availability
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-zinc-700 dark:text-zinc-200">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime", {
                    required: "Start time is required",
                  })}
                  className="bg-background border-blue-200 dark:border-blue-900/40 text-zinc-900 dark:text-white"
                />
                {errors.startTime && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.startTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-zinc-700 dark:text-zinc-200">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime", { required: "End time is required" })}
                  className="bg-background border-blue-200 dark:border-blue-900/40 text-zinc-900 dark:text-white"
                />
                {errors.endTime && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="border-blue-200 dark:border-blue-900/40 text-zinc-700 dark:text-zinc-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Availability"
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-md">
          <h4 className="font-medium text-zinc-900 dark:text-white mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400" />
            How Availability Works
          </h4>
          <p className="text-muted-foreground text-sm">
            Setting your daily availability allows patients to book appointments
            during those hours. The same availability applies to all days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}