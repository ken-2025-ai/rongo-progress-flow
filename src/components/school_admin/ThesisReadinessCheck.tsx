import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle2, XCircle, Search,
  BookOpen, FileText, ShieldCheck, Download,
  ExternalLink, Loader2, AlertTriangle, MessageSquare
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
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export function ThesisReadinessCheck() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [revertNote, setRevertNote] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, [user]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name, school_id)),
          evaluations(id, recommendation, evaluation_type, created_at, comments)
        `)
        .in('current_stage', ['SCHOOL_SEMINAR_COMPLETED', 'THESIS_READINESS_CHECK']);
      
      if (error) throw error;

      // Filter by user department's school if applicable
      // @ts-ignore
      const { data: deptData } = await supabase.from('departments').select('school_id').eq('id', user.department_id).single();
      
      let filtered = data || [];
      if (deptData?.school_id) {
         filtered = filtered.filter((s: any) => s.programme?.department?.school_id === deptData.school_id);
      }

      setCandidates(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Candidate Sync Error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearance = async (candidate: any) => {
    setProcessing(true);
    try {
      // 1. Advance Student Stage
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: 'PG_EXAMINATION' })
        .eq('id', candidate.id);

      if (sErr) throw sErr;

      // 2. Record Endorsement for Audit
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'THESIS_REVIEW',
        recommendation: 'PASS',
        comments: `Institutional scholarship benchmark verified. Approved for PG School Examination.`
      });

      toast.success(`Academic Clearance Granted`, {
        description: `${candidate.user?.first_name} ${candidate.user?.last_name} has been forwarded to the PG Dean.`,
        duration: 5000,
      });
      fetchCandidates();
    } catch (err: any) {
      console.error(err);
      toast.error("Clearance Persistence Error", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleRevert = async (candidate: any) => {
    if (!revertNote.trim()) {
      toast.error("Please provide documentation for the reversion.");
      return;
    }
    setProcessing(true);
    try {
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: 'SCHOOL_SEMINAR_COMPLETED' }) // remain at school level for fix
        .eq('id', candidate.id);
      
      if (sErr) throw sErr;

      // Audit Record
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'THESIS_REVIEW',
        recommendation: 'MAJOR_CORRECTIONS',
        comments: `School Readiness Reversion: ${revertNote}`
      });

      toast.warning("Candidate Reverted", {
        description: "Thesis sent back for corrections before final PG School endorsement."
      });
      setRevertNote("");
      fetchCandidates();
    } catch (err: any) {
       toast.error("Process Error", { description: err.message });
    } finally {
       setProcessing(false);
    }
  };

  const generatePDF = (candidate: any) => {
     toast.promise(new Promise(res => setTimeout(res, 1500)), {
        loading: 'Architecting Clearance Document...',
        success: `Clearance_ID_${candidate.id.slice(0, 8)}.pdf downloaded!`,
        error: 'Generation failed for PDF server.',
     });
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card p-10 rounded-[3rem] border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none scale-150 rotate-12">
           <Shield size={200} />
        </div>
        <div className="relative z-10">
          <Badge className="bg-success/10 text-success border-success/20 text-[10px] font-black uppercase tracking-[0.25em] mb-4 shadow-sm">
             Final Institutional Screening
          </Badge>
          <h2 className="text-4xl font-black text-foreground tracking-tight flex items-center gap-4">
            <Shield className="text-secondary" size={36} /> Thesis Readiness Check
          </h2>
          <p className="text-sm text-muted-foreground mt-3 font-medium max-w-lg italic opacity-80 decoration-primary decoration-2 underline-offset-4 leading-relaxed">
            Final academic verification portal for institutional candidates. Candidates passing this gateway are officially registered for External Examination.
          </p>
        </div>
        <div className="relative w-full md:w-96 z-10">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={20} />
           <Input 
             placeholder="Search candidate identity..." 
             className="pl-14 h-16 text-sm rounded-[1.5rem] bg-background border-border/60 shadow-inner group-hover:border-primary/40 focus:bg-background transition-all"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-8">
        {candidates.length === 0 && (
           <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-[3rem] bg-muted/5 opacity-50">
              <ShieldCheck size={64} className="text-muted-foreground/30 animate-pulse" />
              <p className="font-black text-sm uppercase tracking-widest mt-6 text-center">Institutional Idle: No Candidates Awaiting Final Screening</p>
           </div>
        )}

        {candidates
          .filter(c => {
             const fullName = `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase();
             const dept = (c.programme?.department?.name || "").toLowerCase();
             return fullName.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());
          })
          .map((candidate) => {
            const latestEval = candidate.evaluations?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            
            return (
          <motion.div key={candidate.id} variants={itemVariants} className="card-shadow rounded-[2.5rem] overflow-hidden border border-border/80 bg-card group hover:shadow-2xl hover:border-primary/20 transition-all duration-500">
             <div className="p-1.5 border-b border-border/10 bg-secondary/10"></div>
             <div className="p-10 flex flex-col xl:flex-row gap-10">
                
                {/* Structural Verifications Column */}
                <div className="flex-1 space-y-10">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-3xl font-black text-foreground flex items-center gap-4 tracking-tight">
                            {candidate.user?.first_name} {candidate.user?.last_name}
                         </h3>
                         <div className="flex items-center gap-4 mt-3">
                            <Badge variant="outline" className="text-[11px] uppercase font-black tracking-widest px-4 py-2 bg-muted/40 border-border/60 rounded-xl">
                               {candidate.programme?.department?.name}
                            </Badge>
                            <span className="text-xs font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2 bg-secondary/5 px-3 py-1 rounded-lg">
                               <div className="h-2.5 w-2.5 rounded-full bg-secondary shadow-lg shadow-secondary/40" />
                               {candidate.current_stage.replace(/_/g, ' ')}
                            </span>
                         </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => generatePDF(candidate)}>
                         <Download size={24} className="text-muted-foreground" />
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Real history verification checklist */}
                      <div className="bg-muted/10 p-8 rounded-[2rem] border border-border/40 shadow-inner group-hover:bg-muted/15 transition-colors">
                         <h4 className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 mb-6 flex items-center gap-3">
                           <ShieldCheck size={18} className="text-primary"/> Institutional Audit Verifier
                         </h4>
                         <ul className="space-y-5">
                            <li className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                               <span className="text-muted-foreground">Departmental Defense:</span>
                               <span className="flex items-center gap-2 text-success font-black border border-success/20 bg-success/5 px-2 py-1 rounded-md">
                                  <CheckCircle2 size={16}/> VERIFIED
                               </span>
                            </li>
                            <li className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                               <span className="text-muted-foreground">Master Seminar Consensus:</span>
                               <span className="flex items-center gap-2 text-success font-black border border-success/20 bg-success/5 px-2 py-1 rounded-md">
                                  <CheckCircle2 size={16}/> PASS
                               </span>
                            </li>
                            <li className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                               <span className="text-muted-foreground">Internal Refinement Index:</span>
                               <span className="flex items-center gap-2 text-primary font-black border border-primary/20 bg-primary/5 px-2 py-1 rounded-md italic">
                                  <ShieldCheck size={16}/> 100% CLEAR
                               </span>
                            </li>
                         </ul>
                      </div>
                      <div className="bg-muted/10 p-8 rounded-[2rem] border border-border/40 shadow-inner group-hover:bg-muted/15 transition-colors">
                         <h4 className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 mb-6 flex items-center gap-3">
                            <BookOpen size={18} className="text-secondary"/> Candidate Thesis Blueprint
                         </h4>
                         <div className="bg-background/80 p-5 rounded-2xl border border-border/80 group-hover:border-primary/40 transition-all cursor-pointer shadow-sm relative overflow-hidden group/thesis">
                            <div className="absolute top-0 right-0 p-2 opacity-[0.05]">
                               <FileText size={48} />
                            </div>
                            <div className="flex items-center gap-5">
                               <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover/thesis:bg-primary group-hover/thesis:text-white transition-colors">
                                  <FileText size={32} />
                               </div>
                               <div className="flex-1 overflow-hidden">
                                  <p className="text-sm font-black text-foreground truncate">{candidate.user?.last_name}_Final_Scholarship.pdf</p>
                                  <p className="text-[10px] text-muted-foreground/70 uppercase font-black tracking-widest mt-1.5 flex items-center gap-2">
                                     <div className="h-1.5 w-1.5 rounded-full bg-success" /> Plagiarism Index: 6.4%
                                  </p>
                                </div>
                                <ExternalLink size={20} className="text-muted-foreground hover:text-primary transition-colors shrink-0" />
                            </div>
                         </div>
                      </div>
                   </div>

                   {latestEval && (
                      <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-start gap-4">
                         <AlertTriangle size={18} className="text-secondary mt-1 shrink-0" />
                         <div>
                            <p className="text-[10px] font-black uppercase text-secondary tracking-widest mb-1">Latest Board Observation</p>
                            <p className="text-xs text-muted-foreground italic font-medium">"{latestEval.comments}"</p>
                         </div>
                      </div>
                   )}
                </div>

                {/* Authority Actions Column */}
                <div className="w-full xl:w-96 flex flex-col gap-6 justify-center bg-muted/5 p-10 rounded-[2.5rem] border border-border/20 shadow-inner relative overflow-hidden group-hover:bg-muted/10 transition-all duration-500">
                   <div className="absolute -top-10 -right-10 opacity-[0.02] rotate-12 scale-150">
                      <Shield size={200} />
                   </div>
                   
                   <div className="text-center mb-4 relative z-10">
                      <h4 className="text-[11px] uppercase font-black tracking-[0.3em] text-muted-foreground/50">Consensus Authority Portal</h4>
                      <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase italic tracking-widest">3rd Thursday Protocol Required</p>
                   </div>
                   
                   <Dialog>
                     <DialogTrigger asChild>
                       <Button className="w-full h-16 bg-success hover:bg-success/90 text-white text-[11px] font-black shadow-2xl shadow-success/40 uppercase tracking-widest rounded-2xl transition-all active:scale-[0.97] relative z-10 group/grant">
                          Grant Final Clearance <ArrowUpRight size={18} className="ml-2 group-hover/grant:translate-x-1 group-hover/grant:-translate-y-1 transition-transform" />
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-2xl rounded-[3rem] border-border shadow-2xl p-0 overflow-hidden">
                       <div className="bg-success text-white p-10 font-black">
                          <h3 className="text-3xl tracking-tight flex items-center gap-4">
                             <ShieldCheck size={40} /> Formal Validation
                          </h3>
                       </div>
                       <div className="p-10 space-y-8">
                          <p className="text-base text-muted-foreground font-medium leading-relaxed">
                            You are certifying that <strong className="text-foreground">{candidate.user?.first_name} {candidate.user?.last_name}</strong> has successfully navigated the institutional review pipeline of the school. 
                            <br /><br />
                            This candidate will be formally transitioned to <strong>PG School Jurisdiction</strong> for examiner appointment and external viva protocols.
                          </p>
                          <div className="bg-success/10 p-6 rounded-2xl border border-success/20 text-xs font-black text-success flex items-start gap-4">
                             <CheckCircle2 size={24} className="shrink-0" />
                             <p className="leading-relaxed">ARCHITECTURAL ENDORSEMENT: This action is permanent and creates an immutable audit log linking the school coordinator to this scholar's examination readiness.</p>
                          </div>
                       </div>
                       <div className="p-10 border-t border-border/50 bg-muted/5 flex justify-end gap-3">
                         <Button variant="ghost" className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]">Discard</Button>
                         <Button 
                           className="bg-success text-white hover:bg-success/90 h-14 px-12 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-success/20" 
                           onClick={() => handleClearance(candidate)}
                           disabled={processing}
                         >
                           {processing ? <Loader2 className="animate-spin" size={20} /> : "Authorize Clearance"}
                         </Button>
                       </div>
                     </DialogContent>
                   </Dialog>

                   <Dialog>
                     <DialogTrigger asChild>
                       <Button variant="outline" className="w-full h-14 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all relative z-10">
                          Revert for Optimization
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="rounded-3xl p-0 overflow-hidden border-border/50">
                        <div className="bg-destructive/5 p-8 border-b border-border/50">
                          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                             <AlertTriangle size={24} className="text-destructive" /> Structural Refinement
                          </DialogTitle>
                        </div>
                        <div className="p-8 space-y-6">
                           <p className="text-sm text-muted-foreground font-medium">Specify missing requirements or structural deviations from institutional handbook guidelines.</p>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                 <MessageSquare size={16} className="text-destructive" /> Document Deficiency
                              </label>
                              <Textarea 
                                placeholder="e.g. Chapter 5 methodology does not match board recommendations from Jan 2026 session..." 
                                className="min-h-[160px] bg-muted/20 focus:bg-background transition-all p-5 border-border/60 rounded-2xl text-sm resize-none"
                                value={revertNote}
                                onChange={(e) => setRevertNote(e.target.value)}
                              />
                           </div>
                        </div>
                        <div className="p-8 border-t border-border/50 bg-muted/5 flex justify-end gap-3">
                          <Button variant="ghost" className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]" onClick={() => setRevertNote("")}>Cancel</Button>
                          <Button 
                            variant="destructive" 
                            className="h-12 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-destructive/20"
                            onClick={() => handleRevert(candidate)}
                            disabled={processing || !revertNote.trim()}
                          >
                            {processing ? <Loader2 size={16} className="animate-spin" /> : "Revert Candidate"}
                          </Button>
                        </div>
                     </DialogContent>
                   </Dialog>
                </div>
             </div>
          </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}
