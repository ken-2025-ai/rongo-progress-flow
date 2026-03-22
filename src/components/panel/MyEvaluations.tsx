import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, Search, BookOpen, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight, PenTool, GitPullRequest,
  Loader2, Star, MessageSquare, Save, Send, History, Briefcase, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export function MyEvaluations() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Evaluation State
  const [verdict, setVerdict] = useState<'PASS' | 'MINOR_CORRECTIONS' | 'MAJOR_CORRECTIONS' | 'FAIL' | ''>('');
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) fetchAssignedStudents();
  }, [user]);

  const fetchAssignedStudents = async () => {
    setLoading(true);
    try {
      // Fetch students awaiting panel evaluation
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          id, registration_number, current_stage, research_title,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          supervisor:supervisor_id(first_name, last_name)
        `)
        .in('current_stage', ['SCHOOL_SEMINAR_BOOKED', 'PG_EXAMINATION', 'VIVA_SCHEDULED']);

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Panel Data Sync Error");
    } finally {
      setLoading(false);
    }
  };

  const submitEvaluation = async () => {
    if (!selectedStudent || !verdict) return;
    setIsSubmitting(true);
    try {
      // 1. Create evaluation record
      // @ts-ignore
      const { error: evErr } = await supabase.from('evaluations').insert({
        student_id: selectedStudent.id,
        evaluator_id: user.id,
        score,
        comments,
        recommendation: verdict,
        evaluation_type: selectedStudent.current_stage.includes('PG') ? 'PG_EXAMINATION' : 'SEMINAR_II'
      });

      if (evErr) throw evErr;

      // 2. Advance student stage if necessary (or leave for Dean to finalize)
      // For now, we'll mark the student as having completed this seminar phase
      let nextStage = selectedStudent.current_stage;
      if (verdict === 'PASS' || verdict === 'MINOR_CORRECTIONS') {
          if (selectedStudent.current_stage === 'SCHOOL_SEMINAR_BOOKED') nextStage = 'SCHOOL_SEMINAR_COMPLETED';
          if (selectedStudent.current_stage === 'VIVA_SCHEDULED') nextStage = 'COMPLETED';
      } else if (verdict === 'MAJOR_CORRECTIONS') {
          nextStage = 'CORRECTIONS';
      }

      // @ts-ignore
      const { error: sErr } = await supabase.from('students').update({ current_stage: nextStage }).eq('id', selectedStudent.id);
      if (sErr) throw sErr;

      toast.success("Scholastic Verdict Committed", {
        description: `Official marks for ${selectedStudent.user?.first_name} have been synchronized with the Dean's Ledger.`
      });
      
      setSelectedStudent(null);
      setVerdict('');
      setScore(0);
      setComments("");
      fetchAssignedStudents();
    } catch (err: any) {
      toast.error("Verdict Submission Failed", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
     <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Dynamic Header Overlay */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-10 rounded-[40px] border border-border/50 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <Briefcase size={200} />
         </div>
         <div className="relative z-10">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4 px-5 py-2 rounded-full">
               Institutional Verdict Engine
            </Badge>
            <h2 className="text-3xl font-black text-foreground tracking-tighter italic">Academic <span className="text-primary">Review Console</span></h2>
            <p className="text-xs text-muted-foreground mt-2 font-medium max-w-md">Access candidate research dossiers and commit official institutional marks for this panel session.</p>
         </div>
         <div className="relative z-10 w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
            <Input 
               placeholder="Query Candidate Dossier..." 
               className="h-14 pl-14 rounded-[24px] bg-background border-2 focus:border-primary transition-all font-bold placeholder:italic shadow-inner"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <AnimatePresence>
          {students.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 py-32 text-center border-4 border-dashed border-border rounded-[48px] bg-muted/5 flex flex-col items-center gap-8">
                <div className="p-10 bg-card rounded-full shadow-2xl opacity-20 border border-border">
                   <Star size={72} />
                </div>
                <div className="space-y-3">
                   <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Panel Registry Clear</h3>
                   <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">No pending candidates detected in the current session pipeline. Synchronization stable.</p>
                </div>
             </motion.div>
          ) : (
            students
            .filter(s => {
               const name = `${s.user?.first_name} ${s.user?.last_name}`.toLowerCase();
               return name.includes(searchTerm.toLowerCase()) || s.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
            })
            .map((s) => (
               <motion.div 
                  key={s.id} 
                  variants={itemVariants} 
                  layout
                  className={`card-shadow bg-card rounded-[40px] overflow-hidden border-2 transition-all p-10 flex flex-col gap-8 relative group ${
                     selectedStudent?.id === s.id ? 'border-primary ring-8 ring-primary/5 shadow-3xl scale-[1.02]' : 'border-border hover:border-primary/30'
                  }`}
               >
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                     <FileText size={120} />
                  </div>

                  <div className="space-y-6 relative z-10">
                     <div className="flex justify-between items-start">
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                           {s.current_stage.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted rounded-full px-4 py-1.5">REG: {s.registration_number}</span>
                     </div>
                     
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">{s.user?.first_name} {s.user?.last_name}</h3>
                        <p className="text-sm font-bold text-primary italic line-clamp-2 leading-relaxed">"{s.research_title || 'Institutional Research Mapping Pending'}"</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex items-center gap-3">
                           <GitPullRequest size={16} className="text-primary"/> {s.programme?.name}
                        </div>
                        <div className="bg-muted/30 p-4 rounded-2xl border border-border/50 flex items-center gap-3">
                           <History size={16} className="text-secondary"/> Sup: {s.supervisor?.first_name || 'NULL_NODE'}
                        </div>
                     </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-border/50 relative z-10 flex gap-4">
                     <Button 
                        variant="outline" 
                        className="h-14 flex-1 rounded-[24px] border-2 font-black uppercase tracking-widest text-[10px] gap-3 bg-muted/20 hover:bg-muted/40 transition-all"
                     >
                        <BookOpen size={20} className="text-primary" /> View Thesis
                     </Button>
                     <Button 
                        onClick={() => setSelectedStudent(s)}
                        className={`h-14 flex-1 rounded-[24px] font-black uppercase tracking-widest text-[10px] gap-3 transition-all active:scale-[0.98] ${
                           selectedStudent?.id === s.id ? 'bg-primary text-white shadow-xl rotate-1' : 'bg-black text-white hover:bg-primary'
                        }`}
                     >
                        <PenTool size={20} /> Commit Verdict
                     </Button>
                  </div>

                  {/* Dynamic Inline Terminal for Selection */}
                  <AnimatePresence>
                     {selectedStudent?.id === s.id && (
                        <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="space-y-10 pt-10 mt-6 border-t-[3px] border-primary/20 relative z-10"
                        >
                           {/* Section 1: Score & Metrics */}
                           <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                                 <Star size={14} className="text-primary" /> Scholastic Scoring Matrix
                              </h4>
                              <div className="bg-black text-white p-8 rounded-[32px] border border-white/10 shadow-3xl space-y-6">
                                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="text-primary italic">Total Architectural Score</span>
                                    <span className="text-3xl font-black tabular-nums">{score}<span className="text-white/20 text-lg">/100</span></span>
                                 </div>
                                 <input 
                                    type="range" min="0" max="100" value={score} 
                                    onChange={(e) => setScore(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                 />
                                 <div className="flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
                                    <span>Fail Protocol</span>
                                    <span>Institutional Excellence</span>
                                 </div>
                              </div>
                           </div>

                           {/* Section 2: Verdict Protocol */}
                           <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                                 <GitPullRequest size={14} className="text-secondary" /> Final Institutional Recommendation
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                 {[
                                    { id: 'PASS', label: 'Unconditional Pass', icon: CheckCircle2, color: 'hover:bg-success/10 hover:text-success' },
                                    { id: 'MINOR_CORRECTIONS', label: 'Minor Corrections', icon: AlertTriangle, color: 'hover:bg-status-warning/10 hover:text-status-warning' },
                                    { id: 'MAJOR_CORRECTIONS', label: 'Major Corrections', icon: ShieldAlert, color: 'hover:bg-destructive/10 hover:text-destructive' },
                                    { id: 'FAIL', label: 'Institutional Fail', icon: XCircle, color: 'hover:bg-muted/20 hover:text-muted-foreground' }
                                 ].map((prot) => (
                                    <Button 
                                       key={prot.id}
                                       variant={verdict === prot.id ? 'default' : 'outline'}
                                       onClick={() => setVerdict(prot.id as any)}
                                       className={`h-16 rounded-2xl justify-start px-6 gap-4 text-[10px] font-black uppercase tracking-widest transition-all ${
                                          verdict === prot.id ? 'bg-primary text-white shadow-xl' : `border-border/50 ${prot.color}`
                                       }`}
                                    >
                                       <prot.icon size={20} /> {prot.label}
                                    </Button>
                                 ))}
                              </div>
                           </div>

                           {/* Section 3: Professional Remarks */}
                           <div className="space-y-4">
                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                                 <MessageSquare size={14} className="text-primary" /> Panel Commentary & Rationalisation
                              </h4>
                              <Textarea 
                                 value={comments}
                                 onChange={(e) => setComments(e.target.value)}
                                 placeholder="Provide rigorous academic justification for this verdict. Identify key findings, weaknesses, and required systemic changes..."
                                 className="min-h-[150px] bg-muted/10 p-6 rounded-[24px] border-2 focus:border-primary transition-all text-sm font-medium italic"
                              />
                           </div>

                           {/* Final Commit */}
                           <div className="pt-8 flex gap-4">
                              <Button 
                                 variant="ghost" 
                                 className="h-16 flex-1 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted"
                                 onClick={() => setSelectedStudent(null)}
                              >
                                 Cancel Session
                              </Button>
                              <Button 
                                 onClick={submitEvaluation}
                                 disabled={!verdict || isSubmitting}
                                 className="h-16 flex-[2] rounded-[24px] bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 gap-4"
                              >
                                 {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <><Send size={18}/> Synchronize Marks to Dean</>}
                              </Button>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}

function ShieldAlert({ size, className }: { size: number, className?: string }) {
    return <AlertTriangle size={size} className={className} />
}
