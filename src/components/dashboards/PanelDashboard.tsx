import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, AlertTriangle, Clock, CheckCircle2, 
  ArrowRight, Search, FileText, ChevronRight, BarChart, Loader2, GitBranch, ShieldCheck, Mail, Database, LayoutDashboard, CalendarDays, Briefcase, Star, ClipboardCheck, History, PenTool
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/integrations/supabase/client";

export function PanelDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    students: any[];
    history: any[];
    kpis: { pending: number; completed: number; sessions: number };
  }>({
    students: [],
    history: [],
    kpis: { pending: 0, completed: 0, sessions: 0 }
  });

  useEffect(() => {
    if (user?.id) fetchPanelStats();
  }, [user]);

  const fetchPanelStats = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students in relevant stages
      // @ts-ignore
      const { data: sData } = await supabase
        .from('students')
        .select(`
          id, registration_number, current_stage, research_title,
          user:user_id(first_name, last_name),
          programme:programme_id(name)
        `)
        .in('current_stage', ['SCHOOL_SEMINAR_BOOKED', 'VIVA_SCHEDULED']);

      // 2. Fetch recent evaluations by this user
      // @ts-ignore
      const { data: hData } = await supabase
        .from('evaluations')
        .select(`
          *,
          student:student_id(
             id,
             user:user_id(first_name, last_name)
          )
        `)
        .eq('evaluator_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setData({
        students: sData || [],
        history: hData || [],
        kpis: {
          pending: sData?.length || 0,
          completed: hData?.length || 0,
          sessions: 4 // Placeholder for panel sessions
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    { label: "Assigned Candidates", value: data.kpis.pending.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Finalized Verdicts", value: data.kpis.completed.toString(), icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "Archived Sessions", value: data.kpis.sessions.toString(), icon: Briefcase, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Awaiting Action", value: data.kpis.pending > 0 ? "URGENT" : "STABLE", icon: Star, color: data.kpis.pending > 0 ? "text-destructive" : "text-muted-foreground", bg: "bg-muted" },
  ];

  if (loading) return (
     <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-10 max-w-7xl mx-auto pb-20">
      
      {/* KPI Console Overlay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className="rounded-2xl bg-white/10 backdrop-blur-2xl p-8 border border-white/20 shadow-lg shadow-black/10 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
            <div className={`absolute -right-8 -top-8 p-12 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${kpi.color}`}>
               <kpi.icon size={130} />
            </div>
            <div className={`flex h-16 w-16 items-center justify-center rounded-[20px] mb-8 shadow-2xl bg-gradient-to-br ${kpi.bg.replace('bg-', 'from-').replace('/5', '/10')} ${kpi.bg.replace('/5', '/5')} ${kpi.color}`}>
              <kpi.icon size={32} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{kpi.label}</p>
              <p className="text-4xl font-black text-foreground mt-2 tabular-nums tracking-tighter">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
         {/* Live Panel Stack */}
         <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-[48px] bg-card border border-border shadow-2xl overflow-hidden flex flex-col min-h-[500px] relative">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <Users size={300} />
            </div>
            
            <div className="px-10 py-8 border-b border-border/50 bg-muted/5 flex justify-between items-center relative z-10">
               <div className="space-y-1">
                  <h3 className="font-black text-foreground text-2xl uppercase tracking-tighter flex items-center gap-4 italic shrink-0">
                     <ClipboardCheck className="text-primary" size={28}/> Session <span className="text-primary italic">Candidates</span>
                  </h3>
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                     <GitBranch size={16} className="text-secondary"/> Active Institutional Pipeline
                  </p>
               </div>
               <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest">{data.students.length} Candidates Online</Badge>
            </div>

            <div className="p-4 relative z-10 flex-1 overflow-y-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.students.length === 0 ? (
                    <div className="col-span-2 py-32 text-center opacity-30 italic font-black uppercase tracking-widest text-[#000]">No Active Nodes In Pipeline</div>
                  ) : (
                    data.students.map((s) => (
                      <div key={s.id} className="group p-6 rounded-[32px] border-2 border-border/60 hover:border-primary/40 bg-background transition-all hover:shadow-2xl active:scale-[0.98] cursor-pointer" onClick={() => navigate("/evaluations")}>
                         <div className="flex justify-between items-start mb-6">
                            <Badge variant="outline" className="bg-muted text-muted-foreground text-[9px] font-black tracking-widest uppercase border-none px-3 py-1">
                               {s.registration_number}
                            </Badge>
                            <div className="h-6 w-6 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                               <ChevronRight size={14} />
                            </div>
                         </div>
                         <h4 className="text-xl font-black text-foreground leading-tight">{s.user?.first_name} {s.user?.last_name}</h4>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-2">{s.programme?.name}</p>
                         <p className="text-[10px] text-muted-foreground font-bold mt-4 italic line-clamp-1 opacity-60">"{(s.research_title || 'Institutional Mapping Pending').slice(0, 40)}..."</p>
                      </div>
                    ))
                  )}
               </div>
            </div>
            
            <div className="p-8 border-t border-border/50 bg-muted/5 relative z-10 flex justify-center">
               <Button 
                  onClick={() => navigate("/evaluations")}
                  variant="ghost" 
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-10 rounded-full flex items-center gap-3 group"
               >
                  Enter Full Academic Review Console <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-500" />
               </Button>
            </div>
         </motion.div>

         {/* Historical Audit Strip */}
         <div className="space-y-10">
            <motion.div variants={itemVariants} className="card-shadow rounded-[40px] bg-[#0c0c0c] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[400px] border-t-8 border-t-secondary relative">
               <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none" />
               
               <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/5">
                  <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic flex items-center gap-3">
                     <History className="text-secondary"/> Verdict <span className="text-secondary">History</span>
                  </h3>
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                     <Database size={16} />
                  </div>
               </div>
               
               <div className="p-6 space-y-4 flex-1 relative z-10 overflow-y-auto">
                 {data.history.length === 0 ? (
                    <div className="py-24 text-center text-white/20 italic font-black uppercase tracking-widest text-[9px]">Archive Log Empty</div>
                 ) : (
                    data.history.map((h) => (
                      <div key={h.id} className="p-5 rounded-[24px] border border-white/5 bg-white/5 relative group hover:border-secondary/30 transition-all">
                        <div className="flex justify-between items-start mb-3">
                           <Badge className="bg-secondary/10 text-secondary text-[8px] font-black px-2 py-0.5 rounded-full border-transparent">
                              {h.recommendation.replace('_', ' ')}
                           </Badge>
                           <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{new Date(h.created_at).toLocaleDateString()}</span>
                        </div>
                        <h4 className="text-sm font-black text-white group-hover:text-secondary transition-colors line-clamp-1">{h.student?.user?.first_name} {h.student?.user?.last_name}</h4>
                        <div className="mt-3 flex items-center justify-between">
                           <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Score Index: {h.score}/100</span>
                           <PenTool size={12} className="text-white/20" />
                        </div>
                      </div>
                    ))
                 )}
               </div>
               
               <div className="p-6 border-t border-white/5 bg-white/5">
                  <Button variant="ghost" className="w-full text-white/40 hover:text-secondary hover:bg-transparent text-[10px] font-black uppercase tracking-widest group">
                     Full Historical Audit <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </motion.div>

            {/* Quick Briefing Note */}
            <motion.div variants={itemVariants} className="p-10 rounded-[40px] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex flex-col gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                  <Star size={150} />
               </div>
               <div className="space-y-1 relative z-10 text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Assessment Standard</h4>
                  <p className="text-xl font-black text-foreground italic tracking-tight uppercase leading-none mt-2">RIGOROUS <span className="text-primary">EVALUATION</span></p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-4 leading-relaxed">Ensure all academic verdicts are grounded in the university's technical guidelines and original contribution standards.</p>
               </div>
            </motion.div>
         </div>
      </div>
    </motion.div>
  );
}
