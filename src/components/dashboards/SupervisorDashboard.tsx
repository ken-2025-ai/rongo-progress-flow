import { motion } from "framer-motion";
import { Users, AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";

const STUDENTS = [
  { name: "Omondi Okech", topic: "ML-Based Crop Disease Detection", stage: "First Draft", days: 18, status: "warning" },
  { name: "Faith Nyambura", topic: "Blockchain in Land Registry", stage: "Ethics", days: 5, status: "on-track" },
  { name: "Kevin Odhiambo", topic: "NLP for Dholuo Language Preservation", stage: "Data Collection", days: 32, status: "overdue" },
  { name: "Mercy Chebet", topic: "Solar Microgrid Optimization", stage: "Final Submission", days: 8, status: "on-track" },
  { name: "Brian Mutua", topic: "IoT Water Quality Monitoring", stage: "First Draft", days: 25, status: "warning" },
];

const PENDING_REPORTS = [
  { student: "Omondi Okech", type: "Q4 2025 Report", submitted: "March 12, 2026" },
  { student: "Kevin Odhiambo", type: "Q1 2026 Report", submitted: "March 15, 2026" },
];

import { containerVariants as container, itemVariants as item } from "@/lib/animations";

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  "on-track": { label: "On Track", classes: "bg-primary/10 text-primary" },
  "warning": { label: "Warning", classes: "bg-status-warning/10 text-status-warning" },
  "overdue": { label: "Overdue", classes: "bg-destructive/10 text-destructive" },
};

export function SupervisorDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Assigned Students", value: "5", icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Pending Reviews", value: "3", icon: Clock, color: "bg-status-warning/10 text-status-warning" },
          { label: "Overdue Students", value: "1", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
          { label: "Approved This Month", value: "2", icon: CheckCircle2, color: "bg-primary/10 text-primary" },
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
          <h3 className="label-uppercase text-container-header">Student Stage Overview</h3>
          <span className="text-xs text-muted-foreground">Sorted by days in stage ↓</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Research Topic</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stage</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Days</th>
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {[...STUDENTS].sort((a, b) => b.days - a.days).map((s, i) => {
              const statusInfo = STATUS_MAP[s.status];
              const isStalled = s.days > 14;
              return (
                <tr key={i} className={`border-b border-border last:border-0 transition-colors hover:bg-muted/30 cursor-pointer ${isStalled && s.status !== "on-track" ? "bg-status-warning/5" : ""}`}>
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{s.name}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground truncate max-w-[200px]">{s.topic}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground">{s.stage}</td>
                  <td className="px-4 py-2.5 text-sm text-foreground text-right tabular-nums">{s.days}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusInfo.classes}`}>
                      {isStalled && s.status !== "on-track" ? "Stalled" : statusInfo.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Pending Reports */}
      <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
        <h3 className="label-uppercase text-container-header mb-3">Pending Quarterly Reports</h3>
        <div className="space-y-2">
          {PENDING_REPORTS.map((r, i) => (
            <div key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-foreground">{r.student}</p>
                <p className="text-xs text-muted-foreground">{r.type} · Submitted {r.submitted}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md bg-success px-3 py-1 text-xs font-semibold text-success-foreground hover:bg-success/90 transition-all active:scale-[0.98]">
                  Approve
                </button>
                <button className="rounded-md border border-border px-3 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.98]">
                  Return
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
