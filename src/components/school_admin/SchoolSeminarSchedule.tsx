import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle, ClipboardCheck, Users,
  Clock, CalendarPlus, FileText, CheckCircle2, AlertTriangle, MessageSquare, BookOpen, Loader2, MapPin, ChevronDown, ChevronUp
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

const DECISION_OPTS = [
  { id: 'pass', label: 'Pass', colorClass: 'bg-success/10 text-success border-success/20', icon: CheckCircle2, rec: 'Cleared for PG Examination' },
  { id: 'minor', label: 'Minor Corrections', colorClass: 'bg-status-warning/10 text-status-warning border-status-warning/20', icon: AlertTriangle, rec: 'Minor Corrections Required' },
  { id: 'major', label: 'Major Corrections', colorClass: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle, rec: 'Major Corrections Required' },
  { id: 'repeat', label: 'Repeat School', colorClass: 'bg-muted text-muted-foreground border-border', icon: PlayCircle, rec: 'Repeat School Seminar' },
];

export function SchoolSeminarSchedule() {
  const { user } = useRole();
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [expandedPresenter, setExpandedPresenter] = useState<string | null>(null);

  useEffect(() => {
    if (user?.department_id) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // 1. Get school info for the current school coordinator
      // @ts-ignore
      const { data: deptData } = await supabase
        .from('departments')
        .select('school_id, schools(name)')
        .eq('id', user.department_id)
        .single();
      
      if (!deptData) return;

      // 2. Fetch all approved/booked school seminar bookings
      // @ts-ignore
      const { data, error } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            id,
            registration_number,
            current_stage,
            research_title,
            user:user_id(first_name, last_name, email),
            programme:programme_id(name, department:department_id(name, id, school_id)),
            evaluations(id, recommendation, created_at, comments)
          )
        `)
        .eq('seminar_level', 'SCHOOL_SEMINAR')
        .eq('status', 'APPROVED')
        .order('approved_date', { ascending: true });

      if (error) throw error;

      // 3. Filter by school in JS
      const schoolFiltered = (data || []).filter((b: any) => 
        b.student?.programme?.department?.school_id === deptData.school_id
      );

      // Group by date
      const grouped = schoolFiltered.reduce((acc: any[], curr: any) => {
        const dateKey = curr.approved_date?.slice(0, 10) || curr.requested_date?.slice(0, 10);
        const display = dateKey ? new Date(dateKey).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
        const existing = acc.find(s => s.dateKey === dateKey);
        if (existing) {
          existing.bookings.push(curr);
        } else {
          acc.push({ id: dateKey || curr.id, dateKey, date: display, bookings: [curr] });
        }
        return acc;
      }, []);

      setSessions(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load school schedule.");
    } finally {
      setLoading(false);
    }
  };

  const startSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    toast.success("School Session Started", {
      description: "Scores for the Third Thursday Seminar can now be recorded.",
      duration: 5000
    });
  };

  const recordDecision = async (booking: any) => {
    const decisionId = selectedDecisions[booking.id];
    const decision = DECISION_OPTS.find(d => d.id === decisionId);
    if (!decision) {
      toast.error("Please select a panel verdict.");
      return;
    }
    const feedback = feedbacks[booking.id] || "";
    const studentName = `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}`;

    setProcessing(true);
    try {
      // 1. Record Evaluation
      // @ts-ignore
      const { error: eErr } = await supabase.from('evaluations').insert({
        student_id: booking.student_id,
        evaluator_id: user?.id,
        evaluation_type: 'SCHOOL_SEMINAR',
        recommendation: decision.rec,
        comments: feedback
      });
      if (eErr) throw eErr;

      // 2. Update Student Stage or reset
      let nextStage: string;
      if (decisionId === 'pass' || decisionId === 'minor') {
        nextStage = 'SCHOOL_SEMINAR_COMPLETED';
      } else {
        // Major / Repeat → back to school pending (needs reschecule)
        nextStage = 'SCHOOL_SEMINAR_PENDING';
      }

      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', booking.student_id);
      if (sErr) throw sErr;

      // 3. Mark Booking as COMPLETED
      // @ts-ignore
      await supabase
        .from('seminar_bookings')
        .update({ status: 'COMPLETED' })
        .eq('id', booking.id);

      toast.success("Verdict Recorded", {
        description: `${studentName}'s institutional stage is now ${nextStage.replace(/_/g, ' ')}.`
      });
      
      setSelectedDecisions(prev => { const n = { ...prev }; delete n[booking.id]; return n; });
      setFeedbacks(prev => { const n = { ...prev }; delete n[booking.id]; return n; });
      fetchSessions();
    } catch (err: any) {
      console.error(err);
      toast.error("Decision persistence error", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none scale-150">
          <CalendarPlus size={100} />
        </div>
        <div className="relative z-10">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 text-[9px] font-black uppercase tracking-[0.2em] mb-3">
            3rd Thursday Protocol
          </Badge>
          <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
            School Seminar Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xl italic">
            Managing institutional-level presentations for all vetted research candidates.
          </p>
        </div>
        <div className="z-10 bg-secondary/10 text-secondary px-6 py-3 rounded-2xl border border-secondary/20 font-black text-xs uppercase tracking-widest shadow-inner">
           Institutional PG Boardroom
        </div>
      </div>

      {sessions.length === 0 && (
         <div className="py-24 text-center italic text-muted-foreground uppercase text-[12px] tracking-widest bg-muted/5 rounded-3xl border-2 border-dashed border-border/40 opacity-50">
            No institutional seminars scheduled in the current architectural cycle.
         </div>
      )}

      {sessions.map((session) => {
        const isActive = activeSessionId === session.id;
        return (
          <motion.div key={session.id} variants={itemVariants} className="card-shadow bg-card rounded-3xl overflow-hidden border border-border/60 shadow-xl group">
            <div className="p-6 border-b border-border/50 bg-muted/10 flex flex-col md:flex-row justify-between md:items-center gap-6">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-background border border-border/60 flex flex-col items-center justify-center shadow-inner group-hover:bg-primary/5 transition-colors">
                     <span className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                        {session.date.split(' ')[0]}
                     </span>
                     <span className="text-2xl font-black text-secondary leading-none">
                        {session.date.split(' ')[1]?.replace(',', '')}
                     </span>
                  </div>
                  <div>
                     <h3 className="font-black text-foreground text-xl tracking-tight">
                        {session.date}
                     </h3>
                     <div className="flex items-center gap-5 mt-1.5 font-black uppercase text-[10px] tracking-widest text-muted-foreground/60">
                        <span className="flex items-center gap-1.5">
                           <Users size={14} className="text-secondary" /> {session.bookings.length} Candidates
                        </span>
                        <span className="flex items-center gap-1.5">
                           <MapPin size={14} className="text-primary" /> PG Boardroom
                        </span>
                     </div>
                  </div>
               </div>
               
               <Button
                  size="lg"
                  className={`gap-2 h-12 px-10 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.98] ${
                    isActive ? "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20 shadow-none" : "bg-primary text-white shadow-primary/20"
                  }`}
                  onClick={() => !isActive && startSession(session.id)}
               >
                  {isActive ? <Clock size={16} className="animate-pulse" /> : <PlayCircle size={16} />}
                  {isActive ? "Session Active" : "Commence Protocol"}
               </Button>
            </div>
            
            <div className="divide-y divide-border/30 bg-muted/5">
              {session.bookings.map((b: any, i: number) => {
                const chosenDecision = selectedDecisions[b.id];
                const isExpanded = expandedPresenter === b.id;
                
                return (
                  <div key={b.id} className="p-8 transition-all hover:bg-background">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-xs font-black bg-background text-muted-foreground p-1.5 px-3.5 rounded-xl border border-border/60 font-mono shadow-sm">
                             {(i + 13).toString()}:00 PM
                          </span>
                          <h4 className="text-2xl font-black text-foreground tracking-tight">{b.student.user.first_name} {b.student.user.last_name}</h4>
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-muted/60 text-muted-foreground border-border/80 px-3 py-1.5">
                             {b.student.programme?.department?.name}
                          </Badge>
                        </div>
                        
                        {b.student.research_title && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground font-medium max-w-2xl italic leading-relaxed">
                            <BookOpen size={16} className="text-secondary shrink-0 mt-0.5" />
                            <p>"{b.student.research_title}"</p>
                          </div>
                        )}

                        <div className="flex items-center gap-6 pt-2">
                           <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-secondary hover:bg-transparent" onClick={() => toast.info("View Draft protocol active.")}>
                              <FileText size={18} /> Thesis Draft
                           </Button>
                           <div className="h-1 w-1 rounded-full bg-border" />
                           <Button variant="ghost" className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-muted-foreground hover:bg-transparent flex items-center" onClick={() => setExpandedPresenter(isExpanded ? null : b.id)}>
                              <MessageSquare size={18} /> History Review {isExpanded ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                           </Button>
                        </div>

                        {/* Expandable History Feed */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }} 
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden mt-2 pt-4 bg-background/50 rounded-2xl p-5 border border-border/40"
                            >
                               <h5 className="text-[9px] font-black uppercase text-secondary/60 tracking-widest mb-3">Institutional Evaluation History</h5>
                               <div className="space-y-3">
                                  {(b.student.evaluations || []).length === 0 ? (
                                    <p className="text-xs italic text-muted-foreground">No departmental history records found.</p>
                                  ) : (
                                    b.student.evaluations.slice(0, 3).map((ev: any) => (
                                      <div key={ev.id} className="text-xs p-3 bg-white/40 rounded-xl border border-border/30">
                                         <p className="font-black text-foreground mb-1">{ev.evaluation_type?.replace(/_/g, ' ')} — {ev.recommendation}</p>
                                         <p className="text-muted-foreground leading-relaxed italic">"{ev.comments}"</p>
                                      </div>
                                    ))
                                  )}
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="w-full lg:w-64 shrink-0">
                         <Dialog>
                           <DialogTrigger asChild>
                             <Button 
                               disabled={!isActive} 
                               className="w-full h-14 bg-success hover:bg-success/90 text-white text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-success/40 disabled:shadow-none transition-all rounded-2xl active:scale-[0.98]"
                             >
                                <ClipboardCheck size={18} className="mr-2" /> Record School Verdict
                             </Button>
                           </DialogTrigger>
                           <DialogContent className="sm:max-w-xl rounded-[2.5rem] border-border/60 shadow-2xl p-0 overflow-hidden">
                             <div className="bg-secondary/5 p-8 border-b border-border/50">
                               <DialogTitle className="flex items-center gap-4 text-2xl font-black tracking-tight">
                                  <div className="p-3 bg-secondary/10 rounded-2xl">
                                     <ClipboardCheck className="text-secondary" size={28} />
                                  </div>
                                  Synthesize School Consensus
                               </DialogTitle>
                               <p className="text-xs text-muted-foreground mt-2 font-medium leading-relaxed italic opacity-80">Finalizing institutional clearance for {b.student.user.first_name}.</p>
                             </div>
                             
                             <div className="p-8 space-y-8">
                                 <div className="grid grid-cols-2 gap-4">
                                    {DECITION_OPTS.map((opt) => (
                                      <button 
                                        key={opt.id}
                                        onClick={() => setSelectedDecisions(prev => ({ ...prev, [b.id]: opt.id }))}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border text-left transition-all ${
                                          chosenDecision === opt.id 
                                            ? opt.colorClass 
                                            : 'border-border/50 hover:border-secondary/30 bg-muted/5'
                                        }`}
                                      >
                                         <opt.icon size={20} className={chosenDecision === opt.id ? 'opacity-100' : 'opacity-40'} />
                                         <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{opt.label}</span>
                                      </button>
                                    ))}
                                 </div>
  
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                       <MessageSquare size={16} className="text-secondary"/> Formal School Assessment Note
                                    </label>
                                    <Textarea 
                                       placeholder="Detail specific corrections or board observations..." 
                                       className="min-h-[140px] text-sm rounded-2xl bg-muted/20 border-border/50 p-5 p-5 resize-none focus:bg-background transition-all" 
                                       value={feedbacks[b.id] || ""}
                                       onChange={(e) => setFeedbacks(prev => ({ ...prev, [b.id]: e.target.value }))}
                                    />
                                 </div>
                             </div>
                             
                             <div className="p-8 border-t border-border/50 bg-muted/5 flex justify-end gap-3">
                                 <Button variant="ghost" className="h-12 rounded-xl px-8 font-black uppercase text-[10px]" onClick={() => setSelectedDecisions(prev => { const n={...prev}; delete n[b.id]; return n; })}>Cancel</Button>
                                 <Button 
                                   className="bg-primary text-white h-12 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20" 
                                   onClick={() => recordDecision(b)} 
                                   disabled={!chosenDecision || processing}
                                 >
                                    {processing ? <Loader2 size={16} className="animate-spin" /> : "Commit Architectural Decision"}
                                 </Button>
                             </div>
                           </DialogContent>
                         </Dialog>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
