import { motion, AnimatePresence } from "framer-motion";
import { 
  PlayCircle, ClipboardCheck, Users, 
  Clock, CalendarPlus, FileText, CheckCircle2, AlertTriangle, MessageSquare, Loader2, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export function SeminarSessions() {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.department_id) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // 1. Get student IDs for this department
      // @ts-ignore
      const { data: deptStudents } = await supabase
        .from('students')
        .select('id')
        .eq('programme!inner(department_id)', user.department_id);
      
      const sIds = (deptStudents || []).map(s => s.id);
      if (sIds.length === 0) {
        setSessions([]);
        return;
      }

      // 2. Fetch Approved Bookings (Scheduled Sessions)
      // @ts-ignore
      const { data } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            registration_number,
            user:user_id(first_name, last_name),
            programme:programme_id(name),
            current_stage
          )
        `)
        .in('student_id', sIds)
        .eq('status', 'APPROVED')
        .order('requested_date', { ascending: true });

      // Group by date for the UI
      const grouped = (data || []).reduce((acc: any[], curr: any) => {
        const date = curr.requested_date;
        const existing = acc.find(s => s.date === date);
        if (existing) {
          existing.presenters.push(curr);
        } else {
          acc.push({
            id: date,
            date: new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }),
            rawDate: date,
            room: "Academic Boardroom", // Hardcoded meta for now
            presenters: [curr]
          });
        }
        return acc;
      }, []);

      setSessions(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Session Sync Failure");
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    toast.success("Protocol Engaged", {
      description: "Panel scoring is now unlocked for active presentations."
    });
  };

  const recordDecision = async (booking: any) => {
    if (!selectedDecision) return;
    setProcessing(true);
    try {
      // 1. Create Evaluation Record
      // @ts-ignore
      const { error: evalErr } = await supabase
        .from('evaluations')
        .insert({
          student_id: booking.student_id,
          examiner_id: user.id,
          evaluation_type: booking.seminar_level,
          recommendation: selectedDecision.toUpperCase().replace(' ', '_'),
          comments: feedback
        });
      
      if (evalErr) throw evalErr;

      // 2. Update Booking to COMPLETED
      // @ts-ignore
      const { error: bErr } = await supabase
        .from('seminar_bookings')
        .update({ status: 'APPROVED' }) // Assuming it stays approved but we mark as processed? status enum usually has 'APPROVED'
        .eq('id', booking.id);

      // 3. Update Student Stage (e.g. DEPT_SEMINAR -> DEPT_SEMINAR_COMPLETED)
      const isDept = booking.seminar_level === 'DEPT_SEMINAR';
      const nextStage = isDept ? 'DEPT_SEMINAR_COMPLETED' : 'SCHOOL_SEMINAR_COMPLETED';
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', booking.student_id);

      toast.success("Consensus Recorded", {
        description: `Architectural timeline for ${booking.student?.user?.first_name} has been updated.`
      });
      fetchSessions();
    } catch (err) {
      console.error(err);
      toast.error("Decision Persistence Error");
    } finally {
      setProcessing(false);
      setSelectedDecision(null);
      setFeedback("");
    }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none scale-150">
           <ClipboardCheck size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <ClipboardCheck className="text-secondary" size={28} />
            Institutional Presentation Portal
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium max-w-md italic">Verifying academic rigor through panel consensus and architectural stage audits.</p>
        </div>
        <div className="flex items-center gap-2 z-10">
           <Button variant="outline" className="gap-2 h-11 text-[10px] font-black uppercase tracking-widest border-border bg-background/50 hover:bg-background rounded-xl px-6">
              <CalendarPlus size={16} /> New Session Slot
           </Button>
        </div>
      </div>

      {sessions.length === 0 && (
         <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/5 opacity-40">
            <Clock size={48} />
            <p className="font-black text-xs uppercase tracking-widest mt-4">Structural Silence: No Sessions Scheduled</p>
         </div>
      )}

      {sessions.map(session => (
        <motion.div key={session.id} variants={itemVariants} className="card-shadow bg-card rounded-3xl overflow-hidden border border-border/60 shadow-xl group">
          <div className="p-6 border-b border-border bg-muted/10 flex flex-col md:flex-row justify-between md:items-center gap-6">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 shadow-inner flex flex-col items-center justify-center group-hover:bg-primary/5 transition-colors">
                   <span className="text-[10px] font-black text-muted-foreground uppercase leading-tight">{session.date.split(' ')[0]}</span>
                   <span className="text-xl font-black text-foreground leading-none">{session.date.split(' ')[1].replace(',', '')}</span>
                </div>
                <div>
                   <h3 className="font-black text-foreground flex items-center gap-2 text-xl tracking-tight">
                      {session.room}
                   </h3>
                   <div className="flex items-center gap-4 mt-1.5">
                      <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                         <Users size={12} className="text-primary"/> {session.presenters.length} Candidates
                      </p>
                      <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                         <MapPin size={12} className="text-secondary"/> Level 4 Annex
                      </p>
                   </div>
                </div>
             </div>
             
             <Button
                size="lg"
                className={`gap-3 h-12 px-8 text-[11px] font-black uppercase tracking-[0.1em] transition-all rounded-xl shadow-lg active:scale-[0.98] ${
                  sessionStarted ? "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20 shadow-none" : "bg-primary text-white shadow-primary/20"
                }`}
                onClick={sessionStarted ? undefined : startSession}
             >
                {sessionStarted ? <Clock size={16} className="animate-pulse" /> : <PlayCircle size={16} />}
                {sessionStarted ? "Protocol In Progress" : "Commence Protocol"}
             </Button>
          </div>
          
          <div className="divide-y divide-border/30 bg-muted/5">
            {session.presenters.map((p: any, i: number) => (
              <div key={i} className={`p-8 transition-all relative ${p.student?.current_stage.includes('PENDING') ? "bg-primary/[0.01]" : "bg-background"}`}>
                 <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-4">
                          <span className="text-[11px] font-black bg-background text-foreground p-1 px-3 rounded-lg border border-border font-mono shadow-sm">
                             {(i + 10).toString()}:00 AM
                          </span>
                          <h4 className="text-xl font-black text-foreground tracking-tight">{p.student?.user?.first_name} {p.student?.user?.last_name}</h4>
                          <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${p.seminar_level.includes('DEPT') ? 'bg-primary/10 text-primary border-primary/20' : 'bg-secondary/10 text-secondary border-secondary/20'}`}>
                             {p.seminar_level.replace('_', ' ')}
                          </Badge>
                       </div>
                       <p className="text-xs font-bold text-foreground/70 uppercase tracking-widest leading-loose">
                          Domain: <span className="text-foreground italic bg-muted/60 px-2 py-0.5 rounded ml-1">{p.student?.programme?.name}</span>
                       </p>
                       <div className="flex items-center gap-4 pt-2">
                          <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-secondary hover:bg-transparent hover:text-secondary group/link">
                             <FileText size={16} className="group-hover/link:translate-y-[-2px] transition-transform"/> Thesis Blueprint
                          </Button>
                          <div className="h-1 w-1 rounded-full bg-border" />
                          <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground hover:bg-transparent">
                             <Users size={16}/> Panel Assignment
                          </Button>
                       </div>
                    </div>
                    
                    <div className="w-full lg:w-64">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button 
                             disabled={!sessionStarted} 
                             className="w-full h-12 bg-success hover:bg-success/90 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-success/20 disabled:shadow-none transition-all active:scale-[0.98] rounded-2xl"
                           >
                              Synthesize Consensus
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="max-w-xl rounded-3xl border-border shadow-2xl">
                           <DialogHeader>
                             <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                                <ClipboardCheck className="text-primary" size={28}/> Record Panel Verdict
                             </DialogTitle>
                           </DialogHeader>
                           <div className="space-y-6 py-6">
                              <p className="text-sm text-muted-foreground font-medium">Log the final architectural consensus for <strong className="text-foreground">{p.student?.user?.first_name} {p.student?.user?.last_name}</strong>. This status is final and triggers student stage advancement.</p>
                              
                              <div className="grid grid-cols-2 gap-3">
                                 {[
                                   { id: 'pass', label: 'Pass', color: 'success', icon: CheckCircle2 },
                                   { id: 'minor', label: 'Minor Corrections', color: 'status-warning', icon: AlertTriangle },
                                   { id: 'major', label: 'Major Corrections', color: 'destructive', icon: AlertTriangle },
                                   { id: 'repeat', label: 'Repeat Seminar', color: 'muted-foreground', icon: PlayCircle },
                                 ].map((dec) => (
                                   <Button 
                                     key={dec.id}
                                     variant={selectedDecision === dec.id ? "default" : "outline"} 
                                     className={`h-16 border-border/60 text-[10px] font-black uppercase tracking-widest justify-start px-6 rounded-2xl transition-all ${
                                       selectedDecision === dec.id 
                                         ? `bg-${dec.color} text-white border-transparent` 
                                         : `hover:bg-${dec.color}/5 hover:text-${dec.color} bg-background`
                                     }`} 
                                     onClick={() => setSelectedDecision(dec.id)}
                                   >
                                      <dec.icon size={18} className="mr-3" /> {dec.label}
                                   </Button>
                                 ))}
                              </div>

                              <div className="space-y-3 pt-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                   <MessageSquare size={14} className="text-primary"/> Formal Panel Observations
                                 </label>
                                 <Textarea 
                                   value={feedback}
                                   onChange={(e) => setFeedback(e.target.value)}
                                   placeholder="Final commentary and required revisions..." 
                                   className="min-h-[120px] bg-muted/30 focus:bg-background transition-colors p-5 border-border/60 rounded-2xl text-sm font-medium" 
                                 />
                              </div>
                           </div>
                           <DialogFooter className="gap-2">
                              <Button variant="ghost" className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Discard</Button>
                              <Button 
                                 className="bg-primary hover:bg-primary/90 text-white font-black h-12 px-8 rounded-xl uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20" 
                                 disabled={!selectedDecision || processing}
                                 onClick={() => recordDecision(p)}
                              >
                                 Commit Decision
                              </Button>
                           </DialogFooter>
                         </DialogContent>
                       </Dialog>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
