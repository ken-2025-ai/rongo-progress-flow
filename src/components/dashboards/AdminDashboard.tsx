import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CalendarDays, FileBarChart, Clock, LayoutDashboard, Building2, Loader2, ChevronRight } from "lucide-react";
import { InstitutionalSetup } from "./InstitutionalSetup";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { containerVariants as container, itemVariants as item } from "@/lib/animations";

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  "DEPT_SEMINAR_PENDING": { label: "Dept Seminar Pending", classes: "bg-primary/10 text-primary" },
  "DEPT_SEMINAR_COMPLETED": { label: "Endorsed to School", classes: "bg-success/10 text-success" },
  "SCHOOL_SEMINAR_PENDING": { label: "School Sem. Pending", classes: "bg-status-warning/10 text-status-warning" },
  "CORRECTIONS": { label: "In Corrections", classes: "bg-destructive/10 text-destructive" },
};

export function AdminDashboard() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState<'students' | 'setup'>('students');
  const [loading, setLoading] = useState(true);
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
      const { data: students, error: sErr } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, staff_id),
          programme:programme_id(name, department_id),
          supervisor:supervisor_id(first_name, last_name)
        `)
        // Filter via programme->department
        .eq('programme_id.department_id' as any, user.department_id); // Note: Simple eq might not work for nested in Supabase JS without special syntax or RPC. 
        // Better join: get programme IDs first or use a join select if RLS allows.
        
      // Actually, standard Supabase JS won't filter nested easily like that without .filter() or rpc. 
      // Correct way using `inner join` filter syntax:
      // @ts-ignore
      const { data: deptStudents } = await supabase
        .from('students')
        .select(`
          id, registration_number, current_stage,
          user:user_id(first_name, last_name),
          programme!inner(name, department_id),
          supervisor:supervisor_id(first_name, last_name)
        `)
        .eq('programme.department_id', user.department_id);

      // 2. Fetch Progress Reports PENDING_DEPT for those students
      // @ts-ignore
      const sIds = (deptStudents || []).map(s => s.id);
      let reportsCount = 0;
      if (sIds.length > 0) {
        // @ts-ignore
        const { count } = await supabase
          .from('progress_reports')
          .select('*', { count: 'exact', head: true })
          .in('student_id', sIds)
          .eq('status', 'PENDING_DEPT');
        reportsCount = count || 0;
      }

      // 3. Fetch Bookings for DEPT_SEMINAR
      // @ts-ignore
      const { data: bookings } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            id,
            user:user_id(first_name, last_name)
          )
        `)
        .in('student_id', sIds)
        .eq('seminar_level', 'DEPT_SEMINAR')
        .eq('status', 'PENDING');

      setData({
        students: deptStudents || [],
        bookings: bookings || [],
        kpis: {
          total: deptStudents?.length || 0,
          overdue: 0, // In real world, calculate based on updated_at > 3 months
          reports: reportsCount,
          bookingsCount: bookings?.length || 0
        }
      });

    } catch (err) {
      console.error(err);
      toast.error("Resource Synch Error", { description: "Departmental metrics could not be synchronized." });
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (booking: any) => {
     try {
        // 1. Update Booking Status
        // @ts-ignore
        const { error: bErr } = await supabase
           .from('seminar_bookings')
           .update({ status: 'APPROVED' })
           .eq('id', booking.id);
        
        if (bErr) throw bErr;

        // 2. Advance Student Workflow Stage
        // @ts-ignore
        const { error: sErr } = await supabase
           .from('students')
           .update({ current_stage: 'SCHOOL_SEMINAR_PENDING' })
           .eq('id', booking.student_id);

        if (sErr) throw sErr;

        toast.success("Architectural Pipeline Advanced", { 
           description: "Candidate has been endorsed and moved to the School Seminar Queue." 
        });
        fetchDepartmentData();
     } catch (err) {
        toast.error("Pipeline Sync Failure");
     }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-card/40 backdrop-blur-sm rounded-xl border border-border w-fit shadow-sm">
        <Button 
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('students')}
          className={`rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}
        >
          <LayoutDashboard size={14} className="mr-2" /> Students Overview
        </Button>
        <Button 
          variant={activeTab === 'setup' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('setup')}
          className={`rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'setup' ? 'bg-secondary text-white shadow-md' : 'text-muted-foreground'}`}
        >
          <Building2 size={14} className="mr-2" /> Institutional Setup
        </Button>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Departmental Pool", value: data.kpis.total, icon: Users, color: "bg-primary/10 text-primary" },
              { label: "Institutional Overdue", value: data.kpis.overdue, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
              { label: "Seminar Requests", value: data.kpis.bookingsCount, icon: CalendarDays, color: "bg-status-warning/10 text-status-warning" },
              { label: "Awaiting Endorsement", value: data.kpis.reports, icon: FileBarChart, color: "bg-secondary/20 text-accent-foreground" },
            ].map((kpi, i) => (
              <motion.div key={i} variants={item} className="card-shadow rounded-2xl bg-card p-5 border border-border shadow-sm flex items-start gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color} shadow-inner`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Dynamic Students Table */}
             <motion.div variants={item} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/10">
                   <h3 className="font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
                      <Users size={16} className="text-primary"/> Departmental Registry
                   </h3>
                   <div className="flex gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest">
                      Live Architectural Census
                   </div>
                </div>
                <div className="overflow-x-auto min-h-[300px]">
                   <table className="w-full text-sm">
                      <thead>
                         <tr className="bg-muted/30 border-b border-border/40 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            <th className="px-5 py-3 text-left">Academic Identity</th>
                            <th className="px-5 py-3 text-left">Institutional Mapping</th>
                            <th className="px-5 py-3 text-right">Workflow Stage</th>
                            <th className="px-5 py-3 text-center">Protocol Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                         {data.students.length === 0 ? (
                           <tr><td colSpan={4} className="p-10 text-center italic text-muted-foreground">No students found in this department's architectural layer.</td></tr>
                         ) : (
                           data.students.map((s, i) => {
                             const st = STATUS_MAP[s.current_stage] || { label: s.current_stage, classes: "bg-muted text-muted-foreground" };
                             return (
                                <tr key={i} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                                   <td className="px-5 py-3.5">
                                      <p className="font-bold text-foreground">{(s.user as any)?.first_name} {(s.user as any)?.last_name}</p>
                                      <p className="text-[10px] font-mono text-muted-foreground">{s.registration_number}</p>
                                   </td>
                                   <td className="px-5 py-3.5">
                                      <p className="text-xs text-muted-foreground font-medium">Sup: {(s.supervisor as any)?.first_name || "NOT ASSIGNED"}</p>
                                      <p className="text-[9px] uppercase font-bold text-muted-foreground/60">{(s.programme as any)?.name}</p>
                                   </td>
                                   <td className="px-5 py-3.5 text-right">
                                      <p className="text-[10px] font-black uppercase text-foreground truncate max-w-[150px] ml-auto">
                                         {s.current_stage.replace(/_/g, ' ')}
                                      </p>
                                   </td>
                                   <td className="px-5 py-3.5 text-center">
                                      <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${st.classes} shadow-sm border border-current/10`}>
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

             {/* Live Seminar Queue */}
             <motion.div variants={item} className="card-shadow rounded-2xl bg-card border border-border shadow-sm p-5 space-y-4 border-t-4 border-t-secondary">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest pb-3 border-b border-border/50 flex items-center gap-2">
                   <CalendarDays size={16} className="text-secondary"/> Departmental Queue
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                   {data.bookings.length === 0 ? (
                      <div className="py-10 text-center italic text-muted-foreground text-xs">No pending seminar requests.</div>
                   ) : (
                      data.bookings.map((b, i) => (
                      <div key={i} className="group relative rounded-xl border border-border/60 hover:border-secondary/40 p-4 transition-all bg-background shadow-xs">
                         <div className="flex flex-col gap-1 mb-3">
                            <p className="text-sm font-bold text-foreground">{(b.student as any)?.user?.first_name} {(b.student as any)?.user?.last_name}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-secondary">{b.seminar_level.replace('_', ' ')}</p>
                         </div>
                         <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-4 font-bold uppercase tracking-tighter">
                            <span className="flex items-center gap-1"><Clock size={12}/> Req: {new Date(b.requested_date).toLocaleDateString()}</span>
                         </div>
                         <div className="flex gap-2">
                            <Button 
                              onClick={() => approveBooking(b)}
                              className="flex-1 h-9 rounded-lg bg-secondary py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-[0.98]">Confirm Schedule</Button>
                            <Button variant="outline" className="h-9 rounded-lg border border-border px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors">Adjust</Button>
                         </div>
                      </div>
                      ))
                   )}
                </div>
                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground gap-1">
                   View Full Departmental Schedule <ChevronRight size={14} />
                </Button>
             </motion.div>
          </div>
        </>
      ) : (
        <InstitutionalSetup />
      )}
    </motion.div>
  );
}
