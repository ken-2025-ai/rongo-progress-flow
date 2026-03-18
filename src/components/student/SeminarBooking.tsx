import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";

export function SeminarBooking() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const availableSlots = [
    { type: "Department Seminar", date: "April 02, 2026", time: "10:00 AM", location: "PG Seminar Room 1", available: true },
    { type: "Department Seminar", date: "April 09, 2026", time: "02:00 PM", location: "SGS Senate Hall", available: false },
    { type: "School Seminar", date: "April 16, 2026", time: "09:00 AM", location: "Main Auditorium", available: true },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Selection */}
        <div className="card-shadow bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <CalendarDays className="text-primary" size={20} />
            Select Presentation Date
          </h3>
          <div className="bg-background/40 p-3 rounded-xl border border-border/40">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md mx-auto"
                disabled={(date) => date < new Date() || date.getDay() !== 4} 
             />
          </div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-4 text-center">
            Seminars are only held on <span className="text-primary">Thursdays</span>
          </p>
        </div>

        {/* Available Slots */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Clock className="text-secondary" size={20} />
            Available Performance Slots
          </h3>
          
          <div className="space-y-3">
            {availableSlots.map((slot, i) => (
              <div key={i} className={`p-4 rounded-xl border transition-all ${
                slot.available ? "bg-background border-border hover:border-primary/40 cursor-pointer" : "bg-muted/30 border-muted opacity-60"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        slot.type.includes("School") ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                    }`}>
                      {slot.type}
                    </span>
                    <h4 className="text-sm font-bold text-foreground mt-2">{slot.date} at {slot.time}</h4>
                  </div>
                  {slot.available ? (
                    <Button size="sm" className="bg-primary text-white hover:bg-primary/90 text-[10px] font-bold uppercase">Book Now</Button>
                  ) : (
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Fully Booked</span>
                  )}
                </div>
                
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1"><MapPin size={12} /> {slot.location}</div>
                   <div className="h-3 w-[1px] bg-border" />
                   <div className="flex items-center gap-1"><CheckCircle2 size={12} className={slot.available ? "text-success" : ""} /> {slot.available ? "Available" : "Closed"}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-status-warning/10 rounded-xl border border-status-warning/20 flex gap-4">
            <AlertCircle className="text-status-warning shrink-0" size={20} />
            <p className="text-[11px] text-status-warning/90 leading-tight">
               <strong>School Seminar Logistics:</strong> 3rd Thursday of every month is strictly for School-level presentations. Ensure your Department has cleared you before booking.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
