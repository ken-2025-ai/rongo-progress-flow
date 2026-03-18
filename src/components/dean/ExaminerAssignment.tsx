import { motion } from "framer-motion";
import { 
  ClipboardCheck, Search, Users, Shield, BookOpen, AlertCircle
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

const APPROVED_CANDIDATES = [
  { 
    id: 1, 
    name: "John Musyoka", 
    programme: "MSc Health Informatics",
    thesisVersion: "v5_final_post_school.pdf", 
    status: "Awaiting Examiners",
    internalAssigned: false,
    externalAssigned: false
  }
];

export function ExaminerAssignment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [internal, setInternal] = useState<string>("");
  const [external, setExternal] = useState<string>("");

  const handleAssign = (name: string) => {
    toast.success(`Examiners Assigned for ${name}`, {
      description: "Thesis Version LOCKED. Examiners notified for review.",
      duration: 5000
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="text-secondary" />
            Examiner Assignment
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Appoint Internal & External reviewers and <strong className="text-foreground">Lock Thesis Version</strong>.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search approved candidates..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {APPROVED_CANDIDATES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((candidate) => (
          <motion.div key={candidate.id} variants={itemVariants} className="card-shadow rounded-xl overflow-hidden border border-border bg-card">
             <div className="p-1 border-b border-border/50 bg-secondary/10"></div>
             <div className="p-6 flex flex-col xl:flex-row gap-8">
                
                {/* Information Column */}
                <div className="flex-[2] space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                            {candidate.name} 
                         </h3>
                         <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-semibold text-muted-foreground italic flex items-center gap-1">
                               {candidate.programme}
                            </span>
                         </div>
                      </div>
                      <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-transparent uppercase tracking-wider text-[10px] animate-pulse">
                         {candidate.status}
                      </Badge>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Internal Selection */}
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                         <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><Users size={14}/> Internal Examiner</h4>
                         <Input 
                            placeholder="Type Faculty Name..." 
                            className="bg-background h-10 text-sm border-border/50 focus-visible:ring-primary/20" 
                            value={internal}
                            onChange={(e) => setInternal(e.target.value)}
                         />
                         <p className="text-[10px] text-muted-foreground mt-2 italic">Must be from the same or related department within Rongo University.</p>
                      </div>

                      {/* External Selection */}
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                         <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><Users size={14}/> External Examiner</h4>
                         <Input 
                            placeholder="Type Institution/Name..." 
                            className="bg-background h-10 text-sm border-border/50 focus-visible:ring-secondary/20" 
                            value={external}
                            onChange={(e) => setExternal(e.target.value)}
                         />
                         <p className="text-[10px] text-muted-foreground mt-2 italic">External peer reviewer outside Rongo University.</p>
                      </div>
                   </div>
                </div>

                {/* Locking Column */}
                <div className="w-full xl:w-80 flex flex-col gap-4 justify-center bg-muted/20 p-6 rounded-xl border border-border/50 shadow-inner">
                   <div className="bg-background p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                         <BookOpen size={16} className="text-primary" />
                         <span className="text-sm font-bold truncate">{candidate.thesisVersion}</span>
                      </div>
                      <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-primary/5 p-2 rounded border border-primary/10">
                         <AlertCircle size={14} className="text-primary shrink-0 mt-0.5" />
                         <span>Assigning examiners will permanently lock this thesis version. Re-uploads will be blocked until Viva is complete.</span>
                      </div>
                   </div>

                   <Dialog>
                     <DialogTrigger asChild>
                       <Button 
                         disabled={!internal || !external}
                         className="w-full h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-sm font-bold shadow-lg shadow-secondary/20 uppercase tracking-wider transition-all disabled:opacity-50 disabled:shadow-none"
                       >
                          Lock & Assign
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle className="flex items-center gap-2">
                            <Shield className="text-secondary" /> Confirm Lock & Assignment
                         </DialogTitle>
                       </DialogHeader>
                       <div className="py-4 space-y-4">
                          <p className="text-sm text-muted-foreground">You are officially dispatching <strong className="text-foreground">{candidate.name}'s</strong> thesis for evaluation.</p>
                          <ul className="text-xs space-y-2 bg-muted p-4 rounded-lg border border-border/50 font-medium">
                             <li>Internal: <strong className="text-foreground">{internal}</strong></li>
                             <li>External: <strong className="text-foreground">{external}</strong></li>
                          </ul>
                          <div className="bg-status-warning/10 p-3 rounded-lg border border-status-warning/20 text-xs font-bold text-status-warning flex items-start gap-2">
                             <AlertCircle size={16} className="shrink-0 mt-0.5" />
                             The candidate will no longer be able to modify the thesis draft.
                          </div>
                       </div>
                       <DialogFooter>
                         <Button variant="outline" className="text-xs font-bold uppercase">Cancel</Button>
                         <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs font-bold uppercase" onClick={() => handleAssign(candidate.name)}>Confirm Dispatch</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
