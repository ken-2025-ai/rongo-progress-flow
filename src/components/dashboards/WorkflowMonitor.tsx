import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, GitBranch, User, GraduationCap, ArrowRight, Zap, AlertCircle, Building2, Search, ArrowUpRight, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  'DEPT_SEMINAR_PENDING',
  'DEPT_SEMINAR_BOOKED',
  'DEPT_SEMINAR_COMPLETED',
  'SCHOOL_SEMINAR_PENDING',
  'SCHOOL_SEMINAR_BOOKED',
  'SCHOOL_SEMINAR_COMPLETED',
  'PG_EXAMINATION',
  'VIVA_SCHEDULED',
  'CORRECTIONS',
  'COMPLETED'
];

const STAGE_LABELS: Record<string, string> = {
  'DEPT_SEMINAR_PENDING': 'Dept. Proposal',
  'DEPT_SEMINAR_BOOKED': 'Dept. Scheduled',
  'DEPT_SEMINAR_COMPLETED': 'Dept. Passed',
  'SCHOOL_SEMINAR_PENDING': 'School Proposal',
  'SCHOOL_SEMINAR_BOOKED': 'School Scheduled',
  'SCHOOL_SEMINAR_COMPLETED': 'School Passed',
  'PG_EXAMINATION': 'External Examination',
  'VIVA_SCHEDULED': 'Viva-Voce Oral',
  'CORRECTIONS': 'Final Refinement',
  'COMPLETED': 'Institutional Clearance'
};

