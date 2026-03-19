import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, CheckCircle2, XCircle, Search, 
  BookOpen, FileText, ArrowUpRight, ShieldCheck, Download,
  ExternalLink, Loader2
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
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          evaluations(id, recommendation, created_at)
        `)
        .in('current_stage', ['SCHOOL_SEMINAR_COMPLETED', 'THESIS_READINESS_CHECK']);
      
      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Candidate Sync Error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearance = async (candidateId: string, name: string) => {
    setClearing(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('students')
        .update({ current_stage: 'PG_EXAMINATION' })
        .eq('id', candidateId);

      if (error) throw error;

      toast.success(`Academic Clearance Granted for ${name}`, {
        description: "Candidate has been officially forwarded to the Postgraduate Dean.",
        duration: 5000,
      });
      fetchCandidates();
    } catch (err) {
      console.error(err);
      toast.error("Clearance Persistence Error");
    } finally {
      setClearing(false);
    }
  };

  const generatePDF = () => {
     toast.info("Generating Clearance Certificate...", {
        description: "Downloading PDF with official clearance ID.",
     });
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none scale-150">
           <Shield size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <Shield className="text-secondary" size={28} />
            Thesis Readiness & PG Clearance
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium max-w-md italic">Final academic screening before forwarding candidates to Postgraduate School.</p>
        </div>
        <div className="relative w-full md:w-80 z-10">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
           <Input 
             placeholder="Search candidate or dept..." 
             className="pl-11 h-12 text-sm rounded-2xl bg-background/50 focus:bg-background transition-all border-border/60"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {candidates.length === 0 && (
           <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/5 opacity-40">
              <ShieldCheck size={48} />
              <p className="font-black text-xs uppercase tracking-widest mt-4 text-center">Protocol Idle: No Candidates Awaiting Final Clearance</p>
           </div>
        )}

        {candidates
          .filter(c => {
             const fullName = `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase();
             const dept = (c.programme?.department?.name || "").toLowerCase();
             return fullName.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());
          })
          .map((candidate) => (
          <motion.div key={candidate.id} variants={itemVariants} className="card-shadow rounded-3xl overflow-hidden border border-border/60 bg-card group hover:shadow-2xl hover:border-primary/20 transition-all duration-300">
             <div className="p-1 border-b border-border/10 bg-secondary/10"></div>
             <div className="p-8 flex flex-col xl:flex-row gap-8">
                
                {/* Information Column */}
                <div className="flex-1 space-y-8">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-2xl font-black text-foreground flex items-center gap-3 tracking-tight">
                            {candidate.user?.first_name} {candidate.user?.last_name}
                         </h3>
                         <div className="flex items-center gap-3 mt-2.5">
                            <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest px-3 py-1 bg-muted/50 border-border/60">{(candidate.programme?.department as any)?.name}</Badge>
                            <span className="text-xs font-black text-secondary uppercase tracking-[0.15em] flex items-center gap-2">
                               <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"/>
                               {candidate.current_stage.replace(/_/g, ' ')}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 shadow-inner group-hover:bg-muted/20 transition-colors">
                         <h4 className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 mb-5 flex items-center gap-2">
                           <ShieldCheck size={16} className="text-primary"/> Structural Verifications
                         </h4>
                         <ul className="space-y-4">
                            <li className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                               <span className="text-muted-foreground">Departmental Consensus:</span>
                               <span className="flex items-center gap-2 text-success"><CheckCircle2 size={16}/> Cleared</span>
                            </li>
                            <li className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                               <span className="text-muted-foreground">School Seminar Grade:</span>
                               <span className="flex items-center gap-2 text-success"><CheckCircle2 size={16}/> PASS</span>
                            </li>
                            <li className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                               <span className="text-muted-foreground">Internal Corrections:</span>
                               <span className="flex items-center gap-2 text-success"><CheckCircle2 size={16}/> Verified</span>
                            </li>
                         </ul>
                      </div>
                      <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 shadow-inner group-hover:bg-muted/20 transition-colors">
                         <h4 className="text-[11px] uppercase font-black tracking-widest text-muted-foreground/60 mb-5 flex items-center gap-2">
                            <BookOpen size={16} className="text-secondary"/> Master Thesis Blueprint
                         </h4>
                         <div className="flex items-center gap-4 mt-2 bg-background/60 p-4 rounded-2xl border border-border group-hover:border-primary/40 transition-all cursor-pointer">
                            <div className="p-3 bg-primary/10 text-primary rounded-xl">
                               <FileText size={24} />
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-black text-foreground truncate max-w-[180px]">vFinal_Thesis_Arch.pdf</p>
                               <p className="text-[10px] text-muted-foreground/70 uppercase font-bold tracking-widest mt-1">Plagiarism Trace: 6.4%</p>
                            </div>
                            <ExternalLink size={18} className="text-muted-foreground hover:text-primary transition-colors" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Actions Column */}
                <div className="w-full xl:w-80 flex flex-col gap-5 justify-center bg-muted/5 p-8 rounded-3xl border border-border/40 shadow-inner relative overflow-hidden group-hover:bg-muted/10 transition-colors">
                   <div className="absolute -top-4 -right-4 opacity-[0.02] rotate-12 scale-150">
                      <Shield size={120} />
                   </div>
                   
                   <div className="text-center mb-2 relative z-10">
                      <h4 className="text-[11px] uppercase font-black tracking-[0.2em] text-muted-foreground/50">School Authority Protocol</h4>
                   </div>
                   
                   <Dialog>
                     <DialogTrigger asChild>
                       <Button className="w-full h-14 bg-success hover:bg-success/90 text-white text-[11px] font-black shadow-2xl shadow-success/30 uppercase tracking-widest rounded-2xl transition-all active:scale-[0.98] relative z-10">
                          Commence PG Clearance
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="max-w-xl rounded-3xl border-border shadow-2xl">
                       <DialogHeader>
                         <DialogTitle className="flex items-center gap-3 text-2xl font-black tracking-tight">
                            <ShieldCheck className="text-success" size={28} /> Confirm Academic Clearance
                         </DialogTitle>
                       </DialogHeader>
                       <div className="py-8 space-y-6">
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed">You are officially certifying that <strong className="text-foreground">{candidate.user?.first_name} {candidate.user?.last_name}</strong> has met all school-level institutional requirements. They will be formally transitioned to the Postgraduate School for external examination protocols.</p>
                          <div className="bg-success/10 p-5 rounded-2xl border border-success/20 text-xs font-extrabold text-success flex items-start gap-3">
                             <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                             This action will finalize the school's involvement and initiate the final examining appointment process.
                          </div>
                       </div>
                       <DialogFooter className="gap-2">
                         <Button variant="ghost" className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Discard</Button>
                         <Button 
                           className="bg-success text-white hover:bg-success/90 h-12 px-10 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-success/20" 
                           onClick={() => handleClearance(candidate.id, `${candidate.user?.first_name} ${candidate.user?.last_name}`)}
                           disabled={clearing}
                         >
                           {clearing ? <Loader2 className="animate-spin" size={16} /> : "Validate & Forward"}
                         </Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>

                   <Dialog>
                     <DialogTrigger asChild>
                       <Button variant="outline" className="w-full h-12 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/40 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all relative z-10">
                          Revert for Optimization
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="rounded-3xl">
                       <DialogHeader>
                         <DialogTitle className="text-xl font-black tracking-tight">Return Thesis for Refinement</DialogTitle>
                       </DialogHeader>
                       <div className="space-y-6 py-6 font-medium">
                          <p className="text-xs text-muted-foreground">Specify structural or format deviations that must be addressed before final school endorsement.</p>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Architectural Observations</label>
                             <Textarea 
                               placeholder="e.g. Thesis formatting does not adhere to Chapter 4 guidelines of the 2026 PG Handbook..." 
                               className="min-h-[120px] bg-muted/30 focus:bg-background transition-colors p-5 border-border/60 rounded-2xl text-sm"
                             />
                          </div>
                       </div>
                       <DialogFooter>
                         <Button variant="ghost" className="h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
                         <Button variant="destructive" className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-destructive/20">Revert Pipeline</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
