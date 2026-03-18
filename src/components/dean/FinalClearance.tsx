import { motion } from "framer-motion";
import { 
  Sparkles, CheckCircle2, GraduationCap, ShieldCheck, 
  Search, BookOpen, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState } from "react";
import confetti from "canvas-confetti";

const COMPLETIONS = [
  {
    id: 1,
    student: "John Musyoka",
    programme: "MSc Health Informatics",
    verdict: "Minor Corrections",
    correctionsStatus: "Verified by PG Dean",
    finalThesis: "v6_bound_final.pdf",
    status: "Awaiting Final Clearance",
  }
];

export function FinalClearance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCleared, setIsCleared] = useState(false);

  const handleFinalClearance = (name: string) => {
    setIsCleared(true);
    toast.success(`GRADUATION AUTHORIZED: ${name}`, {
      description: "Student's research journey is 100% complete. Eligible for graduation roster.",
      icon: <GraduationCap />,
      duration: 8000
    });
    
    // Playful confetti UI feedback for completing the monumental journey
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#059669', '#34d399', '#ffffff']
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="text-success" />
            Final Clearance & Graduation
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Authorize completion of the postgraduate lifecycle. Generates the final Letter of Award.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search verified completions..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {COMPLETIONS.filter(c => c.student.toLowerCase().includes(searchTerm.toLowerCase())).map((candidate) => (
          <motion.div key={candidate.id} variants={itemVariants} className={`card-shadow rounded-xl overflow-hidden border transition-all ${isCleared ? 'border-success bg-success/5' : 'border-success/50 bg-background'}`}>
             <div className="p-1 border-b border-border/50 bg-success/20"></div>
             <div className="p-6 flex flex-col xl:flex-row gap-8">
                
                {/* Information Column */}
                <div className="flex-[2] space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                            {candidate.student} 
                            {isCleared && (
                               <Badge variant="outline" className="bg-success text-success-foreground border-transparent gap-1 font-bold tracking-widest uppercase animate-in fade-in zoom-in">
                                  <GraduationCap size={14} /> Journey Complete
                               </Badge>
                            )}
                         </h3>
                         <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-semibold text-muted-foreground italic flex items-center gap-1">
                               {candidate.programme}
                            </span>
                         </div>
                      </div>
                      {!isCleared && (
                         <Badge variant="outline" className="bg-success/10 text-success border-transparent uppercase tracking-wider text-[10px] animate-pulse glow-success">
                            {candidate.status}
                         </Badge>
                      )}
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Examination Results */}
                      <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                         <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><ShieldCheck size={14}/> Examination Verdict</h4>
                         <p className="text-sm font-bold text-success flex items-center gap-1.5"><CheckCircle2 size={16}/> {candidate.verdict}</p>
                         <p className="text-[10px] uppercase font-bold text-muted-foreground mt-3 pt-3 border-t border-border/50">{candidate.correctionsStatus}</p>
                      </div>

                      {/* Final Document */}
                      <div className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                         <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><BookOpen size={14}/> Bound Copy Received</h4>
                         <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded border border-border">
                            <BookOpen size={16} className="text-success" />
                            <span className="text-xs font-bold truncate text-success underline decoration-success/30 underline-offset-4 cursor-pointer">{candidate.finalThesis}</span>
                         </div>
                         <p className="text-[10px] uppercase font-bold text-success/70 mt-3 pt-3 border-t border-border/50 flex flex-col gap-0.5">
                            <span className="text-muted-foreground">Library Deposit: ✅ Done</span>
                         </p>
                      </div>
                   </div>
                </div>

                {/* Locking Column */}
                <div className="w-full xl:w-80 flex flex-col gap-4 justify-center bg-card p-6 rounded-xl border border-border shadow-md">
                   {isCleared ? (
                      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                         <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto shadow-glow shadow-success/40">
                            <GraduationCap size={40} className="animate-bounce mt-2" />
                         </div>
                         <div>
                            <h4 className="font-black text-foreground text-lg uppercase tracking-wider text-success">Awarded</h4>
                            <p className="text-[12px] text-muted-foreground mt-1 bg-background py-1.5 border border-border shadow-inner rounded-md px-2 font-mono break-all font-bold">
                               TX-GRAD-RU-2026-X99AB
                            </p>
                         </div>
                         <Button className="w-full h-10 gap-2 bg-success text-success-foreground hover:bg-success/90 text-xs font-bold uppercase transition-all shadow-lg shadow-success/20">
                            <Download size={14} /> Letter of Completion
                         </Button>
                      </div>
                   ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full h-14 bg-gradient-to-br from-success to-emerald-600 hover:from-success hover:to-success text-success-foreground text-sm font-bold shadow-xl shadow-success/30 uppercase tracking-widest transition-all"
                          >
                             Approve Final Degree
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-success">
                               <Sparkles /> Grant Terminal Academic Clearance
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                             <p className="text-sm text-muted-foreground">By confirming this action, you are officially signing off on <strong className="text-foreground">{candidate.student}'s</strong> Master's Degree.</p>
                             <ul className="text-xs space-y-2 bg-success/5 p-4 rounded-lg border border-success/20 font-medium">
                                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success"/> Final Thesis Accepted & Bound</li>
                                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success"/> Supervisor & Examiner Correction Sign-offs Complete</li>
                                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-success"/> Plagiarism score logged in PG System</li>
                             </ul>
                             <div className="bg-primary/10 p-3 rounded-lg border border-primary/20 text-xs font-bold text-primary flex items-start gap-2 mt-4">
                                <GraduationCap size={16} className="shrink-0 mt-0.5" />
                                This marks the COMPLETE END of the student lifecycle timeline.
                             </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className="text-xs font-bold uppercase border-border">Cancel</Button>
                            <Button className="bg-success text-success-foreground hover:bg-success/90 text-xs font-bold uppercase tracking-wider" onClick={() => handleFinalClearance(candidate.student)}>Award Degree</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                   )}
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
