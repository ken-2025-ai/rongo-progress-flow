import { motion } from "framer-motion";
import { 
  ClipboardCheck, Search, BookOpen, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight, PenTool, GitPullRequest
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
import { useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const EVALUATIONS = [
  {
    id: 1,
    student: "John Musyoka",
    programme: "MSc Health Informatics",
    title: "Predictive Modeling of Outbreak Patterns",
    evaluationType: "Viva Voce Evaluation",
    scheduledDate: "May 2, 2026",
    status: "Pending Review",
    thesisVersion: "v5_final_post_school.pdf",
    department: "IHRS",
    stage: "Awaiting Examiner Decision"
  }
];

export function MyEvaluations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState("");
  const [score, setScore] = useState(0);

  const handleSubmit = (name: string) => {
    toast.success(`Evaluation Submitted for ${name}`, {
      description: "Scores and recommendations sent to the PG Dean.",
      duration: 5000
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="text-primary" />
            My Evaluations
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Pending academic reviews assigned by the PG Dean or Department.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search thesis or student..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {EVALUATIONS.filter(e => e.student.toLowerCase().includes(searchTerm.toLowerCase())).map((evaluation) => (
          <motion.div key={evaluation.id} variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border flex flex-col xl:flex-row">
             
             {/* Info Section */}
             <div className="p-6 flex-1 border-b xl:border-b-0 xl:border-r border-border/50">
                <div className="flex justify-between items-start mb-4">
                   <Badge variant="outline" className="bg-primary/10 text-primary border-transparent uppercase tracking-wider text-[10px]">
                      {evaluation.evaluationType}
                   </Badge>
                   <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">{evaluation.scheduledDate}</span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{evaluation.student}</h3>
                <p className="text-sm font-semibold text-secondary mb-3">{evaluation.title}</p>
                <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground mb-6">
                   <span>{evaluation.programme}</span>
                   <span className="h-1 w-1 rounded-full bg-border"></span>
                   <span>{evaluation.department}</span>
                </div>

                <div className="flex items-center gap-4">
                   <Button variant="outline" size="sm" className="h-9 gap-2 text-xs font-bold bg-muted/30 border-border/50 shadow-sm">
                      <BookOpen size={14} className="text-primary" /> Download Draft: {evaluation.thesisVersion}
                   </Button>
                </div>
             </div>

             {/* Action Section */}
             <div className="p-6 w-full xl:w-[400px] bg-muted/10 flex flex-col justify-center">
                <div className="mb-4">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Status</p>
                   <p className="text-sm font-bold text-status-warning flex items-center gap-1.5 animate-pulse"><AlertTriangle size={14}/> {evaluation.status}</p>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 uppercase tracking-widest transition-all">
                       Open Academic Console
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-3xl h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                         <PenTool className="text-primary" /> Evaluation Console: <span className="text-foreground">{evaluation.student}</span>
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="py-4 space-y-8">
                       {/* Section 1: Review Notes */}
                       <div className="space-y-4">
                          <h4 className="text-sm font-bold border-b border-border/50 pb-2 flex items-center gap-2"><BookOpen size={16}/> 1. Structured Review Notes</h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Methodology & Design</label>
                                <Textarea className="h-24 text-xs" placeholder="Comments on research methods..." />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground">Originality & Contribution</label>
                                <Textarea className="h-24 text-xs" placeholder="Comments on academic contribution..." />
                             </div>
                          </div>
                       </div>

                       {/* Section 2: Rubric Scoring */}
                       <div className="space-y-4">
                          <h4 className="text-sm font-bold border-b border-border/50 pb-2 flex items-center gap-2"><ClipboardCheck size={16}/> 2. Rubric Scoring (0-100)</h4>
                          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                             <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">Total Aggregate Score</span>
                                <span className="text-lg font-black text-primary">{Math.min(100, Math.max(0, score))} / 100</span>
                             </div>
                             <Progress value={Math.min(100, Math.max(0, score))} className="h-2" />
                             <Input 
                               type="number" 
                               placeholder="Enter final calculated score" 
                               className="w-full mt-2 bg-background"
                               value={score || ""}
                               onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                             />
                          </div>
                       </div>

                       {/* Section 3: Recommendations */}
                       <div className="space-y-4">
                          <h4 className="text-sm font-bold border-b border-border/50 pb-2 flex items-center gap-2"><GitPullRequest size={16}/> 3. Final Academic Recommendation</h4>
                          <p className="text-xs text-muted-foreground">This exact recommendation will be logged for the PG Dean to finalize tracking workflow state changes.</p>
                          
                          <div className="grid grid-cols-2 gap-3">
                             <Button variant={selectedVerdict === "pass" ? "default" : "outline"} className={`h-10 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedVerdict === "pass" ? "bg-success text-success-foreground border-transparent" : "hover:bg-success/5 hover:text-success border-border/50"}`} onClick={() => setSelectedVerdict("pass")}>
                                <CheckCircle2 size={16} className="mr-2" /> Unconditional Pass
                             </Button>
                             <Button variant={selectedVerdict === "minor" ? "default" : "outline"} className={`h-10 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedVerdict === "minor" ? "bg-status-warning text-status-warning-foreground border-transparent" : "hover:bg-status-warning/5 hover:text-status-warning border-border/50"}`} onClick={() => setSelectedVerdict("minor")}>
                                <AlertTriangle size={16} className="mr-2" /> Minor Corrections
                             </Button>
                             <Button variant={selectedVerdict === "major" ? "default" : "outline"} className={`h-10 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedVerdict === "major" ? "bg-destructive/80 text-foreground border-transparent" : "hover:bg-destructive/10 hover:text-destructive border-border/50"}`} onClick={() => setSelectedVerdict("major")}>
                                <AlertTriangle size={16} className="mr-2 text-destructive" /> Major Corrections
                             </Button>
                             <Button variant={selectedVerdict === "fail" ? "default" : "outline"} className={`h-10 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedVerdict === "fail" ? "bg-muted text-foreground border-transparent" : "hover:bg-muted/10 border-border/50"}`} onClick={() => setSelectedVerdict("fail")}>
                                <XCircle size={16} className="mr-2" /> Fail
                             </Button>
                          </div>
                       </div>
                    </div>
                    
                    <DialogFooter className="border-t border-border/50 pt-4 mt-4">
                       <Button variant="outline" className="text-xs font-bold uppercase">Save Draft</Button>
                       <Button className="bg-primary text-primary-foreground text-xs font-bold uppercase shadow-md shadow-primary/20" onClick={() => handleSubmit(evaluation.student)} disabled={!selectedVerdict || score === 0}>Submit Official Evaluation</Button>
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
