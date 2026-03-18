import { motion } from "framer-motion";
import { ClipboardCheck, CheckCircle2, AlertCircle, FileText, LayoutDashboard, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";

export function SeminarFeedback() {
  const feedbacks = [
    { 
      type: "Departmental Seminar", 
      level: "School Level", 
      date: "Nov 02, 2025", 
      decision: "Pass with Minor Corrections", 
      score: "78%", 
      panel: ["Dr. Otieno (Chair)", "Prof. Nyong'o", "Dr. Manyara"],
      requiredActions: [
        "Revise the conceptual framework in Chapter 2 to include local context.",
        "Update the sampling technique description for clarity.",
        "Standardize all figure captions."
      ]
    },
    { 
      type: "First Proposal Presentation", 
      level: "Departmental Level", 
      date: "May 15, 2025", 
      decision: "Pass", 
      score: "85%", 
      panel: ["Dr. Okoye (Chair)", "Prof. Maina", "Dr. Kamau"],
      requiredActions: [
        "Approved to proceed to data collection.",
      ]
    }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground">Active Feedback Queue</h2>
          <p className="text-xs text-muted-foreground">Recent seminar evaluations and required corrections</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText size={16} />
          Download Full Report
        </Button>
      </div>

      <div className="space-y-6">
        {feedbacks.map((f, i) => (
          <motion.div key={i} variants={itemVariants} className="card-shadow rounded-xl bg-card border-l-4 border-primary/40 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4">
              <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                f.decision.includes("Pass") ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
              }`}>
                {f.decision}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-none">{f.type}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{f.level} · {f.date}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Required Actions & Corrections
                  </h4>
                  <div className="space-y-2.5">
                    {f.requiredActions.map((action, idx) => (
                      <div key={idx} className="flex gap-3 text-sm text-foreground bg-muted/20 p-3 rounded-lg border border-border/10">
                        <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <p className="leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5 bg-muted/10 p-5 rounded-xl border border-border/20">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Panel Committee</h4>
                  <div className="space-y-1.5 font-medium text-sm text-foreground/80">
                    {f.panel.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Overall Assessment</h4>
                  <div className="text-2xl font-black text-primary flex items-center gap-2">
                    {f.score}
                    <span className="text-xs font-bold text-muted-foreground italic">Very Good</span>
                  </div>
                </div>

                <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
                  <Send size={16} />
                  Submit Evidence of Fixing
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
