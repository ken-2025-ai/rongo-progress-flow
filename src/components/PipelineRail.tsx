import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PHASE_LABELS, getPhaseForStage } from "@/lib/pipeline";

interface PipelineRailProps {
  currentStage: number | string; // stage index (1-based) or stage code
  completedStages?: number[];
}

export function PipelineRail({ currentStage, completedStages }: PipelineRailProps) {
  const phaseIdx = typeof currentStage === "string"
    ? getPhaseForStage(currentStage)
    : Math.min(Math.max(0, (currentStage as number) - 1), PHASE_LABELS.length - 1);
  const completed = completedStages ?? Array.from({ length: phaseIdx }, (_, i) => i);

  return (
    <div className="card-shadow rounded-lg bg-card p-5">
      <h3 className="label-uppercase text-muted-foreground mb-4">Progress</h3>
      <div className="flex items-center gap-0">
        {PHASE_LABELS.map((stage, i) => {
          const isCompleted = completed.includes(i);
          const isCurrent = i === phaseIdx;
          const isFuture = i > phaseIdx;

          return (
            <div key={stage} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5 relative">
                {/* Node */}
                <motion.div
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors cursor-pointer
                    ${isCompleted ? "bg-primary text-primary-foreground" : ""}
                    ${isCurrent ? "bg-card border-2 border-secondary text-secondary animate-pulse-ring" : ""}
                    ${isFuture ? "bg-muted text-muted-foreground" : ""}
                  `}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-secondary" strokeWidth={3} />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </motion.div>
                {/* Label */}
                <span className={`text-[10px] font-medium whitespace-nowrap absolute -bottom-5 ${
                  isCompleted ? "text-primary" : isCurrent ? "text-secondary font-semibold" : "text-muted-foreground"
                }`}>
                  {stage}
                </span>
              </div>
              {/* Connector */}
              {i < PHASE_LABELS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 ${
                  isCompleted ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
