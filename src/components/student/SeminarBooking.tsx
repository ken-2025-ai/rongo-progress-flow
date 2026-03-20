import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin, CheckCircle2, AlertCircle, Loader2, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";

export function SeminarBooking() {
  const { user } = useRole();
  const [student, setStudent] = useState<any>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isBooking, setIsBooking] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, type: "DEPT_SEMINAR", label: "Department Seminar", date: "April 02, 2026", time: "10:00 AM", location: "PG Seminar Room 1", available: true },
    { id: 2, type: "DEPT_SEMINAR", label: "Department Seminar", date: "April 09, 2026", time: "02:00 PM", location: "SGS Senate Hall", available: false },
    { id: 3, type: "SCHOOL_SEMINAR", label: "School Seminar", date: "April 16, 2026", time: "09:00 AM", location: "Main Auditorium", available: true },
    { id: 4, type: "SCHOOL_SEMINAR", label: "School Seminar", date: "April 23, 2026", time: "11:00 AM", location: "Graduate Annex", available: true },
  ]);

  useEffect(() => {
    if (user?.id) fetchStudent();
  }, [user]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEligible = (slotType: string) => {
    if (!student) return false;
    
    // Logic: Student can only book the level they are currently at PENDING
    if (slotType === "DEPT_SEMINAR" && student.current_stage === "DEPT_SEMINAR_PENDING") return true;
    if (slotType === "SCHOOL_SEMINAR" && student.current_stage === "SCHOOL_SEMINAR_PENDING") return true;
    
    return false;
  };

  const getStageStatus = () => {
     if (!student) return "Identification Pending";
     if (student.current_stage.includes("BOOKED")) return "Seminar Already Locked";
     if (student.current_stage.includes("COMPLETED")) return "Stage Requirements Met";
     return "Ready to Book";
  };

  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 6);
  oneWeekFromNow.setHours(0, 0, 0, 0);

  const handleBooking = async (slotId: number, slotType: string, slotDate: string) => {
     if (!student) {
        toast.error("Vetting Failure", { description: "Student node not found in registry." });
        return;
     }

     setIsBooking(slotId);
     
     try {
        // Attempt actual Supabase Insert
        // @ts-ignore
        const { error } = await supabase.from('seminar_bookings').insert({
           seminar_level: slotType,
           requested_date: new Date(slotDate).toISOString().split('T')[0],
           student_id: student.id,
           status: 'PENDING'
        });

        if (error) throw error;

        toast.success("Seminar Requested", {
           description: `Your ${slotType.replace('_', ' ')} request has been sent to the Department Coordinator.`,
        });
        
        // Update local student state to prevent double booking if stage updates
        setStudent({ ...student, current_stage: student.current_stage }); 
        
        setAvailableSlots(prev => prev.map(slot => 
           slot.id === slotId ? { ...slot, available: false } : slot
        ));

     } catch (err: any) {
        toast.error("Protocol Error", { description: err.message });
     } finally {
        setIsBooking(null);
     }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      
      {/* Policy and Status Header */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-card to-muted/20 p-8 rounded-[32px] border border-border flex flex-col md:flex-row justify-between items-center gap-8 card-shadow">
         <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
               <GitBranch className="text-primary" /> Performance <span className="text-primary italic">Scheduler</span>
            </h2>
            <p className="text-sm text-muted-foreground font-medium">Synchronize your research presentation with the institutional calendar.</p>
         </div>
         <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status Verification</span>
            <Badge variant="outline" className={`px-4 py-1.5 rounded-full border-none font-bold uppercase tracking-widest text-[10px] ${
               student?.current_stage.includes("PENDING") ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
               {getStageStatus()}
            </Badge>
         </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Selection */}
        <div className="card-shadow bg-card rounded-[32px] p-8 border border-border flex flex-col relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
          
          <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-3 uppercase tracking-tight">
            <CalendarDays className="text-primary" size={24} />
            Institutional Calendar
          </h3>
          
          <div className="bg-background/40 p-4 rounded-[24px] border border-border/40 mx-auto w-full flex justify-center">
             <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                disabled={(date) => date < oneWeekFromNow || date.getDay() !== 4} 
             />
          </div>
          
          <div className="mt-8 p-4 bg-muted/30 rounded-2xl flex gap-4 items-start">
            <AlertCircle size={20} className="text-primary shrink-0" />
            <div className="space-y-1">
               <p className="text-[11px] font-black uppercase text-foreground">Advanced Booking Protocol</p>
               <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Thursday is the designated day for all postgraduate seminars. Same-week bookings are algorithmically locked to maintain panel integrity.
               </p>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="space-y-6">
          <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-3 uppercase tracking-tight">
            <Clock className="text-secondary" size={24} />
            Validated Slots
          </h3>
          
          <div className="space-y-4">
            {availableSlots.map((slot) => {
               const eligible = isEligible(slot.type);
               const statusMessage = !eligible && !slot.available ? "FULLY BOOKED" : 
                                   !eligible ? "INELIGIBLE STAGE" : "AVAILABLE";

               return (
                  <div key={slot.id} className={`p-6 rounded-[28px] border-2 transition-all relative overflow-hidden ${
                    slot.available && eligible ? "bg-background border-border hover:border-primary/40 hover:shadow-xl group" : "bg-muted/10 border-transparent grayscale opacity-60"
                  }`}>
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <Badge className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 mb-3 rounded-lg border-none ${
                            slot.type === "SCHOOL_SEMINAR" ? "bg-secondary text-white" : "bg-primary text-white"
                        }`}>
                          {slot.label}
                        </Badge>
                        <h4 className="text-lg font-black text-foreground tracking-tight">{slot.date}</h4>
                        <p className="text-xs font-bold text-muted-foreground mt-1 tabular-nums tracking-wide">{slot.time} · Room {slot.location}</p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleBooking(slot.id, slot.type, slot.date)}
                        disabled={isBooking === slot.id || !slot.available || !eligible}
                        className={`font-black uppercase text-[10px] tracking-widest px-6 h-12 rounded-2xl transition-all ${
                           slot.available && eligible ? "bg-black text-white hover:bg-primary shadow-lg" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isBooking === slot.id ? <Loader2 className="animate-spin" size={16} /> : statusMessage}
                      </Button>
                    </div>
                    
                    {slot.available && eligible && (
                       <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <CheckCircle2 size={60} />
                       </div>
                    )}
                  </div>
               );
            })}
          </div>

          <div className="p-6 bg-[#0c0c0c] rounded-[28px] border border-white/5 flex gap-5 items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500/5 pulse-subtle" />
            <AlertCircle className="text-yellow-500 shrink-0" size={32} />
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">School Level Logistics</h4>
               <p className="text-[11px] text-white/40 leading-relaxed max-w-sm mt-1">
                  School Seminars require prior Departmental Clearance documented in the progress ledger.
               </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
