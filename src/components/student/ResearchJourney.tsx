import { motion } from "framer-motion";
import { GitBranch, CheckCircle2, Circle, Clock, Loader2, AlertCircle, ShieldCheck, Database } from "lucide-react";
import { PipelineRail } from "@/components/PipelineRail";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { STAGE_SEQUENCE } from "@/lib/pipeline";

const JOURNEY_MAP = [
  {
    phase: "Department Level",
    label: "Institutional Onboarding & Proposal",
    stages: ['DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_BOOKED', 'DEPT_SEMINAR_COMPLETED'],
    actions: [
      { id: 'DEPT_SEMINAR_PENDING', text: "Identify & Map Research Proposal" },
      { id: 'DEPT_SEMINAR_BOOKED', text: "Academic Council Presentation Slot" },
      { id: 'DEPT_SEMINAR_COMPLETED', text: "Departmental Board Recommendation" },
    ]
  },
  {
    phase: "School Level",
    label: "Advanced Scholastic Rigor",
    stages: ['SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_BOOKED', 'SCHOOL_SEMINAR_COMPLETED'],
    actions: [
      { id: 'SCHOOL_SEMINAR_PENDING', text: "Institutional Peer Review Request" },
      { id: 'SCHOOL_SEMINAR_BOOKED', text: "School-Wide Seminar Performance" },
      { id: 'SCHOOL_SEMINAR_COMPLETED', text: "Faculty Validation & Clearance" },
    ]
  },
  {
    phase: "Examination Level",
    label: "Global Academic Defense",
    stages: ['THESIS_READINESS_CHECK', 'PG_EXAMINATION', 'AWAITING_EXAMINER_REPORT', 'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'],
    actions: [
      { id: 'THESIS_READINESS_CHECK', text: "Final Thesis Integrity Audit" },
      { id: 'PG_EXAMINATION', text: "PG Dean Examination Approval" },
      { id: 'AWAITING_EXAMINER_REPORT', text: "Internal & External Examiner Review" },
      { id: 'VIVA_SCHEDULED', text: "Viva-Voce Oral Defense" },
      { id: 'CORRECTIONS', text: "Final Scholastic Refinement" },
      { id: 'COMPLETED', text: "Institutional Degree Conferred" },
    ]
  }
];

