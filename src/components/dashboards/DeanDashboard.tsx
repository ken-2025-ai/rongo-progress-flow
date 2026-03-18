import { motion } from "framer-motion";
import { Users, AlertTriangle, TrendingUp, CalendarDays, ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";

const PIPELINE_DISTRIBUTION = [
  { stage: "Proposal", count: 6, pct: 13 },
  { stage: "Ethics", count: 4, pct: 9 },
  { stage: "Data Collection", count: 8, pct: 17 },
  { stage: "First Draft", count: 12, pct: 26 },
  { stage: "Final Submission", count: 7, pct: 15 },
  { stage: "Viva Voce", count: 4, pct: 9 },
  { stage: "Corrections", count: 3, pct: 6 },
  { stage: "Graduation", count: 3, pct: 6 },
];

const OVERDUE_STUDENTS = [
  { name: "Kevin Odhiambo", stage: "Data Collection", days: 32, supervisor: "Dr. Amina Wanjiku" },
  { name: "Samuel Kiprop", stage: "First Draft", days: 45, supervisor: "Prof. Kibet Langat" },
  { name: "Lilian Akinyi", stage: "Ethics", days: 28, supervisor: "Dr. Silas Nyabuto" },
];

const APPROVAL_CHAIN = [
  { role: "Supervisor", person: "Dr. Amina Wanjiku", status: "approved" },
  { role: "Dept Chair", person: "Prof. Kibet Langat", status: "approved" },
  { role: "Dean", person: "Dr. Silas Nyabuto", status: "pending" },
];

const UPCOMING = [
  { student: "Omondi Okech", type: "Progress Seminar II", date: "March 28", venue: "Room 204" },
  { student: "Grace Atieno", type: "Proposal Defense", date: "April 2", venue: "Senate Hall" },
  { student: "Mercy Chebet", type: "Final Viva", date: "April 10", venue: "PG Block 301" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } } };

export function DeanDashboard() {
  const maxCount = Math.max(...PIPELINE_DISTRIBUTION.map(p => p.count));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total PG Students", value: "47", icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Overdue (>21 days)", value: "6", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
          { label: "Pending Approvals", value: "9", icon: Clock, color: "bg-status-warning/10 text-status-warning" },
          { label: "Graduation Ready", value: "3", icon: TrendingUp, color: "bg-primary/10 text-primary" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={item} className="card-shadow rounded-lg bg-card p-4 flex items-start gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-md ${kpi.color}`}>
              <kpi.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="label-uppercase text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-semibold text-foreground tabular-nums">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pipeline Distribution */}
        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
          <h3 className="label-uppercase text-muted-foreground mb-4">Pipeline Stage Distribution</h3>
          <div className="space-y-2">
            {PIPELINE_DISTRIBUTION.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-28 shrink-0 truncate">{p.stage}</span>
                <div className="flex-1 h-5 bg-muted rounded-sm overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${(p.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
                <span className="text-xs font-semibold text-foreground tabular-nums w-8 text-right">{p.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Approval Chain Visualizer */}
        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
          <h3 className="label-uppercase text-muted-foreground mb-4">Approval Chain — Omondi Okech</h3>
          <div className="space-y-0">
            {APPROVAL_CHAIN.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    a.status === "approved" ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-secondary"
                  }`}>
                    {a.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  {i < APPROVAL_CHAIN.length - 1 && (
                    <div className={`w-0.5 h-8 ${a.status === "approved" ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-medium text-foreground">{a.role}</p>
                  <p className="text-xs text-muted-foreground">{a.person}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider mt-1 ${
                    a.status === "approved" ? "bg-primary/10 text-primary" : "bg-secondary/20 text-secondary"
                  }`}>
                    {a.status === "approved" ? "✓ Approved" : "PENDING"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Overdue Students */}
        <motion.div variants={item} className="card-shadow rounded-lg bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="label-uppercase text-muted-foreground">Overdue Students</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Days</th>
              </tr>
            </thead>
            <tbody>
              {OVERDUE_STUDENTS.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0 bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer">
                  <td className="px-4 py-2.5">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.supervisor}</p>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{s.stage}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-destructive text-right tabular-nums">{s.days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Upcoming Presentations */}
        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
          <h3 className="label-uppercase text-muted-foreground mb-3">Upcoming Presentations</h3>
          <div className="space-y-2">
            {UPCOMING.map((u, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.student}</p>
                  <p className="text-xs text-muted-foreground">{u.type} · {u.date} · {u.venue}</p>
                </div>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
