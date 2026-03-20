import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, CheckCircle2, AlertCircle, FileText, LayoutDashboard, Send, Loader2, UserCheck, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";

export function SeminarFeedback() {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    if (user?.id) fetchEvaluations();
  }, [user]);

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      // 1. Get student profile
      // @ts-ignore
      const { data: sData } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
      
      if (sData) {
        setStudent(sData);
        // 2. Fetch all evaluations for this student
        // @ts-ignore
        const { data: eData } = await supabase
          .from('evaluations')
          .select(`
            *,
            evaluator:evaluator_id(first_name, last_name, role)
          `)
          .eq('student_id', sData.id)
          .order('created_at', { ascending: false });
        
        setEvaluations(eData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-6xl mx-auto">
      
      {/* Dynamic Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-8 rounded-[32px] border border-border/50 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
           <Scale size={180} />
        </div>
        <div className="relative z-10">
           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase tracking-[0.2em] mb-3 px-4 py-1.5 rounded-full">
              Institutional Verdict Ledger
           </Badge>
           <h2 className="text-2xl font-black text-foreground tracking-tight italic">Scholastic <span className="text-primary">Performance Feed</span></h2>
           <p className="text-xs text-muted-foreground mt-2 font-medium max-w-md">Access your official seminar evaluations, panel corrections, and final academic grading.</p>
        </div>
        <Button variant="outline" className="h-12 rounded-2xl border-border px-8 text-[10px] font-black uppercase tracking-widest gap-3 relative z-10 hover:bg-muted/50 mt-4 md:mt-0">
           <FileText size={18} />
           Export Ledger PDF
        </Button>
      </motion.div>

      <div className="space-y-8">
        <AnimatePresence>
          {evaluations.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center flex flex-col items-center gap-6 border-2 border-dashed border-border rounded-[40px] bg-muted/5">
                <div className="p-8 bg-card rounded-full shadow-inner opacity-20 border border-border">
                   <ClipboardCheck size={64} />
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-black text-foreground uppercase tracking-widest italic opacity-40">No Verdicts Recorded Yet</p>
                   <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Synchronization pending panel assessment</p>
                </div>
             </motion.div>
          ) : (
            evaluations.map((ev, i) => {
              const recommendationLabel = ev.recommendation?.replace(/_/g, ' ') || 'Evaluation Pending';
              const isPass = ev.recommendation === 'PASS' || ev.recommendation === 'MINOR_CORRECTIONS';
              
              return (
                <motion.div 
                   key={ev.id} 
                   variants={itemVariants} 
                   layout
                   className={`card-shadow rounded-[40px] bg-card border-l-[12px] p-10 overflow-hidden relative group hover:border-l-primary transition-all duration-500 ${
                     isPass ? "border-l-success" : "border-l-destructive"
                   }`}
                >
                  {/* Score Tag */}
                  <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                     <span className={`text-[10px] font-black px-5 py-2 rounded-2xl uppercase tracking-widest border-none shadow-lg ${
                       isPass ? "bg-success text-white" : "bg-destructive text-white"
                     }`}>
                       {recommendationLabel}
                     </span>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date(ev.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 ${
                           isPass ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}>
                          <ClipboardCheck size={32} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{ev.evaluation_type?.replace(/_/g, ' ')}</h3>
                          <p className="text-[10px] text-muted-foreground mt-1 font-black uppercase tracking-[0.3em]">Institutional Appraisal Code: EVAL-{ev.id?.slice(0, 5)}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <div className="h-[1px] flex-1 bg-border/50" />
                           <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground shrink-0 flex items-center gap-2">
                              <AlertCircle size={14} className="text-primary" /> Scholastic Appraisal
                           </h4>
                           <div className="h-[1px] flex-1 bg-border/50" />
                        </div>
                        
                        <div className="bg-muted/10 p-8 rounded-[32px] border border-border/50 shadow-inner relative">
                           <div className="absolute top-0 right-0 p-6 opacity-[0.05] pointer-events-none">
                              <FileText size={80} />
                           </div>
                           <p className="text-sm font-bold text-foreground leading-relaxed italic relative z-10">
                              "{ev.comments || "Official evaluation commentary pending architectural synchronization."}"
                           </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 flex flex-col">
                       {/* Evaluator Node */}
                       <div className="bg-[#0c0c0c] p-8 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden flex-1 group/eval">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                          <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-2 relative z-10">
                             <UserCheck size={14} className="text-primary" /> Panel Author
                          </h4>
                          <div className="relative z-10 space-y-4">
                             <div className="space-y-1">
                                <p className="text-lg font-black text-white tracking-tight">{ev.evaluator?.first_name} {ev.evaluator?.last_name || "Registry Node"}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">{ev.evaluator?.role || "Staff Member"}</p>
                             </div>
                             <div className="pt-4 border-t border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-[10px] text-white/30 font-black uppercase tracking-widest">
                                   <span>Verdict Rank</span>
                                   <span className="text-white">Authorized</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                   <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-primary" />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Action Redirect */}
                       <Button className="h-16 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] gap-3">
                          <Send size={20} />
                          Log Revision Acknowledgement
                       </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
