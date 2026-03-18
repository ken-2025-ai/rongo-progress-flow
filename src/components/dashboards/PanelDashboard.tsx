import { motion } from "framer-motion";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = [
  { name: "Research Methodology", weight: 25, max: 25 },
  { name: "Literature Review", weight: 20, max: 20 },
  { name: "Data Analysis", weight: 20, max: 20 },
  { name: "Presentation & Delivery", weight: 15, max: 15 },
  { name: "Academic Writing", weight: 10, max: 10 },
  { name: "Response to Questions", weight: 10, max: 10 },
];

import { containerVariants as container, itemVariants as item } from "@/lib/animations";

export function PanelDashboard() {
  const [scores, setScores] = useState<number[]>(CATEGORIES.map(c => Math.round(c.max * 0.7)));

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const totalMax = CATEGORIES.reduce((a, c) => a + c.max, 0);
  const percentage = Math.round((totalScore / totalMax) * 100);
  const passed = percentage >= 50;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Header */}
      <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="label-uppercase text-muted-foreground mb-1">Assessment — Omondi Okech</h3>
            <p className="text-sm text-muted-foreground">Progress Seminar II · March 28, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground tabular-nums">{totalScore}<span className="text-lg text-muted-foreground">/{totalMax}</span></p>
              <p className="text-xs text-muted-foreground tabular-nums">{percentage}%</p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              passed ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
            }`}>
              {passed ? "Pass" : "Fail"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Rubric */}
      <motion.div variants={item} className="card-shadow rounded-lg bg-card p-4 space-y-4">
        <h3 className="label-uppercase text-muted-foreground">Scoring Rubric</h3>
        {CATEGORIES.map((cat, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{cat.name}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">{scores[i]}/{cat.max}</span>
            </div>
            <Slider
              value={[scores[i]]}
              max={cat.max}
              step={1}
              onValueChange={([val]) => {
                const next = [...scores];
                next[i] = val;
                setScores(next);
              }}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground">Weight: {cat.weight}%</p>
          </div>
        ))}
      </motion.div>

      {/* Submit */}
      <motion.div variants={item} className="flex gap-3">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98]">
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Submit Evaluation
        </Button>
      </motion.div>
    </motion.div>
  );
}
