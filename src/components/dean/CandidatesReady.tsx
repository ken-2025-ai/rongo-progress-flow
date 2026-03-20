import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, ShieldCheck, FileCheck, Loader2, 
  ArrowUpRight, XCircle, Zap, Building, GraduationCap, 
  CheckCircle2, AlertTriangle, PenTool, Globe, ChevronRight, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function CandidatesReady() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => { fetchExaminationQueue(); }, []);

  const fetchExaminationQueue = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data: cData, error: cErr } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          evaluations(id, recommendation, evaluation_type, created_at, comments)
        `)
        .eq('current_stage', 'PG_EXAMINATION')
        .order('updated_at', { ascending: false });

      if (cErr) throw cErr;
      setCandidates(cData || []);
    } catch (err: any) {
      toast.error("Queue Sync Failure", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (candidate: any) => {
    setProcessing(true);
    try {
      // 1. Advance student to VIVA_SCHEDULED
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: 'VIVA_SCHEDULED' })
        .eq('id', candidate.id);
      if (sErr) throw sErr;

      // 2. Formalize Dean's Clearance Evaluation
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: 'PASS',
        comments: 'Institutional Clearance Granted by PG Dean for External Examination & Board Review.'
      });

      toast.success(`${candidate.user?.first_name} Authorized for Examination`, {
        description: "Moving candidate to the Viva Logistics Command."
      });
      fetchExaminationQueue();
    } catch (err: any) {
      toast.error("Authorization Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleReturn = async (candidate: any) => {
    if (!returnNote.trim()) {
      toast.error("Institutional Feedback Required", { description: "Identify the specific deficiencies before reverting the candidate." });
      return;
    }
    setProcessing(true);
    try {
      // 1. Revert to School Level
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: 'THESIS_READINESS_CHECK' })
        .eq('id', candidate.id);
      if (sErr) throw sErr;

      // 2. Log Feedback
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: 'MAJOR_CORRECTIONS',
        comments: `Dean Return Protocol: ${returnNote}`
      });

      toast.error(`${candidate.user?.first_name} Reverted`, {
        description: "Candidate sent back to PG School for logic refinement."
      });
      setReturnNote("");
      setSelectedCandidate(null);
      fetchExaminationQueue();
    } catch (err: any) {
      toast.error("Return Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = candidates.filter(c =>
    `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.programme?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
     <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 max-w-7xl mx-auto pb-24">
      
      {/* Search & Orientation Header */}
      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-foreground flex items-center gap-4 italic uppercase tracking-tighter">
                  <ShieldCheck className="text-primary" size={32}/> Examination <span className="text-primary italic">Gateway</span>
               </h2>
               <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                  <Globe size={14} className="text-secondary"/> Global Candidate Verification Queue
               </p>
            </div>
            <div className="relative w-full md:w-[450px] group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
               <Input 
                  placeholder="Identify Scholastic Node..." 
                  className="h-16 pl-14 rounded-[28px] bg-background border-2 focus:border-primary transition-all font-bold placeholder:italic shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </motion.div>

      {/* Main Queue Terminal */}
      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-[48px] overflow-hidden border border-border shadow-3xl relative">
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
             <ShieldCheck size={300} />
          </div>

          <div className="px-10 py-8 border-b border-border/50 bg-muted/5 flex justify-between items-center relative z-10">
             <h3 className="font-black text-xl uppercase tracking-[0.2em] italic flex items-center gap-3">
                <Filter className="text-primary" size={20}/> Queue <span className="text-primary italic">Nodes</span>
             </h3>
             <Badge className="bg-black text-white border-none px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em]">{filtered.length} READY</Badge>
          </div>

          <div className="overflow-x-auto relative z-10">
             <Table>
                <TableHeader className="bg-muted/10 border-b border-border/40">
                   <TableRow>
                      <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scholastic Identity</TableHead>
                      <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Programme & Mapping</TableHead>
                      <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">School Feedback</TableHead>
                      <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right italic">Strategic Authorization</TableHead>
                   </TableRow>
                </TableHeader>
                <TableBody>
                   {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-32 text-center">
                           <div className="flex flex-col items-center gap-6 opacity-30">
                              <Zap size={64} className="animate-pulse" />
                              <span className="font-black uppercase tracking-widest text-xs">Scholastic Queue Satisfied</span>
                           </div>
                        </TableCell>
                      </TableRow>
                   ) : (
                      filtered.map((candidate) => {
                         const latestEval = candidate.evaluations?.slice(-1)[0];
                         return (
                            <TableRow key={candidate.id} className="group hover:bg-muted/10 transition-all">
                               <TableCell className="px-10 py-8">
                                  <div className="space-y-1">
                                     <span className="block font-black text-lg text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors italic">{candidate.user?.first_name} {candidate.user?.last_name}</span>
                                     <span className="block text-[10px] font-mono font-black text-muted-foreground opacity-60 uppercase tracking-widest">{candidate.registration_number}</span>
                                  </div>
                               </TableCell>
                               <TableCell className="px-10 py-8">
                                  <div className="space-y-1.5 max-w-[300px]">
                                     <p className="font-black text-xs text-secondary italic line-clamp-1">"{candidate.research_title || 'Institutional Research Mapping Pending'}"</p>
                                     <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="bg-muted/50 border-border text-[9px] uppercase font-black px-3 py-1 rounded-full">{candidate.programme?.name}</Badge>
                                        <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[9px] uppercase font-black px-3 py-1 rounded-full">{candidate.programme?.department?.name}</Badge>
                                     </div>
                                  </div>
                               </TableCell>
                               <TableCell className="px-10 py-8 text-center">
                                  <div className="inline-flex items-center gap-3 bg-success/10 text-success px-6 py-2 rounded-full border border-success/20 shadow-xl shadow-success/5 animate-pulse">
                                     <CheckCircle2 size={16} />
                                     <span className="text-[10px] font-black uppercase tracking-widest">VERIFIED</span>
                                  </div>
                               </TableCell>
                               <TableCell className="px-10 py-8 text-right">
                                  <div className="flex justify-end gap-3">
                                     <Dialog>
                                        <DialogTrigger asChild>
                                           <Button 
                                              variant="outline" 
                                              className="h-14 w-14 rounded-2xl border-2 flex items-center justify-center text-destructive hover:bg-destructive/10 active:scale-[0.98] transition-all"
                                              onClick={() => setSelectedCandidate(candidate)}
                                           >
                                              <XCircle size={22} />
                                           </Button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-[40px] p-10 bg-card border-none shadow-3xl max-w-xl">
                                           <DialogHeader className="space-y-4">
                                              <DialogTitle className="text-2xl font-black text-foreground uppercase italic tracking-tighter flex items-center gap-4">
                                                 <AlertTriangle className="text-destructive" size={28}/> Return <span className="text-destructive">Protocol</span>
                                              </DialogTitle>
                                              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Identify architectural deficiencies requiring School-level resolution.</p>
                                           </DialogHeader>
                                           <div className="py-10 space-y-6">
                                              <Textarea 
                                                 placeholder="Identify procedural gaps, documentation inconsistencies, or formatting errors requiring logic refinement..." 
                                                 className="min-h-[160px] bg-muted/10 p-6 rounded-[24px] border-2 focus:border-destructive transition-all text-sm font-medium italic"
                                                 value={returnNote}
                                                 onChange={e => setReturnNote(e.target.value)}
                                              />
                                           </div>
                                           <DialogFooter className="flex gap-4">
                                              <Button variant="ghost" className="h-16 flex-1 rounded-[24px]" onClick={() => setSelectedCandidate(null)}>Cancel</Button>
                                              <Button 
                                                 variant="destructive" 
                                                 className="h-16 flex-[2] rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-destructive/20 gap-3"
                                                 disabled={processing} 
                                                 onClick={() => handleReturn(candidate)}
                                              >
                                                 {processing ? <Loader2 size={18} className="animate-spin"/> : <><Zap size={18}/> Revert Node</>}
                                              </Button>
                                           </DialogFooter>
                                        </DialogContent>
                                     </Dialog>

                                     <Button 
                                        className="h-14 px-10 rounded-2xl bg-black hover:bg-primary text-white text-[10px] font-black uppercase tracking-widest gap-4 transition-all active:scale-[0.96] shadow-2xl hover:shadow-primary/30"
                                        disabled={processing}
                                        onClick={() => handleApprove(candidate)}
                                     >
                                        {processing ? <Loader2 size={18} className="animate-spin"/> : <><ArrowUpRight size={20}/> Authorize Examination</>}
                                     </Button>
                                  </div>
                               </TableCell>
                            </TableRow>
                         );
                      })
                   )}
                </TableBody>
             </Table>
          </div>
      </motion.div>

      {/* Institutional Insight Footer */}
      <motion.div variants={itemVariants} className="p-10 rounded-[40px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col items-center text-center gap-6 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:rotate-45 transition-transform duration-1000">
            <Building size={150} />
         </div>
         <div className="space-y-2 relative z-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Dean's Strategic Protocol</h4>
            <p className="text-xl font-black text-foreground italic uppercase tracking-tighter leading-none mt-2">RIGOROUS CANDIDATE <span className="text-primary italic">VALIDATION</span></p>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-4 max-w-2xl leading-relaxed">Ensure all scholastic milestones (Dept & School Seminars) have been officially synchronized and logged before authorizing external examination nodes.</p>
         </div>
      </motion.div>

    </motion.div>
  );
}
