import { motion } from "framer-motion";
import {
  Users, AlertTriangle, Clock, TrendingUp, GraduationCap, CalendarDays,
  ShieldCheck, Loader2, ArrowRight
} from "lucide-react";
import { containerVariants as container, itemVariants as item } from "@/lib/animations";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Stage groupings for pipeline bar
const STAGE_GROUPS = [
  { label: "Dept Seminar", stages: ["DEPT_SEMINAR_PENDING", "DEPT_SEMINAR_BOOKED", "DEPT_SEMINAR_COMPLETED"], color: "bg-muted-foreground" },
  { label: "School Seminar", stages: ["SCHOOL_SEMINAR_PENDING", "SCHOOL_SEMINAR_BOOKED", "SCHOOL_SEMINAR_COMPLETED"], color: "bg-secondary" },
  { label: "Thesis Ready", stages: ["THESIS_READINESS_CHECK"], color: "bg-status-warning" },
  { label: "PG Examination", stages: ["PG_EXAMINATION"], color: "bg-primary" },
  { label: "Viva", stages: ["VIVA_SCHEDULED"], color: "bg-secondary" },
  { label: "Corrections", stages: ["CORRECTIONS"], color: "bg-destructive" },
  { label: "Graduated", stages: ["COMPLETED"], color: "bg-success" },
];

export function DeanDashboard() {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [upcomingVivaSchedule, setUpcomingVivaSchedule] = useState<any[]>([]);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all PG students with their details
      // @ts-ignore
      const { data: studentData, error: sErr } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          seminar_bookings(id, requested_date, status, seminar_level, approved_date)
        `)
        .order('updated_at', { ascending: false });

      if (sErr) throw sErr;
      setStudents(studentData || []);

      // Upcoming viva sessions
      // @ts-ignore
      const { data: vivaData } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            registration_number,
            user:user_id(first_name, last_name),
            programme:programme_id(name, department:department_id(name))
          )
        `)
        .eq('seminar_level', 'VIVA')
        .eq('status', 'APPROVED')
        .gte('approved_date', new Date().toISOString())
        .order('approved_date', { ascending: true })
        .limit(5);

      setUpcomingVivaSchedule(vivaData || []);
    } catch (err) {
      console.error("Dean dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Derive KPIs
  const totalStudents = students.length;
  const readyForExam = students.filter(s => s.current_stage === 'PG_EXAMINATION').length;
  const vivaScheduled = students.filter(s => s.current_stage === 'VIVA_SCHEDULED').length;
  const graduated = students.filter(s => s.current_stage === 'COMPLETED').length;
  const inCorrections = students.filter(s => s.current_stage === 'CORRECTIONS').length;

  // Pipeline stage counts
  const stageGroups = STAGE_GROUPS.map(g => ({
    ...g,
    count: students.filter(s => g.stages.includes(s.current_stage)).length,
  }));
  const maxCount = Math.max(...stageGroups.map(g => g.count), 1);

  // 10 most recent students
  const recentStudents = students.slice(0, 8);

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  );

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

      {/* Welcome Banner */}
      <motion.div variants={item} className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 shadow-md">
        <div className="absolute -top-10 -right-10 opacity-[0.04]">
          <GraduationCap size={200} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Postgraduate School</p>
          <h1 className="text-2xl font-black text-foreground mt-1">
            Dean's Institutional Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Real-time view of all {totalStudents} active postgraduate scholars across the institution.
          </p>
        </div>
      </motion.div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Scholars", value: totalStudents, icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Exam Ready", value: readyForExam, icon: ShieldCheck, color: "bg-secondary/10 text-secondary", link: "/dean-queue" },
          { label: "Viva Scheduled", value: vivaScheduled, icon: CalendarDays, color: "bg-status-warning/10 text-status-warning", link: "/viva-scheduling" },
          { label: "In Corrections", value: inCorrections, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
          { label: "Graduated", value: graduated, icon: TrendingUp, color: "bg-success/10 text-success", link: "/final-clearance" },
        ].map((kpi) => (
          <motion.div key={kpi.label} variants={item}>
            {kpi.link ? (
              <Link to={kpi.link} className="block group">
                <div className="card-shadow rounded-2xl bg-card p-5 flex items-start gap-4 border border-border hover:border-primary/40 transition-all hover:shadow-lg">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.color} shrink-0`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">{kpi.value}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="card-shadow rounded-2xl bg-card p-5 flex items-start gap-4 border border-border">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.color} shrink-0`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                  <p className="text-3xl font-black text-foreground tabular-nums">{kpi.value}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution Bar Chart */}
        <motion.div variants={item} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border p-6 shadow-md">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-5">
            Pipeline Stage Distribution — All Scholars
          </h3>
          <div className="space-y-3">
            {stageGroups.map((g) => (
              <div key={g.label} className="flex items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground w-28 shrink-0 truncate">{g.label}</span>
                <div className="flex-1 h-7 bg-muted/30 rounded-lg overflow-hidden">
                  <motion.div
                    className={`h-full ${g.color} rounded-lg`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(g.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <span className="text-sm font-black text-foreground tabular-nums w-6 text-right">{g.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Viva Sessions */}
        <motion.div variants={item} className="card-shadow rounded-2xl bg-card border border-border overflow-hidden shadow-md">
          <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upcoming Viva Sessions</h3>
            <Link to="/viva-scheduling">
              <ArrowRight size={14} className="text-primary" />
            </Link>
          </div>
          <div className="divide-y divide-border/40">
            {upcomingVivaSchedule.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground opacity-60 font-bold uppercase tracking-widest">
                No viva sessions scheduled
              </div>
            ) : (
              upcomingVivaSchedule.map((session, i) => (
                <div key={session.id} className="p-4 hover:bg-muted/5 transition-colors">
                  <p className="font-black text-sm text-foreground">
                    {session.student?.user?.first_name} {session.student?.user?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.student?.programme?.name}</p>
                  <p className="text-[10px] font-mono text-primary mt-1">
                    {session.approved_date ? new Date(session.approved_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBD'}
                  </p>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-border/30">
            <Link to="/viva-scheduling">
              <Button variant="ghost" className="w-full h-9 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                Manage All Viva Sessions <ArrowRight size={14} className="ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Scholars Table */}
      <motion.div variants={item} className="card-shadow rounded-2xl bg-card border border-border overflow-hidden shadow-md">
        <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Scholar Roster</h3>
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px]">{totalStudents} scholars</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-5 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Scholar</th>
                <th className="px-5 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Programme</th>
                <th className="px-5 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Department</th>
                <th className="px-5 py-3 text-left text-[9px] font-black text-muted-foreground uppercase tracking-widest">Current Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {recentStudents.map((student) => {
                const stageLabel = student.current_stage?.replace(/_/g, ' ') || 'Pre-Registration';
                const isLate = ['PG_EXAMINATION', 'VIVA_SCHEDULED'].includes(student.current_stage);
                const isGrad = student.current_stage === 'COMPLETED';
                return (
                  <tr key={student.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-black text-foreground">{student.user?.first_name} {student.user?.last_name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{student.registration_number}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground font-medium">{student.programme?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="text-[9px] uppercase">{student.programme?.department?.name || '—'}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isGrad
                          ? 'bg-success/10 text-success'
                          : isLate
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {stageLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length > 8 && (
            <div className="p-4 border-t border-border/30 text-center text-xs text-muted-foreground font-bold">
              Showing 8 of {students.length} scholars.
            </div>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
