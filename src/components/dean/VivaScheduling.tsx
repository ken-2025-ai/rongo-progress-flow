import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, Clock, Loader2, Search, MapPin, CheckCircle2, 
  Zap, ShieldCheck, Globe, Star, Users, Briefcase, 
  AlertTriangle, GraduationCap, ChevronRight, Filter, Video, Users2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function VivaScheduling() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleData, setScheduleData] = useState({ date: "", time: "", venue: "", link: "" });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => { fetchAwaitingViva(); }, []);

  const fetchAwaitingViva = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          seminar_bookings(id, requested_date, status, seminar_level, approved_date)
        `)
        .eq('current_stage', 'VIVA_SCHEDULED')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err: any) {
      toast.error("Logistics Sync Failure", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleViva = async (candidate: any) => {
    if (!scheduleData.date || !scheduleData.venue) {
      toast.error("Logistics Incomplete", { description: "Institutional defense requires a confirmed date and venue." });
      return;
    }
    setScheduling(true);
    try {
      // 1. Formalize the Viva Booking
      // @ts-ignore
      const { error: bookErr } = await supabase.from('seminar_bookings').upsert({
        student_id: candidate.id,
        seminar_level: 'VIVA',
        requested_date: `${scheduleData.date}T${scheduleData.time || '09:00'}:00`,
        approved_date: `${scheduleData.date}T${scheduleData.time || '09:00'}:00`,
        status: 'APPROVED',
        approved_by: user?.id
      });
      if (bookErr) throw bookErr;

      // 2. Log System Event (Optional, but good for "Senior Engineer" traceability)
      toast.success("Defense Logistics Formalized", {
        description: `Viva-Voce for ${candidate.user?.first_name} locked on ${new Date(scheduleData.date).toDateString()} at ${scheduleData.venue}.`
      });

      setScheduleData({ date: "", time: "", venue: "", link: "" });
      fetchAwaitingViva();
    } catch (err: any) {
      toast.error("Logistics Failure", { description: err.message });
    } finally {
      setScheduling(false);
    }
  };

  const filtered = candidates.filter(c =>
    `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
     <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 max-w-7xl mx-auto pb-24">
      
      {/* Logistics Search Header */}
      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-primary/5 pointer-events-none" />
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-foreground flex items-center gap-4 italic uppercase tracking-tighter">
                  <CalendarDays className="text-secondary" size={32}/> Defense <span className="text-secondary italic">Logistics</span>
               </h2>
               <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                  <Zap size={14} className="text-secondary animate-pulse"/> Viva-Voce Session Command Command
               </p>
            </div>
            <div className="relative w-full md:w-[450px] group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
               <Input 
                  placeholder="Identify Candidate Node..." 
                  className="h-16 pl-14 rounded-[28px] bg-background border-2 focus:border-secondary transition-all font-bold placeholder:italic shadow-inner"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </motion.div>

      {/* Logistics Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Pending Layout", count: candidates.length, color: "text-primary", bg: "bg-primary/5", icon: Clock },
          { label: "Verified Slots", count: candidates.filter(c => c.seminar_bookings?.some((b: any) => b.seminar_level === 'VIVA' && b.status === 'APPROVED')).length, color: "text-secondary", bg: "bg-secondary/5", icon: CheckCircle2 },
          { label: "Defense Venue Capacity", count: "12 Sessions", color: "text-success", bg: "bg-success/5", icon: MapPin },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className={`p-8 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg shadow-black/10 flex items-center gap-6 group hover:scale-[1.03] transition-all`}>
             <div className={`h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-card/20 to-card/10 ${stat.color} shadow-2xl group-hover:rotate-12 transition-transform`}>
                <stat.icon size={28} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
               <p className={`text-4xl font-black mt-2 tracking-tighter tabular-nums ${stat.color}`}>{stat.count}</p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Candidate Queue Matrix */}
      <div className="grid grid-cols-1 gap-8">
        {filtered.length === 0 ? (
           <div className="py-32 text-center border-4 border-dashed border-border rounded-[48px] bg-muted/5 flex flex-col items-center gap-8 opacity-30">
              <CalendarDays size={64} />
              <p className="font-black text-xs uppercase tracking-widest italic">Logistics Queue Idle</p>
           </div>
        ) : (
          filtered.map(candidate => {
            const vivaBooking = candidate.seminar_bookings?.find((b: any) => b.seminar_level === 'VIVA' && b.status === 'APPROVED');
            return (
              <motion.div key={candidate.id} variants={itemVariants} className="card-shadow bg-card rounded-[40px] border border-border/60 shadow-2xl p-10 flex flex-col lg:flex-row items-center justify-between gap-10 group hover:border-secondary/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   <Clock size={200} />
                </div>
                
                <div className="flex-1 space-y-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center text-secondary font-black text-2xl shadow-2xl">
                       {candidate.user?.first_name[0]}{candidate.user?.last_name[0]}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic group-hover:text-secondary transition-colors">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                      <div className="flex gap-2">
                         <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border-secondary/20 text-secondary">{candidate.registration_number}</Badge>
                         <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border-border bg-muted/30">{candidate.programme?.department?.name}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     <p className="text-sm font-bold text-muted-foreground italic leading-relaxed line-clamp-2">"{(candidate.research_title || 'Institutional Research Mapping Pending').toUpperCase()}"</p>
                     <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                         <Users2 size={14}/> PROGRAMME: {candidate.programme?.name}
                     </div>
                  </div>
                </div>

                <div className="shrink-0 w-full lg:w-80 space-y-4 relative z-10">
                  {vivaBooking ? (
                    <div className="p-8 rounded-[32px] bg-success/5 border-2 border-success/20 space-y-4 text-center">
                       <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-success text-white shadow-xl shadow-success/20 animate-bounce">
                          <CheckCircle2 size={24} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-success">LOCKED & SCHEDULED</p>
                          <p className="text-xl font-black text-foreground mt-2">{new Date(vivaBooking.approved_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest flex items-center justify-center gap-2">
                             <MapPin size={12}/> PG BOARDROOM A
                          </p>
                       </div>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full h-16 bg-black hover:bg-secondary text-white font-black uppercase text-[11px] tracking-[0.3em] rounded-[24px] shadow-2xl transition-all active:scale-[0.98] gap-4">
                           <CalendarDays size={20} /> Provision Slot
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[40px] p-10 bg-card border-none shadow-4xl max-w-xl">
                        <DialogHeader className="space-y-4">
                          <DialogTitle className="text-2xl font-black text-foreground uppercase italic tracking-tighter flex items-center gap-4">
                             <MapPin className="text-secondary" size={28}/> Session <span className="text-secondary italic">Provisioning</span>
                          </DialogTitle>
                          <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Candidate: {candidate.user?.first_name} {candidate.user?.last_name}</p>
                        </DialogHeader>
                        <div className="space-y-8 py-10">
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                   <CalendarDays size={14} className="text-secondary"/> Defense Date
                                </label>
                                <input
                                  type="date"
                                  value={scheduleData.date}
                                  onChange={e => setScheduleData(p => ({ ...p, date: e.target.value }))}
                                  className="flex h-14 w-full rounded-[20px] bg-muted/10 border-2 border-border/50 px-6 font-bold text-sm focus:border-secondary transition-all outline-none"
                                />
                             </div>
                             <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                   <Clock size={14} className="text-secondary"/> Time (EAT)
                                </label>
                                <input
                                  type="time"
                                  value={scheduleData.time}
                                  onChange={e => setScheduleData(p => ({ ...p, time: e.target.value }))}
                                  className="flex h-14 w-full rounded-[20px] bg-muted/10 border-2 border-border/50 px-6 font-bold text-sm focus:border-secondary transition-all outline-none"
                                />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MapPin size={14} className="text-secondary"/> Physical / Virtual Venue
                             </label>
                             <Input
                               placeholder="e.g. PG Boardroom, Block A or Zoom ID..."
                               value={scheduleData.venue}
                               onChange={e => setScheduleData(p => ({ ...p, venue: e.target.value }))}
                               className="h-14 rounded-[20px] bg-muted/10 border-2 border-border/50 px-6 font-bold text-sm focus:border-secondary transition-all"
                             />
                          </div>
                        </div>
                        <DialogFooter className="flex gap-4">
                          <Button variant="ghost" className="h-16 flex-1 rounded-[24px] text-[10px] font-black uppercase tracking-widest" onClick={() => setScheduleData({ date: "", time: "", venue: "", link: "" })}>Clear Defaults</Button>
                          <Button
                            className="h-16 flex-[2] bg-secondary text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] shadow-2xl shadow-secondary/20 gap-4"
                            disabled={scheduling}
                            onClick={() => handleScheduleViva(candidate)}
                          >
                            {scheduling ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={20}/> Confirm & Lock</>}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

    </motion.div>
  );
}
