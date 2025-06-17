"use client"

import { createAppointment } from "@/actions/appointments"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar, Clock, MapPin, Stethoscope, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

// Form validation schema
const bookingFormSchema = z.object({
  description: z.string().min(10, "Please provide a detailed description of your symptoms"),
  notes: z.string().optional(),
})

interface DoctorProfileProps {
  doctor: {
    id: string
    name: string | null
    specialty: string | null
    experience: number | null
    image?: string | null
  }
  availableDays: {
    date: string
    displayDate: string
    slots: {
      startTime: string
      endTime: string
      formatted: string
    }[]
  }[]
}

export default function DoctorProfile({ doctor, availableDays }: DoctorProfileProps) {
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      description: "",
      notes: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof bookingFormSchema>) => {
    if (!selectedSlot) return

    try {
      setIsSubmitting(true)
      const result = await createAppointment({
        doctorId: doctor.id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        description: values.description,
        notes: values.notes,
      })

      if (result.appointment) {
        toast.success("Appointment booked successfully!")
        setIsDialogOpen(false)
        router.refresh()
        router.push("/appointments")
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to book appointment")
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Side - Doctor Details */}
      <Card className="md:col-span-1 p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {doctor.image ? (
              <img src={doctor.image} alt={doctor.name || "Doctor"} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">{doctor.name || "Doctor"}</h2>
            <p className="text-emerald-400 flex items-center justify-center gap-2">
              <Stethoscope className="w-4 h-4" />
              {doctor.specialty || "General Practitioner"}
            </p>
          </div>

          <div className="w-full space-y-3">
            {/* <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{doctor.location}</span>
            </div> */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{doctor.experience || 0} years experience</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Right Side - Booking Slots */}
      <Card className="md:col-span-3 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Available Time Slots</h3>
        
        <div className="space-y-6">
          {availableDays.map((day) => (
            <div key={day.date} className="space-y-3">
              <h4 className="text-lg font-medium text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                {day.displayDate}
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {day.slots.map((slot) => (
                  <Dialog 
                    key={slot.startTime} 
                    open={isDialogOpen} 
                    onOpenChange={setIsDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setSelectedSlot(slot)
                          form.reset()
                        }}
                      >
                        {slot.formatted}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Book Appointment</DialogTitle>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description of Symptoms</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please describe your symptoms in detail..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Additional Notes (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Any additional information you'd like to share..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Booking..." : "Confirm Booking"}
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
