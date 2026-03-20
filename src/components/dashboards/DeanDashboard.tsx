import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, AlertTriangle, Clock, TrendingUp, GraduationCap, CalendarDays, 
  ShieldCheck, Loader2, ArrowRight, Activity, Zap, Search, Globe, Filter, Star
} from "lucide-react";
import { containerVariants as container, itemVariants as item } from "@/lib/animations";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { toast } from "sonner";

// Stage groupings for pipeline bar
const STAGE_GROUPS = [
  { label: "Dept Phase", stages: ["DEPT_SEMINAR_PENDING", "DEPT_SEMINAR_BOOKED", "DEPT_SEMINAR_COMPLETED"], color: "bg-muted-foreground/40", icon: Globe },
  { label: "School Phase", stages: ["SCHOOL_SEMINAR_PENDING", "SCHOOL_SEMINAR_BOOKED", "SCHOOL_SEMINAR_COMPLETED"], color: "bg-secondary", icon: ShieldCheck },
  { label: "Readiness Check", stages: ["THESIS_READINESS_CHECK"], color: "bg-status-warning", icon: Activity },
  { label: "PG Examination", stages: ["PG_EXAMINATION"], color: "bg-primary", icon: Zap },
  { label: "Viva Defense", stages: ["VIVA_SCHEDULED"], color: "bg-secondary", icon: CalendarDays },
  { label: "Phase Transit", stages: ["CORRECTIONS", "SCHOOL_SEMINAR_COMPLETED"], color: "bg-destructive", icon: AlertTriangle },
  { label: "Alumni Node", stages: ["COMPLETED"], color: "bg-success", icon: GraduationCap },
];

