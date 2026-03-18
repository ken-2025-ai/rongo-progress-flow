import { Clock, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PipelineRail } from "@/components/PipelineRail";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const UPCOMING_PRESENTATIONS = [
  { title: "Progress Seminar II", date: "March 28, 2026", venue: "Room 204, PG Block", status: "confirmed" },
  { title: "Departmental Review", date: "April 15, 2026", venue: "Senate Hall", status: "pending" },
];

const CORRECTIONS = [
  { item: "Chapter 3 methodology restructuring", urgency: "high", done: false },
  { item: "Update literature review citations (2024–2026)", urgency: "medium", done: true },
  { item: "Revise abstract to 300 words", urgency: "low", done: false },
  { item: "Fix Table 4.2 data inconsistency", urgency: "high", done: false },
];

import { containerVariants as container, itemVariants as item } from "@/lib/animations";

export function StudentDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Pipeline */}
      <motion.div variants={item}>
        <PipelineRail currentStage={3} />
      </motion.div>

      {/* Status Row */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="label-uppercase text-muted-foreground">Current Stage</p>
            <p className="text-lg font-semibold text-foreground">First Draft</p>
            <p className="text-xs text-muted-foreground tabular-nums mt-0.5">18 days in stage</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-status-warning/10">
            <AlertTriangle className="h-4 w-4 text-status-warning" />
          </div>
          <div>
            <p className="label-uppercase text-muted-foreground">Status</p>
            <p className="text-lg font-semibold text-status-warning">Warning</p>
            <p className="text-xs text-muted-foreground mt-0.5">Submit draft within 12 days</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="label-uppercase text-muted-foreground">Next Action</p>
            <p className="text-sm font-semibold text-foreground">Submit Chapter 3 & 4 to Supervisor</p>
            <p className="text-xs text-muted-foreground mt-0.5">Due: March 30, 2026</p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming Presentations */}
        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
          <h3 className="label-uppercase text-container-header mb-3">Upcoming Presentations</h3>
          <div className="space-y-2">
            {UPCOMING_PRESENTATIONS.map((pres, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-background px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">{pres.title}</p>
                  <p className="text-xs text-muted-foreground">{pres.date} · {pres.venue}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  pres.status === "confirmed"
                    ? "bg-primary/10 text-primary"
                    : "bg-status-warning/10 text-status-warning"
                }`}>
                  {pres.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Corrections Checklist */}
        <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
          <h3 className="label-uppercase text-container-header mb-3">
            Corrections Checklist
            <span className="ml-2 text-foreground tabular-nums">
              {CORRECTIONS.filter(c => c.done).length}/{CORRECTIONS.length}
            </span>
          </h3>
          <div className="space-y-1.5">
            {CORRECTIONS.map((c, i) => (
              <label key={i} className="flex items-start gap-2.5 rounded-md bg-background px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="checkbox" defaultChecked={c.done} className="mt-0.5 accent-primary" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${c.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{c.item}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  c.urgency === "high" ? "bg-destructive/10 text-destructive" :
                  c.urgency === "medium" ? "bg-status-warning/10 text-status-warning" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {c.urgency}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item} className="flex gap-3">
        <Button className="bg-success text-success-foreground hover:bg-success/90 transition-all active:scale-[0.98]">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Request Presentation
        </Button>
        <Button variant="outline" className="border-border text-foreground hover:bg-muted transition-all active:scale-[0.98]">
          <FileIcon className="h-4 w-4 mr-2" />
          Submit Quarterly Report
        </Button>
      </motion.div>
    </motion.div>
  );
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