export function WorkflowMonitor() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStage, setFilterStage] = useState("ALL");
  const [isJumping, setIsJumping] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select('*, user:user_id(first_name, last_name, email), programme:programme_id(name, department:department_id(name, schools(name)))')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      toast.error("Telemetry Link Failure", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleStageJump = async (studentId: string, newStage: string) => {
    if (!confirm(`GLOBAL OVERRIDE: Advancing student directly to ${newStage}. Continue?`)) return;
    
    setIsJumping(studentId);
    try {
      // @ts-ignore
      const { error } = await supabase.from('students').update({ current_stage: newStage }).eq('id', studentId);
      if (error) throw error;
      
      toast.info("Process Flow Intercepted", { 
        description: "Student node manually advanced. Academic sequence updated.",
        icon: <Zap className="text-secondary" />
      });
      fetchStudents();
    } catch (err: any) {
      toast.error("Override Denied", { description: err.message });
    } finally {
      setIsJumping(null);
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = (s.user?.first_name + " " + s.user?.last_name + " " + s.registration_number).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "ALL" || s.current_stage === filterStage;
    return matchesSearch && matchesStage;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      
      {/* Telemetry Dashboard Header */}
      <div className="bg-gradient-to-br from-[#111] to-[#050505] p-10 rounded-[48px] border border-white/5 relative overflow-hidden">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
         <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-[100px]" />
         
         <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/10 rounded-2xl">
                     <Activity size={24} className="text-secondary animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight italic">Workforce <span className="text-secondary">Pulse</span></h2>
               </div>
               <p className="text-white/40 max-w-2xl text-sm font-medium leading-relaxed">
                  High-fidelity institutional surveillance of the postgraduate research pipeline. Intercept, monitor, and override the academic sequence for critical disaster recovery or administrative correction.
               </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
               {[
                 { label: "Active Pipeline", val: students.length, color: "text-primary" },
                 { label: "Completion Ratio", val: "14%", color: "text-success" },
                 { label: "Stalled Nodes", val: 3, color: "text-status-warning" },
                 { label: "Uptime", val: "99.9%", color: "text-secondary" },
               ].map((stat, i) => (
                 <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[24px] flex flex-col items-center justify-center text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">{stat.label}</p>
                    <p className={`text-2xl font-black tabular-nums ${stat.color}`}>{stat.val}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-col md:flex-row gap-4 items-center px-2">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-secondary transition-colors" size={20} />
            <Input 
               placeholder="Enter Student ID or Full Scholastic Identity..." 
               className="h-16 bg-white/5 border-white/5 rounded-3xl pl-14 text-white font-bold tracking-tight focus:ring-secondary/30 focus:bg-white/10 transition-all text-lg"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <select 
               value={filterStage}
               onChange={(e) => setFilterStage(e.target.value)}
               className="h-16 w-full md:w-64 bg-white/5 border border-white/5 rounded-3xl px-6 text-white text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary/20 appearance-none shadow-xl"
            >
               <option value="ALL">Operational Filter: Global</option>
               {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
            </select>
            <Button 
               onClick={fetchStudents}
               className="h-16 w-16 rounded-3xl bg-secondary text-white font-black p-0 group hover:shadow-2xl hover:shadow-secondary/30 shadow-secondary/10 transition-all"
            >
               <Database size={24} className="group-active:scale-110 transition-transform" />
            </Button>
         </div>
      </div>

      {/* Workflow Matrix */}
      <div className="space-y-4 pb-20">
         <AnimatePresence mode="popLayout">
            {filtered.map((student) => (
               <motion.div 
                  key={student.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#0c0c0c] border border-white/5 rounded-[40px] p-8 flex flex-col lg:flex-row items-center gap-8 relative group overflow-hidden hover:border-white/10 hover:shadow-2xl transition-all"
               >
                  {/* Identity Node */}
                  <div className="flex items-center gap-6 min-w-[300px] w-full lg:w-auto">
                     <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 flex items-center justify-center text-2xl font-black text-white shadow-inner relative">
                        <User size={32} className="text-white/60" />
                        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
                           <GraduationCap size={16} className="text-secondary" />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white tracking-tight">{student.user?.first_name} {student.user?.last_name}</h3>
                        <p className="text-xs font-mono font-bold text-white/40">{student.registration_number}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <Badge className="bg-white/5 text-white/50 border-none text-[9px] uppercase font-black uppercase tracking-tighter">
                              {student.programme?.name}
                           </Badge>
                        </div>
                     </div>
                  </div>

                  {/* Visual Progress Map */}
                  <div className="flex-1 w-full bg-white/5 h-24 rounded-[30px] p-2 flex items-center gap-1.5 border border-white/5 relative shadow-inner overflow-hidden">
                     {STAGES.map((s, idx) => {
                        const isPast = STAGES.indexOf(student.current_stage) >= idx;
                        const isCurrent = student.current_stage === s;
                        
                        return (
                           <div 
                              key={s} 
                              className={`h-full flex-1 rounded-[18px] transition-all relative group/step flex flex-col items-center justify-center gap-1 px-1 overflow-hidden ${
                                 isCurrent ? "bg-secondary shadow-[0_0_30px_rgba(20,181,217,0.4)] z-10" : 
                                 isPast ? "bg-primary/20" : "bg-white/5 opacity-30 grayscale"
                              }`}
                           >
                              <div className={`h-1.5 w-1.5 rounded-full ${isCurrent ? "bg-white" : isPast ? "bg-primary" : "bg-white/20"} ${isCurrent ? "animate-ping" : ""}`} />
                              <span className={`text-[7px] font-black uppercase text-center leading-tight tracking-[0.1em] ${isCurrent ? "text-white" : isPast ? "text-primary/70" : "text-white/10"}`}>
                                 {STAGE_LABELS[s]}
                              </span>
                              
                              {/* Step Overlay Info */}
                              <div className="absolute inset-0 bg-transparent opacity-0 group-hover/step:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => handleStageJump(student.id, s)}>
                                 {!isCurrent && <Zap size={14} className="text-secondary fill-secondary drop-shadow-[0_0_8px_rgba(20,181,217,1)]" />}
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  {/* Actions / Metrics */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-48 text-center shrink-0">
                     <div className="flex-1 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Current Protocol</span>
                        <span className="text-[10px] font-black text-secondary break-words uppercase">{STAGE_LABELS[student.current_stage]}</span>
                     </div>
                     <Button className="h-14 rounded-2xl bg-white border border-white/10 text-black font-black uppercase text-[10px] tracking-widest hover:bg-white/90 active:scale-95 transition-all">
                        Deep State Audit
                     </Button>
                  </div>

                  {isJumping === student.id && (
                     <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-50">
                        <GitBranch size={40} className="text-secondary animate-bounce" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-white animate-pulse">Recalibrating Sequence...</span>
                     </div>
                  )}

                  {/* Status Indicator */}
                  <div className={`absolute top-0 right-0 h-4 w-4 rounded-bl-full ${STAGES.indexOf(student.current_stage) > 6 ? "bg-success" : "bg-primary"}`} />
               </motion.div>
            ))}
         </AnimatePresence>

         {filtered.length === 0 && (
            <div className="py-20 flex flex-col items-center gap-6">
               <div className="p-10 bg-white/5 rounded-full border border-dashed border-white/20">
                  <BarChart3 size={100} className="text-white/10" />
               </div>
               <div className="text-center">
                  <h4 className="text-white font-bold text-xl uppercase tracking-widest">No Flow Intercepted</h4>
                  <p className="text-white/30 text-sm mt-2">The system monitoring grid is clear. No matching student nodes detected.</p>
               </div>
            </div>
         )}
      </div>

    </motion.div>
  );
}
