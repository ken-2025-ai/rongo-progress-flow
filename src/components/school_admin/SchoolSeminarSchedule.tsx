import { motion } from "framer-motion";
import { 
  PlayCircle, ClipboardCheck, Users, 
  Clock, CalendarPlus, FileText, CheckCircle2, AlertTriangle, MessageSquare, BookOpen, Loader2
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

export function SchoolSeminarSchedule() {
  const { user } = useRole();
  const [selectedDecision, setSelectedDecision] = useState("");
  const [feedback, setFeedback] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Fetch approved SCHOOL_SEMINAR bookings
      // @ts-ignore
      const { data, error } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
             id,
             registration_number,
             user:user_id(first_name, last_name),
             programme:programme_id(department:department_id(name))
          )
        `)
        .eq('status', 'APPROVED')
        .eq('seminar_level', 'SCHOOL_SEMINAR')
        .order('requested_date', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = (data || []).reduce((acc: any, b: any) => {
        const date = new Date(b.requested_date).toLocaleDateString();
        if (!acc[date]) acc[date] = { date, bookings: [] };
        acc[date].bookings.push(b);
        return acc;
      }, {});

      setSessions(Object.values(grouped));
    } catch (err) {
      console.error(err);
      toast.error("Failed to synchronize school schedule.");
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    toast.success("School Session Started", {
      description: "Scores for the Third Thursday Seminar can now be recorded."
    });
  };

  const recordDecision = async (booking: any) => {
    const recommendationMap: Record<string, string> = {
       pass: "Cleared for PG Examination",
       minor: "Minor Corrections Required",
       major: "Major Corrections Required",
       repeat: "Repeat School Seminar"
    };

    try {
      // 1. Record Evaluation
      // @ts-ignore
      const { error: eErr } = await supabase.from('evaluations').insert({
        student_id: booking.student_id,
        evaluator_id: user.id,
        evaluation_type: 'SCHOOL_SEMINAR',
        recommendation: recommendationMap[selectedDecision],
        comments: feedback
      });
      if (eErr) throw eErr;

      // 2. Update Student Stage
      let nextStage = booking.student.current_stage;
      if (selectedDecision === 'pass') nextStage = 'THESIS_READINESS_CHECK';
      
      // @ts-ignore
      const { error: sErr } = await supabase.from('students').update({ current_stage: nextStage }).eq('id', booking.student_id);
      if (sErr) throw sErr;

      // 3. Mark Booking as Completed
      // @ts-ignore
      const { error: bErr } = await supabase.from('seminar_bookings').update({ status: 'COMPLETED' }).eq('id', booking.id);
      if (bErr) throw bErr;

      toast.success("School Decision Recorded", {
        description: `Consensus for ${booking.student.user.first_name} saved. Student synchronized with institutional pipeline.`
      });
      
      setSelectedDecision("");
      setFeedback("");
      fetchSessions();
    } catch (err) {
      console.error(err);
       toast.error("Process Synchronization Error", { description: "Decision could not be persisted to the institutional vault." });
    }
  };

  if (loading) return (
     <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-3">
            <CalendarPlus className="text-secondary" size={24} />
            School Seminar Schedule
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">Manage the exclusive Third Thursday School Level presentations.</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
           <Badge variant="outline" className="h-7 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-primary/20 px-3">3rd Thursday Enforced</Badge>
        </div>
      </div>

      {sessions.length === 0 && (
         <div className="py-20 text-center italic text-muted-foreground uppercase text-[10px] tracking-widest bg-card/20 rounded-2xl border-2 border-dashed border-border/50">
            No approved presentations scheduled in the current architectural cycle.
         </div>
      )}

      {sessions.map((session, idx) => (
        <motion.div key={idx} variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border/60 shadow-lg">
          <div className="p-5 border-b border-border/50 bg-muted/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border/60 flex flex-col items-center justify-center shadow-inner">
                   <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                      {new Date(session.date).toLocaleString('default', { month: 'short' })}
                   </span>
                   <span className="text-2xl font-black text-secondary leading-none">
                      {new Date(session.date).getDate()}
                   </span>
                </div>
                <div>
                   <h3 className="font-black text-foreground flex items-center gap-2 text-lg">
                      Institutional PG Boardroom
                   </h3>
                   <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black flex items-center gap-2 mt-1 opacity-70">
                      <Clock size={14} className="text-secondary" /> Third Thursday Protocol
                   </p>
                </div>
             </div>
             
             <Button
                size="sm"
                className={`gap-2 h-11 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md ${
                  sessionStarted ? "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20" : "bg-primary text-white"
                }`}
                onClick={sessionStarted ? undefined : startSession}
             >
                {sessionStarted ? <Clock size={16} /> : <PlayCircle size={16} />}
                {sessionStarted ? "Session Active" : "Start Session"}
             </Button>
          </div>
          
          <div className="divide-y divide-border/30">
            {session.bookings.map((b: any, i: number) => (
              <div key={i} className={`p-6 transition-colors ${i % 2 === 0 ? "bg-muted/5" : "bg-background"}`}>
                 <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                    <div className="flex-1 space-y-4">
                       <div className="flex items-center gap-4">
                          <span className="text-xs font-black bg-background text-muted-foreground p-1 px-3 rounded-lg border border-border/60 font-mono shadow-sm">
                             {new Date(b.requested_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <h4 className="text-xl font-black text-foreground">{b.student.user.first_name} {b.student.user.last_name}</h4>
                          <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.1em] bg-muted/60 text-muted-foreground border-border/80 px-2.5">
                             {b.student.programme.department.name}
                          </Badge>
                       </div>
                       
                       <div className="flex items-center gap-4 pt-3">
                          <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-secondary hover:no-underline opacity-80 hover:opacity-100">
                             <BookOpen size={16} /> Open Thesis Vault
                          </Button>
                          <Button variant="link" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground hover:no-underline opacity-60 hover:opacity-100">
                             <ClipboardCheck size={16} /> Review Departmental History
                          </Button>
                       </div>
                    </div>
                    
                    <div className="w-full lg:w-56 shrink-0">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button 
                             disabled={!sessionStarted} 
                             className="w-full h-12 bg-success hover:bg-success/90 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-success/20 disabled:shadow-none transition-all rounded-xl"
                           >
                              Record School Decision
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-md rounded-2xl border-border/60 shadow-2xl">
                           <DialogHeader>
                             <DialogTitle className="flex items-center gap-3 text-xl font-black">
                                <ClipboardCheck className="text-primary" size={24} /> Record School Decision
                             </DialogTitle>
                           </DialogHeader>
                           <div className="space-y-6 py-6 border-t border-border/50 mt-4">
                               <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">Log the final School Panel consensus for <strong className="text-foreground font-black">{b.student.user.first_name}</strong>. This dictates if they move to the Final Examination.</p>
                               
                               <div className="grid grid-cols-2 gap-3">
                                  <Button variant={selectedDecision === "pass" ? "default" : "outline"} className={`h-14 border-border/50 text-[10px] font-black uppercase tracking-widest justify-start px-4 gap-3 rounded-xl ${selectedDecision === "pass" ? "bg-success text-white border-transparent shadow-lg shadow-success/20" : "hover:bg-success/5 hover:text-success"}`} onClick={() => setSelectedDecision("pass")}>
                                     <CheckCircle2 size={18} /> Cleared for PG
                                  </Button>
                                  <Button variant={selectedDecision === "minor" ? "default" : "outline"} className={`h-14 border-border/50 text-[10px] font-black uppercase tracking-widest justify-start px-4 gap-3 rounded-xl ${selectedDecision === "minor" ? "bg-status-warning text-white border-transparent shadow-lg shadow-status-warning/20" : "hover:bg-status-warning/5 hover:text-status-warning"}`} onClick={() => setSelectedDecision("minor")}>
                                     <AlertTriangle size={18} /> Minor Fixes
                                  </Button>
                                  <Button variant={selectedDecision === "major" ? "default" : "outline"} className={`h-14 border-border/50 text-[10px] font-black uppercase tracking-widest justify-start px-4 gap-3 rounded-xl ${selectedDecision === "major" ? "bg-destructive text-white border-transparent shadow-lg shadow-destructive/20" : "hover:bg-destructive/5 hover:text-destructive"}`} onClick={() => setSelectedDecision("major")}>
                                     <AlertTriangle size={18} /> Major Fixes
                                  </Button>
                                  <Button variant={selectedDecision === "repeat" ? "default" : "outline"} className={`h-14 border-border/50 text-[10px] font-black uppercase tracking-widest justify-start px-4 gap-3 rounded-xl ${selectedDecision === "repeat" ? "bg-muted text-foreground border-transparent" : "hover:bg-muted/10 hover:text-foreground"}`} onClick={() => setSelectedDecision("repeat")}>
                                     <PlayCircle size={18} /> Repeat School
                                  </Button>
                               </div>

                               <div className="space-y-3 pt-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><MessageSquare size={14} className="text-primary"/> Required Panel Actions</label>
                                  <Textarea 
                                     placeholder="List specific corrections requested by the School Panel..." 
                                     className="min-h-[120px] text-sm rounded-xl bg-muted/10 border-border/50 p-4 resize-none" 
                                     value={feedback}
                                     onChange={(e) => setFeedback(e.target.value)}
                                  />
                               </div>
                           </div>
                           <DialogFooter className="gap-2 sm:gap-0">
                               <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest rounded-xl px-6 h-11" onClick={() => setSelectedDecision("")}>Cancel</Button>
                               <Button 
                                 className="bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-10 h-11 shadow-lg shadow-primary/20" 
                                 onClick={() => recordDecision(b)} 
                                 disabled={!selectedDecision}
                               >
                                  Save Decision & Progress
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