export function ResearchJourney() {
  const { user } = useRole();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchStudent();
  }, [user]);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
      if (data) setStudent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (targetStage: string) => {
    if (!student) return 'locked';
    const currentIdx = STAGE_SEQUENCE.indexOf(student.current_stage);
    const targetIdx = STAGE_SEQUENCE.indexOf(targetStage);
    
    if (currentIdx > targetIdx) return 'completed';
    if (currentIdx === targetIdx) return 'current';
    
    // If we are in the same phase group, it might be 'pending' rather than 'locked'
    return 'locked';
  };

  const calculateProgress = (phaseStages: string[]) => {
     if (!student) return 0;
     const currentIdx = STAGE_SEQUENCE.indexOf(student.current_stage);
     const phaseIdxs = phaseStages.map(s => STAGE_SEQUENCE.indexOf(s));
     const completedInPhase = phaseIdxs.filter(idx => currentIdx > idx).length;
     const isCurrentlyInPhase = phaseIdxs.includes(currentIdx);
     
     if (completedInPhase === phaseStages.length) return 100;
     if (isCurrentlyInPhase) return (completedInPhase / phaseStages.length) * 100 + 10;
     return 0;
  };

  const getStageNumeric = (stage: string) => {
    const idx = STAGE_SEQUENCE.indexOf(stage);
    return idx === -1 ? 0 : idx + 1;
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      
      {/* Real-time Pipeline Rail */}
      <motion.div variants={itemVariants} className="bg-card/50 p-8 rounded-[40px] border border-border/50 relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-10 px-4">
               <div className="space-y-1">
                  <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-3 italic">
                     <Database className="text-primary" size={24}/> Scholastic <span className="text-primary">Ledger</span>
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em]">Institutional Progress Integrity Check</p>
               </div>
               <Badge className="bg-success/10 text-success border-none text-[10px] font-black uppercase tracking-widest px-4 py-1.5 flex gap-2">
                  <ShieldCheck size={14}/> Node Synchronized
               </Badge>
            </div>
            <PipelineRail currentStage={student?.current_stage ?? ""} />
         </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {JOURNEY_MAP.map((phase, idx) => {
          const progress = calculateProgress(phase.stages);
          
          return (
            <motion.div 
              key={phase.phase} 
              variants={itemVariants} 
              className={`card-shadow rounded-[32px] bg-card border-none p-8 flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 ${
                progress === 100 ? "ring-2 ring-success/20 shadow-2xl shadow-success/5" : 
                progress > 0 ? "ring-2 ring-primary/20 shadow-2xl shadow-primary/5" : "opacity-70 grayscale-[0.5]"
              }`}
            >
              {/* Dynamic Overlay */}
              <div className={`absolute -right-16 -top-16 w-40 h-40 rounded-full blur-[80px] pointer-events-none ${
                 idx === 0 ? "bg-primary/10" : idx === 1 ? "bg-secondary/10" : "bg-status-warning/10"
              }`} />

              <div className="flex items-center gap-5 mb-8 relative z-10">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${
                  progress === 100 ? "bg-success text-white shadow-success/40" : 
                  progress > 0 ? "bg-primary text-white shadow-primary/40" : "bg-muted text-muted-foreground"
                }`}>
                  <GitBranch size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground tracking-tight uppercase italic">{phase.phase}</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-tight">{phase.label}</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10 flex-1">
                {phase.actions.map((act, i) => {
                  const status = getStatus(act.id);
                  
                  return (
                    <div key={i} className={`flex gap-4 items-start group/act transition-all ${status === 'locked' ? 'opacity-30' : 'opacity-100'}`}>
                      <div className="mt-1 shrink-0">
                        {status === "completed" && <div className="h-6 w-6 rounded-full bg-success/10 border border-success/30 flex items-center justify-center text-success transition-transform group-hover/act:scale-110"><CheckCircle2 size={16} /></div>}
                        {status === "current" && <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary animate-pulse"><Clock size={16} /></div>}
                        {status === "locked" && <div className="h-6 w-6 rounded-full border border-border flex items-center justify-center text-muted-foreground/30"><Circle size={12} /></div>}
                      </div>
                      <div className="flex-1">
                        <p className={`text-[13px] font-bold leading-relaxed tracking-tight ${
                          status === "completed" ? "text-muted-foreground line-through decoration-muted-foreground/60" : 
                          status === "current" ? "text-foreground font-black" : "text-muted-foreground/50"
                        }`}>
                          {act.text}
                        </p>
                        {status === 'current' && (
                           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-black uppercase text-primary tracking-[0.2em] mt-1 pulse-subtle">Awaiting Final Verdict</motion.p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 pt-8 border-t border-border/40 relative z-10">
                <div className="flex justify-between items-end mb-3">
                   <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em]">Scholastic Index</span>
                      <p className="text-xl font-black text-foreground tabular-nums">{Math.round(progress)}%</p>
                   </div>
                   <div className={`h-10 w-10 rounded-xl border border-border flex items-center justify-center text-xs font-black ${
                      progress === 100 ? "text-success bg-success/5 border-success/20" : "text-muted-foreground"
                   }`}>
                      {idx + 1}
                   </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 1, ease: "easeOut" }}
                     className={`h-full rounded-full ${
                        progress === 100 ? "bg-success shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-primary shadow-[0_0_15px_rgba(20,181,217,0.3)]"
                     }`} 
                  />
                </div>
              </div>

              {progress < 100 && progress > 0 && (
                 <div className="absolute top-4 right-4 animate-bounce">
                    <AlertCircle size={18} className="text-primary" />
                 </div>
              )}
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
