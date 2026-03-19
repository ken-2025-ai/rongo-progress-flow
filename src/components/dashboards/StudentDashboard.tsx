import { useState, useEffect } from "react";
import { Clock, ArrowRight, AlertTriangle, CheckCircle2, Calendar, FileText, Loader2 } from "lucide-react";
import { PipelineRail } from "@/components/PipelineRail";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Link } from "react-router-dom";

export function StudentDashboard() {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [presentations, setPresentations] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) fetchStudentData();
  }, [user]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Student Profile & Stage
      // @ts-ignore
      const { data: sData, error: sError } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
      
      if (sData) {
        setStudentInfo(sData);

        // 2. Fetch Seminar Bookings
        // @ts-ignore
        const { data: pData } = await supabase
          .from('seminar_bookings')
          .select('*')
          .eq('student_id', sData.id)
          .order('requested_date', { ascending: true })
          .limit(3);
        setPresentations(pData || []);

        // 3. Fetch Corrections
        // @ts-ignore
        const { data: cData } = await supabase
          .from('corrections')
          .select('*')
          .eq('student_id', sData.id)
          .order('created_at', { ascending: false });
        setCorrections(cData || []);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const stageToLabel = (stage: string) => {
    return stage?.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') || "Pre-Registration";
  };

  const getStageNumeric = (stage: string) => {
    const sequence = ['DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_COMPLETED', 'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_COMPLETED', 'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'];
    const idx = sequence.indexOf(stage);
    return idx === -1 ? 0 : idx + 1;
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* Real-time Pipeline */}
      <motion.div variants={itemVariants}>
        <PipelineRail currentStage={getStageNumeric(studentInfo?.current_stage)} />
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card p-5 border border-border shadow-sm flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shadow-inner">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Milestone</p>
            <p className="text-lg font-black text-foreground mt-0.5">{stageToLabel(studentInfo?.current_stage)}</p>
            <p className="text-[10px] font-bold text-primary/80 uppercase mt-1">Institutional Track Status</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card p-5 border border-border shadow-sm flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-status-warning/10 shadow-inner">
            <AlertTriangle className="h-5 w-5 text-status-warning" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attention Required</p>
            <p className="text-lg font-black text-status-warning mt-0.5">
               {corrections.filter(c => c.status === 'PENDING').length} Pending Tasks
            </p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Review supervisor feedback</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card p-5 border border-border shadow-sm flex items-start gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 shadow-inner">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Validation Status</p>
            <p className="text-lg font-black text-foreground mt-0.5 font-mono">
               {studentInfo?.registration_number || "IDENT-PENDING"}
            </p>
            <Badge variant="secondary" className="mt-1 text-[8px] font-black uppercase bg-success/10 text-success border-success/20">Verified Identity</Badge>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Dynamic Presentations */}
        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden border-b-4 border-b-primary">
          <div className="p-4 bg-muted/20 border-b border-border/50 flex justify-between items-center">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar size={14} /> Scheduled Academic Events
             </h3>
             <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest">{presentations.length} Sessions</Badge>
          </div>
          <div className="p-5 space-y-3">
            {presentations.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground italic text-sm">No scheduled presentations found.</div>
            ) : (
               presentations.map((pres, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/5 border border-border/50 hover:bg-muted/10 transition-colors">
                 <div>
                   <p className="text-sm font-bold text-foreground">{pres.seminar_level.replace('_', ' ')}</p>
                   <p className="text-[10px] font-medium text-muted-foreground">{new Date(pres.requested_date).toLocaleDateString()} · Institutionally Vetted Venue</p>
                 </div>
                 <Badge className={`text-[9px] font-black uppercase tracking-tighter ${
                   pres.status === "APPROVED" ? "bg-success/10 text-success border-success/20" : "bg-status-warning/10 text-status-warning border-status-warning/20"
                 }`}>
                   {pres.status}
                 </Badge>
               </div>
               ))
            )}
          </div>
        </motion.div>

        {/* Real Corrections Checklist */}
        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden border-b-4 border-b-status-warning">
          <div className="p-4 bg-muted/20 border-b border-border/50 flex justify-between items-center">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={14} /> Supervisory Corrections Checklist
             </h3>
             <span className="text-[10px] font-black tabular-nums transition-all bg-status-warning/10 text-status-warning px-2 py-0.5 rounded">
               {corrections.filter(c => c.status === 'APPROVED').length}/{corrections.length} RESOLVED
             </span>
          </div>
          <div className="p-5 space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {corrections.length === 0 ? (
               <div className="text-center py-10 text-muted-foreground italic text-sm">Clean architectural record. No pending corrections.</div>
            ) : (
               corrections.map((c, i) => (
               <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-background border border-border/60">
                 <div className={`mt-1 p-1 rounded-full ${c.status === 'APPROVED' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                    <CheckCircle2 size={14} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className={`text-xs font-medium leading-relaxed ${c.status === 'APPROVED' ? "line-through text-muted-foreground" : "text-foreground"}`}>{c.description}</p>
                 </div>
                 <Badge variant="outline" className="text-[8px] font-black uppercase opacity-60 shrink-0">{c.urgency || "STANDARD"}</Badge>
               </div>
               ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Synchronized Command Dock */}
      <motion.div variants={itemVariants} className="bg-muted/30 p-6 rounded-2xl border border-border/50 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-foreground">Next Procedural Step</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Awaiting Departmental Seminar Review</p>
         </div>
         <div className="flex gap-4">
            <Link to="/booking">
               <Button className="bg-primary/90 hover:bg-primary text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 gap-2 uppercase text-[10px] tracking-widest">
                  <Calendar className="h-4 w-4" /> Request Seminar Execution
               </Button>
            </Link>
            <Link to="/reports">
               <Button variant="outline" className="bg-background border-border/80 text-foreground font-bold h-12 px-8 rounded-xl gap-2 uppercase text-[10px] tracking-widest hover:bg-muted transition-all">
                  <FileText className="h-4 w-4" /> Provision Quarterly Status
               </Button>
            </Link>
         </div>
      </motion.div>
    </motion.div>
  );
}
