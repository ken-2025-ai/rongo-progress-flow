import { motion } from "framer-motion";
import { 
  Shield, CheckCircle2, XCircle, Search, 
  BookOpen, FileText, ArrowUpRight, ShieldCheck, Download,
  ExternalLink
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

const CANDIDATES = [
  { 
    id: 1, 
    name: "John Musyoka", 
    dept: "IHRS", 
    thesisVersion: "v5_final_post_school.pdf",
    schoolDecision: "Cleared for PG Examination",
    correctionsStatus: "Verified",
    stage: "Awaiting PG Clearance"
  }
];

export function ThesisReadinessCheck() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clearedCandidate, setClearedCandidate] = useState<string | null>(null);

  const handleClearance = (name: string) => {
    setClearedCandidate(name);
    toast.success(`Academic Clearance Granted for ${name}`, {
      description: "Candidate has been officially forwarded to the Postgraduate Dean.",
      duration: 5000,
    });
  };

  const generatePDF = () => {
     toast.info("Generating Clearance Certificate...", {
        description: "Downloading PDF with official clearance ID.",
     });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="text-secondary" />
            Thesis Readiness & PG Clearance
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Final academic screening before forwarding candidates to Postgraduate School.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search candidates..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {CANDIDATES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((candidate) => (
          <motion.div key={candidate.id} variants={itemVariants} className={`card-shadow rounded-xl overflow-hidden border transition-all ${clearedCandidate === candidate.name ? 'border-success bg-success/5' : 'border-border bg-card'}`}>
             <div className="p-1 border-b border-border/50 bg-secondary/10"></div>
             <div className="p-6 flex flex-col xl:flex-row gap-8">
                
                {/* Information Column */}
                <div className="flex-1 space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                            {candidate.name} 
                            {clearedCandidate === candidate.name && (
                               <Badge variant="outline" className="bg-success text-success-foreground border-transparent gap-1 animate-in fade-in zoom-in">
                                  <ShieldCheck size={12} /> PG Cleared
                               </Badge>
                            )}
                         </h3>
                         <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{candidate.dept}</Badge>
                            <span className="text-xs font-semibold text-muted-foreground italic flex items-center gap-1">
                               Status: {clearedCandidate === candidate.name ? 'Forwarded to PG Dean' : candidate.stage}
                            </span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                         <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><FileText size={14}/> Academic Verification</h4>
                         <ul className="space-y-2.5">
                            <li className="flex justify-between items-center text-sm font-medium">
                               <span className="text-muted-foreground">Dept Clearance:</span>
                               <span className="flex items-center gap-1 text-success"><CheckCircle2 size={14}/> Verified</span>
                            </li>
                            <li className="flex justify-between items-center text-sm font-medium">
                               <span className="text-muted-foreground">School Seminar:</span>
                               <span className="flex items-center gap-1 text-success"><CheckCircle2 size={14}/> Passed</span>
                            </li>
                            <li className="flex justify-between items-center text-sm font-medium">
                               <span className="text-muted-foreground">Corrections:</span>
                               <span className="flex items-center gap-1 text-success"><CheckCircle2 size={14}/> Completed</span>
                            </li>
                         </ul>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                         <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><BookOpen size={14}/> Final Thesis Document</h4>
                         <div className="flex items-center gap-3 mt-2 bg-background p-3 rounded-lg border border-border cursor-pointer hover:border-primary transition-colors">
                            <div className="p-2 bg-primary/10 text-primary rounded">
                               <FileText size={18} />
                            </div>
                            <div className="flex-1">
                               <p className="text-sm font-bold text-foreground truncate max-w-[150px]">{candidate.thesisVersion}</p>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Checked Plagiarism: 8%</p>
                            </div>
                            <ExternalLink size={16} className="text-muted-foreground" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Actions Column */}
                <div className="w-full xl:w-80 flex flex-col gap-4 justify-center bg-card p-6 rounded-xl border border-border/50 shadow-inner">
                   {clearedCandidate === candidate.name ? (
                      <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                         <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck size={32} />
                         </div>
                         <div>
                            <h4 className="font-black text-foreground text-lg">Clearance Generated</h4>
                            <p className="text-[12px] text-muted-foreground mt-1 font-mono bg-muted py-1 rounded">ID: RU-PG-{new Date().getFullYear()}-00{candidate.id}XX</p>
                         </div>
                         <Button className="w-full h-10 gap-2 bg-secondary hover:bg-secondary/90 text-xs font-bold uppercase transition-all" onClick={generatePDF}>
                            <Download size={14} /> Download Certificate
                         </Button>
                      </div>
                   ) : (
                      <>
                         <div className="text-center mb-2">
                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Final School Authority</h4>
                         </div>
                         
                         <Dialog>
                           <DialogTrigger asChild>
                             <Button className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground text-sm font-bold shadow-lg shadow-success/20 uppercase tracking-wider">
                                Grant PG Clearance
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle className="flex items-center gap-2">
                                  <ShieldCheck className="text-success" /> Confirm Academic Clearance
                               </DialogTitle>
                             </DialogHeader>
                             <div className="py-4 space-y-4">
                                <p className="text-sm text-muted-foreground">You are officially certifying that <strong className="text-foreground">{candidate.name}</strong> has met all school-level requirements. They will be forwarded to the Postgraduate Dean for external examination assignment.</p>
                                <div className="bg-success/10 p-3 rounded-lg border border-success/20 text-xs font-bold text-success flex items-start gap-2">
                                   <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                                   This action will lock the student's department/school timeline and issue a Clearance ID.
                                </div>
                             </div>
                             <DialogFooter>
                               <Button variant="outline" className="text-xs font-bold uppercase">Cancel</Button>
                               <Button className="bg-success text-success-foreground hover:bg-success/90 text-xs font-bold uppercase" onClick={() => handleClearance(candidate.name)}>Confirm Clearance</Button>
                             </DialogFooter>
                           </DialogContent>
                         </Dialog>

                         <Dialog>
                           <DialogTrigger asChild>
                             <Button variant="outline" className="w-full h-10 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-bold uppercase">
                                Return for Further Work
                             </Button>
                           </DialogTrigger>
                           <DialogContent>
                             <DialogHeader>
                               <DialogTitle>Return Thesis for Improvement</DialogTitle>
                             </DialogHeader>
                             <div className="space-y-4 py-4">
                                <p className="text-xs text-muted-foreground">If administrative or format issues persist, return to the student's supervisor panel before clearing to PG School.</p>
                                <label className="text-xs font-bold text-foreground">Specify Issues</label>
                                <Textarea placeholder="e.g. Formatting does not strictly adhere to the updated PG handbook guidelines..." />
                             </div>
                             <DialogFooter>
                               <Button variant="outline">Cancel</Button>
                               <Button variant="destructive">Return to Supervisor</Button>
                             </DialogFooter>
                           </DialogContent>
                         </Dialog>
                      </>
                   )}
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
