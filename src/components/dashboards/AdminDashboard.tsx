import { motion } from "framer-motion";
import { Users, AlertTriangle, CalendarDays, FileBarChart, Clock } from "lucide-react";

const STUDENTS_DATA = [
  { name: "Omondi Okech", reg: "PG/CS/001/2024", stage: "First Draft", days: 18, status: "warning", supervisor: "Dr. Amina Wanjiku" },
  { name: "Kevin Odhiambo", reg: "PG/CS/003/2024", stage: "Data Collection", days: 32, status: "overdue", supervisor: "Dr. Amina Wanjiku" },
  { name: "Faith Nyambura", reg: "PG/IT/005/2024", stage: "Ethics", days: 5, status: "on-track", supervisor: "Prof. Kibet Langat" },
  { name: "Mercy Chebet", reg: "PG/EE/007/2024", stage: "Final Submission", days: 8, status: "on-track", supervisor: "Dr. Silas Nyabuto" },
  { name: "Brian Mutua", reg: "PG/CS/009/2024", stage: "First Draft", days: 25, status: "warning", supervisor: "Dr. Amina Wanjiku" },
  { name: "Grace Atieno", reg: "PG/IS/011/2024", stage: "Proposal", days: 3, status: "on-track", supervisor: "Prof. Kibet Langat" },
];

const BOOKING_QUEUE = [
  { student: "Omondi Okech", type: "Progress Seminar", requested: "March 10", preferred: "March 28" },
  { student: "Faith Nyambura", type: "Proposal Defense", requested: "March 14", preferred: "April 5" },
];

import { containerVariants as container, itemVariants as item } from "@/lib/animations";

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  "on-track": { label: "On Track", classes: "bg-primary/10 text-primary" },
  "warning": { label: "Warning", classes: "bg-status-warning/10 text-status-warning" },
  "overdue": { label: "Overdue", classes: "bg-destructive/10 text-destructive" },
};

export function AdminDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "47", icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Students Overdue", value: "6", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
          { label: "Pending Bookings", value: "8", icon: CalendarDays, color: "bg-status-warning/10 text-status-warning" },
          { label: "Pending Reports", value: "12", icon: FileBarChart, color: "bg-secondary/20 text-accent-foreground" },
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

      {/* Students Table */}
      <motion.div variants={item} className="card-shadow rounded-lg bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="label-uppercase text-container-header">All Students</h3>
          <div className="flex gap-2">
            <select className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">
              <option>All Stages</option>
              <option>Proposal</option>
              <option>First Draft</option>
              <option>Final Submission</option>
            </select>
            <select className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground">
              <option>All Status</option>
              <option>On Track</option>
              <option>Warning</option>
              <option>Overdue</option>
            </select>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reg No</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supervisor</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Days</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {STUDENTS_DATA.map((s, i) => {
              const st = STATUS_MAP[s.status];
              return (
                <tr key={i} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground tabular-nums">{s.reg}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{s.supervisor}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{s.stage}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground text-right tabular-nums">{s.days}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${st.classes}`}>
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Booking Queue */}
      <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
        <h3 className="label-uppercase text-container-header mb-3">Booking Confirmation Queue</h3>
        <div className="space-y-2">
          {BOOKING_QUEUE.map((b, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-foreground">{b.student} — {b.type}</p>
                <p className="text-xs text-muted-foreground">Requested {b.requested} · Preferred {b.preferred}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-success px-3 py-1 text-xs font-semibold text-success-foreground hover:bg-success/90 transition-all active:scale-[0.98]">Approve</button>
                <button className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.98]">Reschedule</button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
