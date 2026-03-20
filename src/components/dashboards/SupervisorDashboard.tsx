import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, AlertTriangle, Clock, CheckCircle2, 
  ArrowRight, Search, FileText, ChevronRight, BarChart, Loader2, GitBranch, ShieldCheck, Mail, Database, LayoutDashboard, CalendarDays
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

const STAGE_COLORS: Record<string, string> = {
  'DEPT_SEMINAR_PENDING': 'bg-primary/20 text-primary border-primary/20',
  'DEPT_SEMINAR_BOOKED': 'bg-secondary/20 text-secondary border-secondary/20',
  'DEPT_SEMINAR_COMPLETED': 'bg-success/20 text-success border-success/20',
  'SCHOOL_SEMINAR_PENDING': 'bg-status-warning/20 text-status-warning border-status-warning/20',
  'SCHOOL_SEMINAR_BOOKED': 'bg-status-warning/30 text-status-warning border-status-warning/30',
  'SCHOOL_SEMINAR_COMPLETED': 'bg-success/30 text-success border-success/30',
  'CORRECTIONS': 'bg-destructive/20 text-destructive border-destructive/20',
  'COMPLETED': 'bg-success text-white border-transparent'
};

export function SupervisorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState<'roster' | 'analytics'>('roster');
  const [students, setStudents] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
       fetchSupervisionData();
    }
  }, [user]);

  const fetchSupervisionData = async () => {
    try {
       // @ts-ignore
       const { data: studentsData } = await supabase
         .from('students')
         .select(`
            *,
            user:user_id(first_name, last_name, email),
            programme:programme_id(name, department:department_id(name)),
            seminar_bookings(requested_date, status)
         `)
         .eq('supervisor_id', user.id);

       if (studentsData) {
          setStudents(studentsData);
          const sIds = studentsData.map(s => s.id);
          if (sIds.length > 0) {
             // @ts-ignore
             const { data: reportsData } = await supabase
               .from('progress_reports')
               .select(`
                 *,
                 student:student_id(
                    user:user_id(first_name, last_name)
                 )
               `)
               .in('student_id', sIds)
               .eq('status', 'PENDING_SUPERVISOR');
             
             setPendingReports(reportsData || []);
          }
       }
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  const getNextSession = (student: any) => {
     const booking = student.seminar_bookings?.find((b: any) => b.status === 'APPROVED' || b.status === 'PENDING');
     if (!booking) return "None";
     return new Date(booking.requested_date).toLocaleDateString();
  };

  const kpis = [
    { label: "Cohort Mentees", value: students.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Awaiting Verdict", value: pendingReports.length.toString(), icon: Clock, color: "text-status-warning", bg: "bg-status-warning/10" },
    { label: "Scholastic Stalls", value: students.filter(s => s.current_stage === 'CORRECTIONS').length.toString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Degree Clearance", value: students.filter(s => s.current_stage === 'COMPLETED').length.toString(), icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  ];

  if (loading) return (
     <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Dynamic Header & Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tight italic">Supervisory <span className="text-primary font-black">Control</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.3em]">Node ID: {user?.id?.slice(0, 8)} | Identity: {user?.name}</p>
         </div>
         <div className="flex items-center gap-2 p-1.5 bg-black/5 rounded-[20px] backdrop-blur-xl border border-border/50">
            <Button 
               variant={activeView === 'roster' ? 'default' : 'ghost'} 
               onClick={() => setActiveView('roster')}
               className={`h-11 rounded-[16px] px-6 text-[10px] font-black uppercase tracking-widest ${activeView === 'roster' ? 'bg-primary text-white shadow-xl' : 'text-muted-foreground'}`}>
               <LayoutDashboard size={14} className="mr-2" /> Global Roster
            </Button>
            <Button 
               variant={activeView === 'analytics' ? 'default' : 'ghost'} 
               onClick={() => setActiveView('analytics')}
               className={`h-11 rounded-[16px] px-6 text-[10px] font-black uppercase tracking-widest ${activeView === 'analytics' ? 'bg-secondary text-white shadow-xl' : 'text-muted-foreground'}`}>
               <BarChart size={14} className="mr-2" /> Progress Analytics
            </Button>
         </div>
      </div>

      {/* KPI Dynamic Console */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className="card-shadow rounded-[32px] bg-card p-7 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
            <div className={`absolute -right-8 -top-8 p-10 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${kpi.color}`}>
               <kpi.icon size={120} />
            </div>
            <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] mb-6 shadow-2xl ${kpi.bg} ${kpi.color}`}>
              <kpi.icon size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{kpi.label}</p>
              <p className="text-4xl font-black text-foreground mt-2 tabular-nums">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <AnimatePresence mode="wait">
            {activeView === 'roster' ? (
               <motion.div 
                  key="roster"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="lg:col-span-2 card-shadow rounded-[40px] bg-card border border-border shadow-md overflow-hidden flex flex-col min-h-[600px] relative"
               >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                     <Users size={200} />
                  </div>
                  
                  <div className="p-8 flex flex-col sm:flex-row justify-between sm:items-center gap-6 border-b border-border/50 relative z-10 bg-muted/5">
                     <div>
                        <h3 className="font-black text-foreground text-xl flex items-center gap-3 uppercase italic">
                           <GitBranch className="text-primary" size={24}/> Scholastic Matrix
                        </h3>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Institutional Identity Tracking</p>
                     </div>
                     <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={18} />
                        <Input 
                           placeholder="Filter candidate architecture..." 
                           className="pl-12 h-12 text-sm rounded-2xl bg-background border-2 focus:border-primary transition-all font-semibold"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </div>

                  <div className="flex-1 overflow-x-auto relative z-10">
                     <Table>
                        <TableHeader className="bg-muted/10">
                           <TableRow className="border-b border-border/40">
                              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scholastic Identity</th>
                              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Stage</th>
                              <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Next Session</th>
                              <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Node</th>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {students
                             .filter(s => {
                                const fullName = `${s.user?.first_name || ""} ${s.user?.last_name || ""}`.toLowerCase();
                                const topic = (s.research_title || "").toLowerCase();
                                return fullName.includes(searchTerm.toLowerCase()) || topic.includes(searchTerm.toLowerCase());
                             })
                             .map((s) => (
                                <TableRow key={s.id} className="group hover:bg-muted/5 transition-all cursor-pointer">
                                   <td className="px-8 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase">
                                            {s.user?.first_name[0]}{s.user?.last_name[0]}
                                         </div>
                                         <div className="space-y-0.5">
                                            <span className="block font-black text-base text-foreground group-hover:text-primary transition-colors">
                                               {s.user?.first_name} {s.user?.last_name}
                                            </span>
                                            <span className="block text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-2">
                                               <Mail size={12} className="text-primary/40"/> {s.user?.email}
                                            </span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-6">
                                      <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${STAGE_COLORS[s.current_stage] || 'bg-muted text-muted-foreground'}`}>
                                         {s.current_stage?.replace(/_/g, ' ')}
                                      </Badge>
                                   </td>
                                   <td className="px-8 py-6 text-center">
                                      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase bg-muted/20 py-1.5 px-4 rounded-full border border-border/10">
                                         <CalendarDays size={14} className="text-secondary" />
                                         {getNextSession(s)}
                                      </div>
                                   </td>
                                   <td className="px-8 py-6 text-center">
                                      <div className={`h-2.5 w-2.5 rounded-full mx-auto relative ${s.current_stage === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`}>
                                         {!s.current_stage.includes('COMPLETED') && (
                                            <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-50" />
                                         )}
                                      </div>
                                   </td>
                                </TableRow>
                             ))}
                        </TableBody>
                     </Table>
                  </div>
               </motion.div>
            ) : (
               <motion.div 
                  key="analytics"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="lg:col-span-2 space-y-8"
               >
                  <div className="card-shadow rounded-[40px] bg-card border border-border p-10 flex flex-col justify-center items-center text-center space-y-6">
                     <div className="h-20 w-20 bg-secondary/10 text-secondary rounded-[24px] flex items-center justify-center shadow-inner">
                        <BarChart size={40} />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Cohort Pipeline <span className="text-secondary">Analytics</span></h3>
                        <p className="text-xs text-muted-foreground uppercase font-black tracking-[0.2em] max-w-sm">Advanced architectural visualization of candidate distribution across scholastic phases.</p>
                     </div>
                     <div className="w-full h-1 bg-border/40 rounded-full" />
                     {/* Simplified bar chart for MVP mockup */}
                     <div className="w-full space-y-4 pt-4">
                        {['Dept Phase', 'School Phase', 'Final Defense', 'Completion'].map((phase, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">
                                 <span>{phase}</span>
                                 <span className="text-foreground">Node Density: {Math.floor(Math.random() * 5) + 1}</span>
                              </div>
                              <div className="h-4 bg-muted/30 rounded-full overflow-hidden border border-border/20 shadow-inner">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${Math.random() * 80 + 20}%` }} className="h-full bg-secondary" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Command Dashboard */}
         <motion.div variants={itemVariants} className="space-y-8">
            <div className="card-shadow rounded-[40px] bg-[#0c0c0c] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[500px] border-t-8 border-t-primary relative">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
               
               <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10 bg-white/5">
                  <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic flex items-center gap-3">
                     <FileText className="text-primary"/> Action Queue
                  </h3>
                  <Badge className="bg-primary text-white border-none text-[10px] font-black px-3 py-1">{pendingReports.length}</Badge>
               </div>
               
               <div className="p-6 space-y-5 flex-1 relative z-10 custom-scrollbar overflow-y-auto">
                 {pendingReports.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-white/30 text-center gap-6">
                       <div className="p-8 bg-white/5 rounded-full border border-dashed border-white/10 shadow-inner">
                          <ShieldCheck size={48} className="animate-pulse" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synapse Stable</p>
                          <p className="text-[9px] font-bold text-white/20 uppercase mt-1">No pending review nodes detected</p>
                       </div>
                    </div>
                 ) : (
                    pendingReports.map((r) => (
                      <div key={r.id} className="rounded-[32px] border border-white/5 p-6 bg-white/5 shadow-2xl hover:border-primary/40 transition-all group cursor-pointer active:scale-[0.98]" onClick={() => navigate("/reports-review")}>
                        <div className="flex justify-between items-start mb-4">
                           <Badge variant="outline" className="bg-primary/10 text-primary text-[9px] font-black tracking-widest uppercase border-transparent px-3 py-1">
                              {r.quarter} {r.year}
                           </Badge>
                           <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        </div>
                        <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors tracking-tight">
                           {r.student?.user?.first_name} {r.student?.user?.last_name}
                        </h4>
                        <p className="text-[10px] text-white/30 uppercase font-black mt-2 tracking-widest leading-relaxed line-clamp-2">
                           {r.synopsis}
                        </p>
                        
                        <div className="mt-8 flex items-center gap-4">
                           <Button className="flex-1 h-12 rounded-2xl bg-white text-black hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl">
                              Begin Review
                           </Button>
                           <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors">
                              <ChevronRight size={20} />
                           </div>
                        </div>
                      </div>
                    ))
                 )}
               </div>
               
               <div className="p-6 border-t border-white/5 bg-white/5 backdrop-blur-md relative z-10">
                  <Button 
                     variant="ghost" 
                     className="w-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-transparent justify-between group transition-all" 
                     onClick={() => navigate("/reports-review")}
                  >
                     Institutional Review Desk <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
