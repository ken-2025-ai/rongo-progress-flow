import { motion } from "framer-motion";
import { GitBranch, CheckCircle2, Circle, Clock } from "lucide-react";
import { PipelineRail } from "@/components/PipelineRail";
import { containerVariants, itemVariants } from "@/lib/animations";

const JOURNEY_STEPS = [
  {
    stage: "Department Level",
    label: "IHRS / CMJ",
    items: [
      { action: "Book Department Seminar", status: "completed" },
      { action: "Present Research", status: "completed" },
      { action: "Receive Panel Corrections", status: "completed" },
      { action: "Fix Corrections & Confirm with Supervisor", status: "current" },
      { action: "Department Coordinator Approval", status: "pending" },
    ]
  },
  {
    stage: "School Level",
    label: "School of Graduate Studies",
    items: [
      { action: "Book School Seminar (3rd Thursday)", status: "locked" },
      { action: "Higher-level Presentation & Feedback", status: "locked" },
      { action: "Submit Improved Thesis Version", status: "locked" },
      { action: "School Admin Confirmation", status: "locked" },
    ]
  },
  {
    stage: "Postgraduate School",
    label: "PG Dean Review",
    items: [
      { action: "Submit Final Thesis for Examination", status: "locked" },
      { action: "Examiner Assignment (Internal/External)", status: "locked" },
      { action: "Viva Voce Scheduling", status: "locked" },
      { action: "Examination Outcome", status: "locked" },
    ]
  }
];

export function ResearchJourney() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PipelineRail currentStage={0} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {JOURNEY_STEPS.map((step, idx) => (
          <motion.div 
            key={step.stage} 
            variants={itemVariants} 
            className={`card-shadow rounded-xl bg-card border-t-4 p-5 ${
              idx === 0 ? "border-primary" : idx === 1 ? "border-status-warning/40" : "border-muted"
            }`}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`p-2 rounded-lg ${
                idx === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <GitBranch size={18} />
              </div>
              <div>
                <h3 className="font-bold text-foreground leading-tight">{step.stage}</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{step.label}</p>
              </div>
            </div>

            <div className="space-y-4">
              {step.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start group">
                  <div className="mt-1 shrink-0">
                    {item.status === "completed" && <CheckCircle2 className="text-secondary" size={16} />}
                    {item.status === "current" && <Clock className="text-primary animate-pulse" size={16} />}
                    {item.status === "pending" && <Circle className="text-muted-foreground" size={16} />}
                    {item.status === "locked" && <Circle className="text-muted-foreground/30" size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      item.status === "completed" ? "text-muted-foreground line-through decoration-muted-foreground/40" : 
                      item.status === "current" ? "text-foreground font-semibold" : 
                      item.status === "locked" ? "text-muted-foreground/40" : "text-muted-foreground"
                    }`}>
                      {item.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {idx === 0 && (
              <div className="mt-6 pt-5 border-t border-border flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Progress: 60%</span>
                <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%]" />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
