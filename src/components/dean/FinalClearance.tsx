import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Search, Loader2, GraduationCap, CheckCircle2, 
  Trophy, Download, Calendar, Star, ShieldCheck, Zap, 
  Globe, Briefcase, FileText, ChevronRight, Filter, ExternalLink
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

export function FinalClearance() {
  const { user } = useRole();
  const [graduates, setGraduates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState(false);
  const [signature, setSignature] = useState("");

  useEffect(() => { fetchGraduationPipeline(); }, []);

  const fetchGraduationPipeline = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name, school:school_id(name))),
          evaluations(id, recommendation, evaluation_type, created_at)
        `)
        .in('current_stage', ['VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setGraduates(data || []);
    } catch (err: any) {
      toast.error("Pipeline Sync Failure", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleClearance = async (candidate: any) => {
    if (!signature.trim()) {
      toast.error("Institutional Seal Required", { description: "You must provide a digital signature to authorize graduation." });
      return;
    }
    setProcessing(true);
    try {
      // 1. Mark as COMPLETED
      // @ts-ignore
      const { error: sErr } = await supabase.from('students').update({ current_stage: 'COMPLETED' }).eq('id', candidate.id);
      if (sErr) throw sErr;

      // 2. Record Final Clearance Node
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: 'PASS',
        comments: `INSTITUTIONAL_CLEARANCE: Graduation Authorized by PG Dean. Electronic Signature: ${signature}`
      });

      toast.success("🎓 Scholastic Exit Authorized!", {
        description: `${candidate.user?.first_name} has been officially cleared for graduation.`,
        duration: 8000
      });
      setSignature("");
      fetchGraduationPipeline();
    } catch (err: any) {
      toast.error("Clearance Protocol Failure", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = graduates.filter(g =>
    `${g.user?.first_name} ${g.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
     <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 max-w-7xl mx-auto pb-24">
      
      {/* Search & Graduation Header */}
      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-success/10 via-transparent to-secondary/10 pointer-events-none" />
         <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <GraduationCap size={300} />
         </div>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-foreground flex items-center gap-4 italic uppercase tracking-tighter">
                  <Trophy className="text-secondary" size={32}/> Institutional <span className="text-secondary italic">Clearance</span>
               </h2>
               <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                  <Star size={14} className="text-secondary animate-pulse"/> Final Graduation Authorization Protocol
               </p>
            </div>
            <div className="relative w-full md:w-[400px] group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
               <Input 
                  placeholder="Identify Scholastic Graduate..." 
                  className="h-16 pl-14 rounded-[28px] bg-background border-2 focus:border-secondary transition-all font-bold placeholder:italic shadow-inner"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </motion.div>

      {/* Graduation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Pipeline Threshold", count: graduates.filter(g => g.current_stage !== 'COMPLETED').length, color: "text-primary", bg: "bg-primary/5", icon: Zap },
          { label: "Cleared For Alumni", count: graduates.filter(g => g.current_stage === 'COMPLETED').length, color: "text-success", bg: "bg-success/5", icon: GraduationCap },
          { label: "Institutional Rate", count: "98.2%", color: "text-secondary", bg: "bg-secondary/5", icon: TrendingUp },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className={`p-8 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg shadow-black/10 flex items-center gap-6`}>
             <div className={`h-16 w-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-card/20 to-card/10 ${stat.color} shadow-2xl`}>
                <stat.icon size={28} />
             </div>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
               <p className={`text-4xl font-black mt-2 tracking-tighter tabular-nums ${stat.color}`}>{stat.count}</p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Candidate Queue */}
      <div className="grid grid-cols-1 gap-8">
        {filtered.length === 0 ? (
           <div className="py-32 text-center border-4 border-dashed border-border rounded-[48px] bg-muted/5 flex flex-col items-center gap-8 opacity-30">
              <Sparkles size={64} />
              <p className="font-black text-xs uppercase tracking-widest italic">Graduation Registry Idle</p>
           </div>
        ) : (
          filtered.map(candidate => {
            const isCompleted = candidate.current_stage === 'COMPLETED';
            return (
              <motion.div key={candidate.id} variants={itemVariants} className={`card-shadow bg-card rounded-[40px] border-2 shadow-2xl p-10 flex flex-col xl:flex-row items-center justify-between gap-10 group transition-all relative overflow-hidden ${isCompleted ? 'border-success/30 ring-8 ring-success/5' : 'border-border/60'}`}>
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   <Trophy size={200} />
                </div>
                
                <div className="flex-1 space-y-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-black flex items-center justify-center text-secondary font-black text-3xl shadow-2xl relative overflow-hidden">
                       {candidate.user?.first_name[0]}{candidate.user?.last_name[0]}
                       {isCompleted && <div className="absolute inset-0 bg-success/20 flex items-center justify-center"><CheckCircle2 className="text-success" size={40}/></div>}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter italic group-hover:text-secondary transition-colors">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                      <div className="flex gap-2">
                         <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border-none shadow-xl ${isCompleted ? 'bg-success text-white' : 'bg-status-warning/10 text-status-warning'}`}>
                            {isCompleted ? "Protocol Cleared" : "Awaiting Exit"}
                         </Badge>
                         <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border-border bg-muted/30">{candidate.registration_number}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-muted/10 p-6 rounded-[32px] border border-border/50 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2"><Globe size={14}/> Programme Mapping</p>
                        <p className="text-sm font-bold">{candidate.programme?.name}</p>
                        <p className="text-[9px] font-black text-secondary uppercase italic">{(candidate.programme?.department as any)?.name} • {(candidate.programme?.department as any)?.school?.name}</p>
                     </div>
                     <div className="bg-muted/10 p-6 rounded-[32px] border border-border/50 space-y-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 flex items-center gap-2"><ShieldCheck size={14}/> Thesis Validation</p>
                        <p className="text-sm font-bold italic line-clamp-1">"{candidate.research_title || 'Institutional Mapping Pending'}"</p>
                        <p className="text-[9px] font-black text-success uppercase italic">All Scholastic Milestones Verified</p>
                     </div>
                  </div>
                </div>

                <div className="shrink-0 w-full xl:w-72 space-y-4 relative z-10">
                   {isCompleted ? (
                      <div className="space-y-4">
                         <Button className="w-full h-16 rounded-[24px] bg-black text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl gap-3">
                            <Download size={18} /> Export Certificate
                         </Button>
                         <Button variant="outline" className="w-full h-12 rounded-[20px] text-[10px] font-black uppercase tracking-widest border-2">
                            View Alumni Portal
                         </Button>
                      </div>
                   ) : (
                      <Dialog>
                         <DialogTrigger asChild>
                            <Button className="w-full h-16 bg-gradient-to-r from-secondary to-primary text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[24px] shadow-2xl transition-all active:scale-[0.98] gap-4">
                               <Sparkles size={20} /> Clear Candidate
                            </Button>
                         </DialogTrigger>
                         <DialogContent className="rounded-[40px] p-10 bg-card border-none shadow-4xl max-w-xl">
                            <DialogHeader className="space-y-4">
                               <DialogTitle className="text-2xl font-black text-foreground uppercase italic tracking-tighter flex items-center gap-4">
                                  <GraduationCap className="text-secondary" size={28}/> Graduation <span className="text-secondary italic">Clearance</span>
                               </DialogTitle>
                               <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">System-wide authorization for {candidate.user?.first_name} to exit the scholastic pipeline as an official Almuni.</p>
                            </DialogHeader>
                            <div className="py-10 space-y-8">
                               <div className="bg-success/5 p-8 rounded-[32px] border-2 border-success/20 space-y-4">
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-success">Institutional Checkpoints</h4>
                                  <div className="space-y-3">
                                     {['Seminar Phase', 'Board Review', 'External Exam', 'Financial Clearance'].map((check, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm font-black text-foreground/80">
                                           <CheckCircle2 size={16} className="text-success fill-success/10" /> {check}
                                        </div>
                                     ))}
                                  </div>
                               </div>
                               <div className="space-y-3">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                     <FileText size={14} className="text-secondary"/> Electronic Identity Seal
                                  </label>
                                  <Input 
                                     placeholder="Type Identity Code (e.g. DEAN-RNG-01)" 
                                     value={signature}
                                     onChange={(e) => setSignature(e.target.value)}
                                     className="h-16 rounded-[24px] bg-muted/10 border-2 border-border/50 px-6 font-bold text-sm focus:border-secondary transition-all"
                                  />
                               </div>
                            </div>
                            <DialogFooter className="flex gap-4">
                               <Button variant="ghost" className="h-16 flex-1 rounded-[24px] text-[10px] font-black uppercase tracking-widest" onClick={() => setSignature("")}>Reset Session</Button>
                               <Button
                                 className="h-16 flex-[2] bg-gradient-to-r from-secondary to-primary text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-[24px] shadow-2xl shadow-secondary/20 gap-4"
                                 disabled={processing || !signature}
                                 onClick={() => handleClearance(candidate)}
                               >
                                 {processing ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={20}/> Authorize Exit</>}
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

function TrendingUp({ size, className }: { size: number, className?: string }) {
    return <Zap size={size} className={className} />
}
