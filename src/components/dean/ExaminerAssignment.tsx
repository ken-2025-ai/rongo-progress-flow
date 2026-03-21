import { motion, AnimatePresence } from "framer-motion";
import { 
  UserCheck, Search, Loader2, Plus, Mail, Phone, BookOpen, 
  Trash2, ShieldCheck, Zap, Globe, Star, Users, Briefcase, 
  CheckCircle2, AlertTriangle, GraduationCap, ChevronRight, Filter
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

const EXAMINER_TYPES = [
  { id: 'INTERNAL', label: 'Internal Examiner', color: 'bg-primary/10 text-primary border-primary/20', icon: ShieldCheck },
  { id: 'EXTERNAL', label: 'External Examiner', color: 'bg-secondary/10 text-secondary border-secondary/20', icon: Globe },
  { id: 'INDEPENDENT', label: 'Independent Panelist', color: 'bg-status-warning/10 text-status-warning border-status-warning/20', icon: Star },
];

export function ExaminerAssignment() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignmentType, setAssignmentType] = useState('INTERNAL');

  useEffect(() => { fetchExpertMatrix(); }, []);

  const fetchExpertMatrix = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students locked in examination zones
      // @ts-ignore
      const { data: sData, error: sErr } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          evaluations(evaluator_id, evaluation_type, recommendation)
        `)
        .in('current_stage', ['PG_EXAMINATION', 'AWAITING_EXAMINER_REPORT', 'VIVA_SCHEDULED']);

      if (sErr) throw sErr;

      // 2. Fetch Institutional Examiners (Staff with EXAMINER Role)
      // @ts-ignore
      const { data: exData, error: exErr } = await supabase
        .from('users')
        .select('*')
        .in('role', ['EXAMINER', 'SUPERVISOR', 'PG_DEAN']);

      if (exErr) throw exErr;

      setCandidates(sData || []);
      setExaminers(exData || []);
    } catch (err: any) {
      toast.error("Expert Matrix Sync Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignment = async (exId: string, exName: string) => {
    if (!selectedCandidate) return;
    setAssigning(true);
    try {
      const examinerType = assignmentType === 'INDEPENDENT' ? 'EXTERNAL' : assignmentType;
      const { error: assignErr } = await supabase.from('examiner_assignments').insert({
        student_id: selectedCandidate.id,
        examiner_id: exId,
        examiner_type: examinerType,
        assigned_by: user?.id,
      });
      if (assignErr) throw assignErr;

      const { error } = await supabase.from('evaluations').insert({
        student_id: selectedCandidate.id,
        evaluator_id: exId,
        evaluation_type: 'THESIS_REVIEW',
        recommendation: 'PENDING',
        comments: `${assignmentType} assigned by PG Dean`,
      });
      if (error) throw error;

      toast.success("Examiner assigned", {
        description: `${exName} has been officially locked as ${assignmentType} for ${selectedCandidate.user?.first_name}.`
      });
      setSelectedCandidate(null);
      fetchExpertMatrix();
    } catch (err: any) {
      toast.error("Assignment Protocol Failed", { description: err.message });
    } finally {
      setAssigning(false);
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
      
      {/* Search & Intelligence Header */}
      <motion.div variants={itemVariants} className="bg-card/40 backdrop-blur-xl p-10 rounded-[40px] border border-border shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-2">
               <h2 className="text-3xl font-black text-foreground flex items-center gap-4 italic uppercase tracking-tighter">
                  <UserCheck className="text-secondary" size={32}/> Expert <span className="text-secondary italic">Assignment</span>
               </h2>
               <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-3">
                  <Zap size={14} className="text-primary animate-pulse"/> Scholastic Witness Matrix Provisioning
               </p>
            </div>
            <div className="relative w-full md:w-[400px] group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
               <Input 
                  placeholder="Query Examination Nodes..." 
                  className="h-16 pl-14 rounded-[28px] bg-background border-2 focus:border-secondary transition-all font-bold placeholder:italic shadow-inner"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </motion.div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 gap-8">
        {filtered.length === 0 ? (
           <div className="py-32 text-center border-4 border-dashed border-border rounded-[48px] bg-muted/5 flex flex-col items-center gap-8 opacity-30">
              <Users size={64} />
              <p className="font-black text-xs uppercase tracking-widest italic">Examination Registry Idle</p>
           </div>
        ) : (
          filtered.map(candidate => (
            <motion.div key={candidate.id} variants={itemVariants} className="card-shadow bg-card rounded-[40px] border border-border/60 shadow-2xl overflow-hidden group hover:border-primary/40 transition-all p-10 flex flex-col lg:flex-row items-center justify-between gap-10">
               
               {/* Identity Node */}
               <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-primary font-black uppercase text-xl shadow-2xl">
                        {candidate.user?.first_name[0]}{candidate.user?.last_name[0]}
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter italic group-hover:text-primary transition-colors">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border-primary/20 text-primary">{candidate.registration_number}</Badge>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm font-bold text-secondary italic leading-relaxed">
                     <BookOpen size={18} className="shrink-0" />
                     "{candidate.research_title || 'Institutional Research Mapping Pending'}"
                  </div>

                  <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/20 p-4 rounded-2xl">
                     <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-primary"/> {candidate.programme?.name}
                     </div>
                     <span className="opacity-30">|</span>
                     <div className="flex items-center gap-2">
                        <Globe size={14} className="text-secondary"/> {candidate.programme?.department?.name}
                     </div>
                  </div>
               </div>

               {/* Assignment Payload */}
               <div className="shrink-0 w-full lg:w-72 flex flex-col gap-4">
                  <div className="space-y-3">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground text-center">Current Assignees: {candidate.evaluations?.length || 0}</p>
                     <div className="flex justify-center -space-x-3">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="h-10 w-10 rounded-full border-4 border-card bg-muted flex items-center justify-center text-[10px] font-black overflow-hidden ring-2 ring-primary/5">
                              {candidate.evaluations?.[i-1] ? <div className="bg-primary h-full w-full flex items-center justify-center text-white"><CheckCircle2 size={16}/></div> : <Users size={16} className="opacity-30"/>}
                           </div>
                        ))}
                     </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedCandidate(candidate)}
                        className="h-16 w-full rounded-[24px] bg-black hover:bg-secondary text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl transition-all active:scale-[0.98] gap-3"
                      >
                         <Plus size={20} /> Provision Expert
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[40px] p-10 bg-card border-none shadow-4xl max-w-2xl">
                       <DialogHeader className="space-y-4">
                          <DialogTitle className="text-2xl font-black text-foreground uppercase italic tracking-tighter flex items-center gap-4">
                             <UserCheck className="text-secondary" size={28}/> Expert <span className="text-secondary italic">Provisioning</span>
                          </DialogTitle>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Target Node: {candidate.user?.first_name} {candidate.user?.last_name}</p>
                       </DialogHeader>

                       <div className="py-8 space-y-10">
                          {/* Assignment Type Selector */}
                          <div className="grid grid-cols-3 gap-3">
                             {EXAMINER_TYPES.map(type => (
                                <Button
                                   key={type.id}
                                   variant={assignmentType === type.id ? 'default' : 'outline'}
                                   onClick={() => setAssignmentType(type.id)}
                                   className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col gap-1 transition-all ${
                                      assignmentType === type.id ? 'bg-secondary text-white shadow-xl' : 'border-border/50 hover:bg-muted'
                                   }`}
                                >
                                   <type.icon size={16} />
                                   {type.id}
                                </Button>
                             ))}
                          </div>

                          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                             {examiners.length === 0 ? (
                                <div className="text-center py-20 opacity-30 italic font-black text-[9px] uppercase tracking-widest">No Registered Experts Detected</div>
                             ) : (
                                examiners.map(ex => (
                                   <div key={ex.id} className="group p-6 rounded-[28px] border-2 border-border/50 hover:border-secondary/40 bg-muted/5 transition-all flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-4">
                                         <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center text-secondary font-black text-sm uppercase">
                                            {ex.first_name[0]}{ex.last_name[0]}
                                         </div>
                                         <div className="space-y-0.5">
                                            <p className="font-black text-foreground text-sm uppercase italic tracking-tight">{ex.first_name} {ex.last_name}</p>
                                            <p className="text-[9px] font-mono text-muted-foreground uppercase">{ex.email}</p>
                                         </div>
                                      </div>
                                      <Button 
                                         onClick={() => handleAssignment(ex.id, `${ex.first_name} ${ex.last_name}`)}
                                         disabled={assigning}
                                         className="h-12 px-6 rounded-xl bg-secondary text-white font-black uppercase text-[9px] tracking-widest shadow-xl hover:shadow-secondary/20 transition-all active:scale-[0.95]"
                                      >
                                         {assigning ? <Loader2 size={16} className="animate-spin"/> : 'Authorize'}
                                      </Button>
                                   </div>
                                ))
                             )}
                          </div>
                       </div>
                       <DialogFooter>
                          <Button variant="ghost" className="h-14 w-full rounded-2xl text-[10px] font-black uppercase tracking-widest" onClick={() => setSelectedCandidate(null)}>Close Session</Button>
                       </DialogFooter>
                    </DialogContent>
                  </Dialog>
               </div>

            </motion.div>
          ))
        )}
      </div>

    </motion.div>
  );
}
