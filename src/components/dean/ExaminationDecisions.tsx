import { motion } from "framer-motion";
import { 
  FileBarChart, CheckCircle2, AlertTriangle, XCircle, Search, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState } from "react";

const VIVA_CANDIDATES = [
  {
    id: 1,
    student: "John Musyoka",
    programme: "MSc Health Informatics",
    dateScheduled: "May 2, 2026",
    status: "Awaiting Exam Decision",
  }
];

export function ExaminationDecisions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDecision, setSelectedDecision] = useState("");

  const recordDecision = (name: string) => {
    toast.success(`Final Examination Result Logged for ${name}`, {
      description: `Outcome: ${selectedDecision.replace("-", " ")}. Correction workflow activated.`,
      duration: 5000
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="text-secondary" />
            Examination Decisions
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Record the final PG Board consensus post Viva Voce defence.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search candidates post-viva..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {VIVA_CANDIDATES.map((candidate) => (
          <motion.div key={candidate.id} variants={itemVariants} className="card-shadow bg-card border-l-4 border-l-secondary rounded-xl overflow-hidden border-border p-6 flex flex-col xl:flex-row gap-8 items-center justify-between">
             
             <div className="flex-1 space-y-2">
                <Badge variant="outline" className="bg-secondary/10 text-secondary border-transparent uppercase tracking-wider text-[10px] animate-pulse glow-secondary mb-2">
                   {candidate.status}
                </Badge>
                <h3 className="text-xl font-bold text-foreground">{candidate.student}</h3>
                <p className="text-sm text-muted-foreground font-medium">{candidate.programme}</p>
                <div className="pt-2 text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                   <ShieldCheck size={14} className="text-primary"/> 
                   PG Board Review: <span className="text-foreground">{candidate.dateScheduled}</span>
                </div>
             </div>

             <div className="w-full xl:w-96">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground text-sm font-bold shadow-lg shadow-success/20 uppercase tracking-wider transition-all"
                    >
                       Record Viva Outcome
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                         <FileBarChart className="text-success" /> Select Board Verdict
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                       <p className="text-xs text-muted-foreground">Select the official ruling from the Board of Examiners for <strong className="text-foreground">{candidate.student}</strong>. This dictates their timeline moving to Graduation.</p>
                       
                       <div className="grid grid-cols-2 gap-2">
                          <Button variant={selectedDecision === "pass" ? "default" : "outline"} className={`h-10 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "pass" ? "bg-success text-success-foreground border-transparent" : "hover:bg-success/5 hover:text-success"}`} onClick={() => setSelectedDecision("pass")}>
                             <CheckCircle2 size={16} className="mr-2" /> Unconditional Pass
                          </Button>
                          <Button variant={selectedDecision === "minor-corrections" ? "default" : "outline"} className={`h-10 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "minor-corrections" ? "bg-status-warning text-status-warning-foreground border-transparent" : "hover:bg-status-warning/5 hover:text-status-warning"}`} onClick={() => setSelectedDecision("minor-corrections")}>
                             <AlertTriangle size={16} className="mr-2" /> Minor Corrections
                          </Button>
                          <Button variant={selectedDecision === "major-corrections" ? "default" : "outline"} className={`h-10 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "major-corrections" ? "bg-destructive text-destructive-foreground border-transparent" : "hover:bg-destructive/5 hover:text-destructive"}`} onClick={() => setSelectedDecision("major-corrections")}>
                             <AlertTriangle size={16} className="mr-2" /> Major Corrections
                          </Button>
                          <Button variant={selectedDecision === "fail" ? "default" : "outline"} className={`h-10 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "fail" ? "bg-muted text-foreground border-transparent" : "hover:bg-muted/10 hover:text-foreground"}`} onClick={() => setSelectedDecision("fail")}>
                             <XCircle size={16} className="mr-2" /> Fail
                          </Button>
                       </div>

                       <div className="space-y-2 pt-2">
                          <label className="text-xs font-bold text-foreground">Official Final Corrections (If Any)</label>
                          <Textarea placeholder="Extract the core amendments mandated by the board to complete before Final Clearance..." className="min-h-[100px] text-sm" />
                       </div>
                    </div>
                    <DialogFooter>
                       <Button variant="outline" className="text-xs font-bold uppercase">Cancel</Button>
                       <Button className="bg-success text-success-foreground text-xs font-bold uppercase" onClick={() => recordDecision(candidate.student)} disabled={!selectedDecision}>Save Decision</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
             </div>

          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
