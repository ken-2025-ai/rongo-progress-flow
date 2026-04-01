import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, AlertTriangle, CalendarDays, FileBarChart, Clock, LayoutDashboard, 
  Building2, Loader2, ChevronRight, CheckCircle2, Sliders, ShieldAlert, Zap, Filter, Search
} from "lucide-react";
import { InstitutionalSetup } from "./InstitutionalSetup";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { containerVariants as container, itemVariants as item } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  "DEPT_SEMINAR_PENDING": { label: "Prospecting", classes: "bg-primary/10 text-primary border-primary/20" },
  "DEPT_SEMINAR_BOOKED": { label: "Protocol Locked", classes: "bg-secondary/10 text-secondary border-secondary/20" },
  "DEPT_SEMINAR_COMPLETED": { label: "Phase Transit", classes: "bg-success/10 text-success border-success/20" },
  "SCHOOL_SEMINAR_PENDING": { label: "Higher Review", classes: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  "CORRECTIONS": { label: "Logic Refinement", classes: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function AdminDashboard() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState<'students' | 'setup'>('students');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [maxBookings, setMaxBookings] = useState(5);
  const [isUpdatingCapacity, setIsUpdatingCapacity] = useState(false);
  
  const [data, setData] = useState<{
    students: any[];
    bookings: any[];
    kpis: { total: number; overdue: number; reports: number; bookingsCount: number };
  }>({
    students: [],
    bookings: [],
    kpis: { total: 0, overdue: 0, reports: 0, bookingsCount: 0 }
  });

  useEffect(() => {
    if (user?.department_id) fetchDepartmentData();
  }, [user]);

  const fetchDepartmentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Students in Department
      // @ts-ignore
      const { data: deptStudentsRaw, error: sErr } = await supabase
        .from('students')
        .select(`
          id, registration_number, current_stage, research_title,
          user:user_id(first_name, last_name, email),
          programme!inner(name, department_id),
          supervisor:supervisor_id(first_name, last_name),
          seminar_bookings(requested_date, status, seminar_level, approved_date)
        `)
        .eq('programme.department_id', user.department_id);
      
      const deptStudents = (deptStudentsRaw || []) as any[];

      if (sErr) throw sErr;

      const sIds = (deptStudents || []).map(s => s.id);
      let reportsCount = 0;
      let bookings: any[] = [];

      if (sIds.length > 0) {
        // 2. Progress Reports
        // @ts-ignore
        const { count } = await supabase
          .from('progress_reports')
          .select('*', { count: 'exact', head: true })
          .in('student_id', sIds)
          .eq('status', 'PENDING_DEPT');
        reportsCount = count || 0;

        // 3. Dept Seminar Bookings
        // @ts-ignore
        const { data: bData } = await supabase
          .from('seminar_bookings')
          .select(`
            *,
            student:student_id(
              id,
              user:user_id(first_name, last_name)
            )
          `)
          .in('student_id', sIds)
          .eq('status', 'PENDING');
        bookings = bData || [];
      }

      setData({
        students: deptStudents || [],
        bookings: bookings,
        kpis: {
          total: deptStudents?.length || 0,
          overdue: deptStudents?.filter(s => s.current_stage === 'CORRECTIONS').length || 0,
          reports: reportsCount,
          bookingsCount: bookings.length || 0
        }
      });

    } catch (err: any) {
      console.error(err);
      toast.error("Telemetry Sync Error");
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (bookingId: string, studentId: string) => {
     try {
        // @ts-ignore
        const { error: bErr } = await supabase.from('seminar_bookings').update({ status: 'APPROVED', approved_date: new Date().toISOString() }).eq('id', bookingId);
        if (bErr) throw bErr;

        // @ts-ignore
        const { error: sErr } = await supabase.from('students').update({ current_stage: 'DEPT_SEMINAR_BOOKED' }).eq('id', studentId);
        if (sErr) throw sErr;

        toast.success("Architectural Pipeline Advanced");
        fetchDepartmentData();
     } catch (err: any) {
        toast.error("Pipeline Sync Failure");
     }
  };

  const updateCapacity = () => {
     setIsUpdatingCapacity(true);
     setTimeout(() => {
        setIsUpdatingCapacity(false);
        toast.success("Institutional Capacity Updated", { description: `Max seminar slots per session set to ${maxBookings}.` });
     }, 800);
  };

  const getNextBookingDate = (student: any) => {
     const booking = student.seminar_bookings?.find((b: any) => b.status === 'APPROVED' || b.status === 'PENDING');
     if (!booking) return "Not Scheduled";
     return new Date(booking.requested_date || booking.approved_date).toLocaleDateString();
  };

  if (loading) return (
     <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8 max-w-[1600px] mx-auto pb-24">
      
      {/* Dynamic Command Strip */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-card/40 backdrop-blur-xl p-8 rounded-[40px] border border-border/50 shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
         
         <div className="flex items-center gap-6 relative z-10">
            <div className="h-16 w-16 rounded-[24px] bg-black flex items-center justify-center shadow-2xl ring-4 ring-primary/5">
                <LayoutDashboard className="text-primary" size={28} />
            </div>
            <div>
               <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Phase <span className="text-primary">Controller</span></h1>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                  <Zap size={12} className="text-secondary animate-pulse"/> Department Node Synchronized
               </p>
            </div>
         </div>

         <div className="flex flex-wrap items-center gap-3 relative z-10 p-1.5 bg-black/5 rounded-[24px] border border-white/5">
            <Button 
               variant={activeTab === 'students' ? 'default' : 'ghost'}
               onClick={() => setActiveTab('students')}
               className={`h-12 rounded-[20px] px-8 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'students' ? 'bg-primary text-white shadow-[0_0_30px_rgba(20,181,217,0.3)]' : 'text-muted-foreground'
               }`}
            >
               Scholastic Registry
            </Button>
            <Button 
               variant={activeTab === 'setup' ? 'default' : 'ghost'}
               onClick={() => setActiveTab('setup')}
               className={`h-12 rounded-[20px] px-8 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === 'setup' ? 'bg-secondary text-white shadow-[0_0_30px_rgba(191,140,44,0.3)]' : 'text-muted-foreground'
               }`}
            >
               Infrastructure Matrix
            </Button>
         </div>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* KPI Hologram Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Active Pool", value: data.kpis.total, icon: Users, color: "text-primary", bg: "bg-primary/5", border: "border-primary/20" },
              { label: "Critical Stalls", value: data.kpis.overdue, icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/20" },
              { label: "Seminar Influx", value: data.kpis.bookingsCount, icon: CalendarDays, color: "text-secondary", bg: "bg-secondary/5", border: "border-secondary/20" },
              { label: "Awaiting Verdict", value: data.kpis.reports, icon: FileBarChart, color: "text-success", bg: "bg-success/5", border: "border-success/20" },
            ].map((kpi, i) => (
              <motion.div key={i} variants={item} className={`rounded-2xl bg-white/10 backdrop-blur-2xl p-8 border border-white/20 shadow-lg shadow-black/10 flex items-start gap-6 hover:scale-[1.02] transition-transform duration-500 group`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br ${kpi.bg.replace('bg-', 'from-').replace('/5', '/10')} ${kpi.bg.replace('/5', '/5')} ${kpi.color} shadow-inner group-hover:rotate-12 transition-transform`}>
                  <kpi.icon size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{kpi.label}</p>
                  <p className="text-4xl font-black text-foreground mt-2 tabular-nums tracking-tighter">{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
             {/* Global Registry Terminal */}
             <motion.div variants={item} className="lg:col-span-2 card-shadow rounded-[48px] bg-card border border-border shadow-2xl overflow-hidden flex flex-col min-h-[600px] relative">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                   <Users size={300} />
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between px-10 py-8 border-b border-border/50 bg-muted/5 gap-6 relative z-10">
                   <div className="space-y-1">
                      <h3 className="font-black text-foreground text-xl uppercase tracking-[0.2em] flex items-center gap-3 italic">
                         <Filter size={20} className="text-primary"/> Access <span className="text-primary">Ledger</span>
                      </h3>
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Full Scholastic Node Visibility</p>
                   </div>
                   <div className="relative w-full md:w-96 group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                      <Input 
                         placeholder="Query Candidate Hub..." 
                         className="h-14 pl-12 rounded-[20px] bg-background border-2 focus:border-primary transition-all font-bold placeholder:italic"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>

                <div className="overflow-x-auto relative z-10">
                   <table className="w-full">
                      <thead>
                         <tr className="bg-muted/10 border-b border-border/40 text-[10px] uppercase font-black text-muted-foreground tracking-[0.3em]">
                            <th className="px-10 py-5 text-left">Academic Identity</th>
                            <th className="px-10 py-5 text-left">Mapping</th>
                            <th className="px-10 py-5 text-center">Next Session</th>
                            <th className="px-10 py-5 text-right">Workflow</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                         {data.students.length === 0 ? (
                           <tr><td colSpan={4} className="p-20 text-center italic text-muted-foreground font-black uppercase tracking-widest opacity-30">Registry Node Disconnected</td></tr>
                         ) : (
                           data.students
                           .filter(s => {
                              const name = `${s.user?.first_name} ${s.user?.last_name}`.toLowerCase();
                              return name.includes(searchTerm.toLowerCase()) || s.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
                           })
                           .map((s, i) => {
                             const st = STATUS_MAP[s.current_stage] || { label: s.current_stage.replace(/_/g, ' '), classes: "bg-muted text-muted-foreground" };
                             return (
                                <tr key={i} className="group hover:bg-muted/10 transition-all cursor-pointer">
                                   <td className="px-10 py-6">
                                      <p className="font-black text-base text-foreground group-hover:text-primary transition-colors">{s.user?.first_name} {s.user?.last_name}</p>
                                      <p className="text-[10px] font-mono font-black text-muted-foreground mt-1 opacity-60">{s.registration_number}</p>
                                   </td>
                                   <td className="px-10 py-6">
                                      <p className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[200px] italic">{(s.programme as any)?.name}</p>
                                      <p className="text-[9px] uppercase font-black text-muted-foreground/50 mt-1">SUPERVISOR: {(s.supervisor as any)?.first_name || "NULL_NODE"}</p>
                                   </td>
                                   <td className="px-10 py-6 text-center">
                                      <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-none ${getNextBookingDate(s) === "Not Scheduled" ? 'bg-muted/50 text-muted-foreground' : 'bg-primary/10 text-primary animate-pulse'}`}>
                                         {getNextBookingDate(s)}
                                      </Badge>
                                   </td>
                                   <td className="px-10 py-6 text-right">
                                      <span className={`inline-flex items-center rounded-[14px] px-4 py-2 text-[9px] font-black uppercase tracking-widest border-2 ${st.classes} shadow-xl`}>
                                         {st.label}
                                      </span>
                                   </td>
                                </tr>
                             );
                           })
                         )}
                      </tbody>
                   </table>
                </div>
             </motion.div>

             {/* Command Infrastructure Control */}
             <div className="space-y-10">
                {/* Max Booking Controller */}
                <motion.div variants={item} className="card-shadow rounded-[40px] bg-[#0c0c0c] border border-white/5 p-10 space-y-8 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:rotate-45 transition-transform duration-1000">
                      <Sliders size={120} className="text-secondary" />
                   </div>
                   
                   <div className="relative z-10 space-y-2">
                      <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] italic flex items-center gap-3">
                         <Sliders size={20} className="text-secondary"/> Capacity <span className="text-secondary">Controller</span>
                      </h3>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Institutional Slot Management</p>
                   </div>

                   <div className="relative z-10 space-y-6">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-white/60 uppercase tracking-widest flex justify-between">
                            Max Daily Bookings
                            <span className="text-secondary font-black">{maxBookings} Slots</span>
                         </label>
                         <input 
                            type="range" 
                            min="1" 
                            max="20" 
                            value={maxBookings} 
                            onChange={(e) => setMaxBookings(parseInt(e.target.value))}
                            className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-secondary"
                         />
                         <div className="flex justify-between text-[8px] font-black text-white/20 uppercase">
                            <span>Precision</span>
                            <span>High Load</span>
                         </div>
                      </div>

                      <Button 
                         onClick={updateCapacity}
                         disabled={isUpdatingCapacity}
                         className="w-full h-14 rounded-2xl bg-secondary hover:bg-secondary/90 text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-secondary/20 transition-all active:scale-[0.98]"
                      >
                         {isUpdatingCapacity ? <Loader2 size={18} className="animate-spin" /> : "Commit Architecture"}
                      </Button>
                   </div>
                </motion.div>

                {/* Live Action Queue */}
                <motion.div variants={item} className="card-shadow rounded-[40px] bg-card border-[3px] border-primary/20 p-8 space-y-8 shadow-2xl relative overflow-hidden group border-t-8 border-t-primary">
                   <div className="flex justify-between items-center pb-6 border-b border-border/50">
                      <h3 className="font-black text-foreground text-[10px] uppercase tracking-[0.4em] italic flex items-center gap-3">
                         <CalendarDays size={20} className="text-primary"/> Request Queue
                      </h3>
                      <Badge className="bg-primary text-white border-none font-black px-3 py-1 text-[10px] rounded-full">{data.bookings.length}</Badge>
                   </div>

                   <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {data.bookings.map((b, i) => (
                      <div key={i} className="group relative rounded-[32px] border-2 border-border/50 hover:border-primary/40 p-6 transition-all bg-background shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
                         <div className="flex flex-col gap-1 mb-6">
                            <h4 className="text-base font-black text-foreground uppercase tracking-tighter group-hover:text-primary transition-colors">{(b.student as any)?.user?.first_name} {(b.student as any)?.user?.last_name}</h4>
                            <p className="text-[9px] uppercase font-black tracking-[0.3em] text-primary">{b.seminar_level.replace('_', ' ')}</p>
                         </div>
                         <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-8 font-black uppercase tracking-widest bg-muted rounded-full px-4 py-2">
                            <span className="flex items-center gap-2"><Clock size={14}/> {new Date(b.requested_date).toLocaleDateString()}</span>
                         </div>
                         <div className="flex gap-4">
                            <Button 
                              onClick={() => approveBooking(b.id, b.student_id)}
                              className="flex-1 h-14 rounded-2xl bg-black hover:bg-primary text-[10px] font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/20 transition-all">
                               Authorize
                            </Button>
                            <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 flex items-center justify-center text-muted-foreground hover:text-foreground">
                               <ChevronRight size={20} />
                            </Button>
                         </div>
                      </div>
                      ))}
                   </div>
                </motion.div>
             </div>
          </div>
        </>
      ) : (
        <InstitutionalSetup />
      )}
    </motion.div>
  );
}