export function DeanDashboard() {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [vivaQueue, setVivaQueue] = useState<any[]>([]);

  useEffect(() => { fetchDeanIntelligence(); }, []);

  const fetchDeanIntelligence = async () => {
    setLoading(true);
    try {
      // 1. Fetch Global Scholastic Ledger
      // @ts-ignore
      const { data: sData, error: sErr } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name))
        `)
        .order('updated_at', { ascending: false });

      if (sErr) throw sErr;
      setStudents(sData || []);

      // 2. Fetch Active Viva Command Chain
      // @ts-ignore
      const { data: vData } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            registration_number,
            user:user_id(first_name, last_name),
            programme:programme_id(name)
          )
        `)
        .eq('seminar_level', 'VIVA')
        .eq('status', 'APPROVED')
        .order('requested_date', { ascending: true })
        .limit(4);

      setVivaQueue(vData || []);
    } catch (err: any) {
       toast.error("Institutional Link Failure", { description: err.message });
    } finally {
       setLoading(false);
    }
  };

  const kpis = [
    { label: "Active Nodes", value: students.length, icon: Users, color: "text-primary", bg: "bg-primary/5", link: null },
    { label: "Exam Pipeline", value: students.filter(s => s.current_stage === 'PG_EXAMINATION').length, icon: Zap, color: "text-secondary", bg: "bg-secondary/5", link: "/dean-queue" },
    { label: "Viva Registry", value: students.filter(s => s.current_stage === 'VIVA_SCHEDULED').length, icon: CalendarDays, color: "text-status-warning", bg: "bg-status-warning/5", link: "/viva-scheduling" },
    { label: "Logic Stalls", value: students.filter(s => s.current_stage === 'CORRECTIONS').length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/5", link: null },
    { label: "Scholastic Exit", value: students.filter(s => s.current_stage === 'COMPLETED').length, icon: GraduationCap, color: "text-success", bg: "bg-success/5", link: "/final-clearance" },
  ];

  if (loading) return (
     <div className="h-[600px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
     </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-10 max-w-[1700px] mx-auto pb-24">
      
      {/* Institutional Command Strip */}
      <motion.div variants={item} className="bg-card/40 backdrop-blur-2xl p-10 rounded-[48px] border border-border/50 shadow-3xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
         <div className="absolute -top-20 -right-20 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <GraduationCap size={400} />
         </div>
         
         <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 relative z-10">
            <div className="flex items-center gap-8">
               <div className="h-20 w-20 rounded-[28px] bg-black flex items-center justify-center shadow-2xl ring-8 ring-primary/5">
                  <Globe className="text-primary" size={36} />
               </div>
               <div>
                  <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">Institutional <span className="text-primary">Governance</span></h1>
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-2 flex items-center gap-3">
                     <Zap size={14} className="text-secondary animate-pulse"/> PG Dean Command Node Synchronized
                  </p>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
               <div className="relative flex-1 xl:w-96 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                  <Input 
                     placeholder="Query Global Scholar Matrix..." 
                     className="h-16 pl-14 rounded-[24px] bg-background border-2 focus:border-primary transition-all font-bold placeholder:italic shadow-inner"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button className="h-16 px-10 rounded-[24px] bg-black hover:bg-primary text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all">
                  Generate Audit Report
               </Button>
            </div>
         </div>
      </motion.div>

      {/* KPI Intelligence Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={item}>
            {kpi.link ? (
               <Link to={kpi.link} className="block group">
                  <div className={`card-shadow rounded-[36px] bg-card p-8 border-2 border-border/50 hover:border-primary/40 transition-all hover:scale-[1.03] shadow-lg relative overflow-hidden`}>
                     <div className={`absolute -right-6 -top-6 p-10 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${kpi.color}`}>
                        <kpi.icon size={100} />
                     </div>
                     <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] mb-6 shadow-2xl ${kpi.bg} ${kpi.color} group-hover:rotate-12 transition-transform`}>
                        <kpi.icon size={28} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{kpi.label}</p>
                     <p className="text-4xl font-black text-foreground mt-2 tabular-nums tracking-tighter">{kpi.value.toString().padStart(2, '0')}</p>
                  </div>
               </Link>
            ) : (
               <div className={`card-shadow rounded-[36px] bg-card p-8 border-2 border-border/50 shadow-lg relative overflow-hidden`}>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] mb-6 shadow-2xl ${kpi.bg} ${kpi.color}`}>
                     <kpi.icon size={28} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{kpi.label}</p>
                  <p className="text-4xl font-black text-foreground mt-2 tabular-nums tracking-tighter">{kpi.value.toString().padStart(2, '0')}</p>
               </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
         {/* Global Pipeline Distribution */}
         <motion.div variants={item} className="xl:col-span-2 card-shadow rounded-[48px] bg-card border border-border shadow-2xl p-10 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.01] pointer-events-none">
               <Activity size={400} />
            </div>
            
            <div className="flex justify-between items-center relative z-10">
               <div className="space-y-1">
                  <h3 className="font-black text-foreground text-xl uppercase tracking-[0.2em] italic flex items-center gap-3">
                     <TrendingUp className="text-primary" /> Pipeline <span className="text-primary italic">Throughput</span>
                  </h3>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Institutional Candidate Distribution</p>
               </div>
               <Badge className="bg-primary text-white border-none px-6 py-2 rounded-full font-black text-[9px]">REAL-TIME SYNC</Badge>
            </div>

            <div className="space-y-8 relative z-10">
               {STAGE_GROUPS.map((g, i) => {
                  const count = students.filter(s => g.stages.includes(s.current_stage)).length;
                  const percentage = students.length > 0 ? (count / students.length) * 100 : 0;
                  return (
                     <div key={i} className="space-y-3 group cursor-help">
                        <div className="flex justify-between items-end px-2">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${g.color} text-white shadow-lg`}>
                                 <g.icon size={14} />
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{g.label}</span>
                           </div>
                           <div className="text-right">
                              <span className="text-xl font-black tabular-nums">{count}</span>
                              <span className="text-[9px] font-bold text-muted-foreground ml-2">({percentage.toFixed(1)}%)</span>
                           </div>
                        </div>
                        <div className="h-4 bg-muted/20 rounded-full overflow-hidden border border-border/5">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: i * 0.1, ease: 'circOut' }}
                              className={`h-full ${g.color} relative overflow-hidden`}
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                           </motion.div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </motion.div>

         {/* Viva Command Center */}
         <div className="space-y-10">
            <motion.div variants={item} className="card-shadow rounded-[48px] bg-[#0c0c0c] border border-white/5 shadow-3xl overflow-hidden flex flex-col min-h-[450px] border-t-8 border-t-primary relative">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
               
               <div className="px-10 py-10 border-b border-white/5 flex justify-between items-center bg-white/5 relative z-10">
                  <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic flex items-center gap-3">
                     <CalendarDays className="text-primary"/> Viva <span className="text-primary">Watch</span>
                  </h3>
                  <Badge className="bg-primary text-white border-none font-black px-4 py-1.5 rounded-full text-[9px]">{vivaQueue.length} SESSIONS</Badge>
               </div>

               <div className="p-8 flex-1 space-y-6 relative z-10 overflow-y-auto custom-scrollbar">
                  {vivaQueue.length === 0 ? (
                    <div className="py-24 text-center text-white/20 italic font-black uppercase tracking-widest text-[9px] flex flex-col items-center gap-6">
                       <Clock size={48} className="animate-pulse" />
                       No Scheduled Vivas Detected
                    </div>
                  ) : (
                    vivaQueue.map((v, i) => (
                      <div key={i} className="group p-6 rounded-[32px] border border-white/10 bg-white/5 hover:border-primary/40 transition-all cursor-pointer">
                         <div className="flex justify-between items-start mb-4">
                            <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest px-3 py-1">{(v.student as any)?.registration_number}</Badge>
                            <span className="text-[10px] font-black text-white/30 uppercase">{new Date(v.requested_date).toLocaleDateString('en-GB')}</span>
                         </div>
                         <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors">{(v.student as any)?.user?.first_name} {(v.student as any)?.user?.last_name}</h4>
                         <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1 italic">{(v.student as any)?.programme?.name}</p>
                      </div>
                    ))
                  )}
               </div>
               
               <div className="p-8 border-t border-white/5 bg-white/5">
                  <Link to="/viva-scheduling">
                     <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-primary hover:bg-transparent justify-between group">
                        Enter Viva Logistics <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                     </Button>
                  </Link>
               </div>
            </motion.div>

            {/* Quick Action Overlay */}
            <motion.div variants={item} className="p-10 rounded-[48px] bg-gradient-to-br from-success/10 to-transparent border border-success/20 flex flex-col gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                  <Star size={150} />
               </div>
               <div className="space-y-2 relative z-10 text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-success italic">Institutional Exit</h4>
                  <p className="text-2xl font-black text-foreground italic tracking-tight uppercase leading-none mt-2">ALUMNI <span className="text-success">CONVERSION</span></p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-4 leading-relaxed">System-wide clearance protocol for scholars who have satisfied research requirements.</p>
               </div>
               <Link to="/final-clearance" className="relative z-10">
                  <Button className="w-full h-14 rounded-[20px] bg-success text-white font-black uppercase tracking-[0.3em] text-[9px] shadow-2xl shadow-success/20">
                     Initialize Final Clearance
                  </Button>
               </Link>
            </motion.div>
         </div>
      </div>

    </motion.div>
  );
}
