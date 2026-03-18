import { motion } from "framer-motion";
import { 
  Users, Search, BookmarkCheck, ShieldCheck, FileCheck, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const CANDIDATES = [
  { 
    id: 1, 
    name: "John Musyoka", 
    dept: "IHRS", 
    programme: "MSc Health Informatics",
    title: "Predictive Modeling of Outbreak Patterns",
    clearanceId: "RU-PG-2026-001XX",
    thesisVersion: "v5_final_post_school.pdf", 
    status: "Awaiting Dean Approval"
  }
];

export function CandidatesReady() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (name: string) => {
    toast.success(`Thesis Approved for Examination: ${name}`, {
      description: "Candidate moved to Under Examination. Examiner assignment unlocked.",
      duration: 5000
    });
  };

  const handleReturn = (name: string) => {
    toast.error(`Thesis Returned Contextually: ${name}`, {
      description: "Candidate returned to School Coordinator.",
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Candidates Ready for Examination
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Displaying only students explicitly <strong className="text-foreground">Cleared by School Level</strong> with registered PG Clearance IDs.
          </p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search candidate or RU-PG-ID..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
         <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Examination Gateway</h3>
         </div>
         
         <Table>
           <TableHeader className="bg-background">
             <TableRow>
               <TableHead className="font-bold">Candidate</TableHead>
               <TableHead className="font-bold">Programme Information</TableHead>
               <TableHead className="font-bold">Clearance & Draft</TableHead>
               <TableHead className="text-right font-bold">Initial Action</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {CANDIDATES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((candidate) => (
               <TableRow key={candidate.id}>
                 <TableCell className="font-medium text-foreground align-top pt-4">
                    <div>
                       <span className="block font-bold text-[15px]">{candidate.name}</span>
                       <Badge variant="outline" className="text-[9px] uppercase tracking-wider mt-1.5 bg-muted/30">{candidate.dept}</Badge>
                    </div>
                 </TableCell>
                 <TableCell className="align-top pt-4">
                    <div className="flex flex-col gap-1 text-sm max-w-xs">
                       <span className="font-semibold text-foreground truncate" title={candidate.title}>{candidate.title}</span>
                       <span className="text-xs text-muted-foreground">{candidate.programme}</span>
                    </div>
                 </TableCell>
                 <TableCell className="align-top pt-4">
                    <div className="flex flex-col gap-2">
                       <Badge variant="default" className="bg-success/10 text-success border-success/20 w-fit gap-1 text-[10px] font-mono">
                          <ShieldCheck size={12} /> {candidate.clearanceId}
                       </Badge>
                       <span className="text-xs font-semibold underline decoration-border underline-offset-4 cursor-pointer hover:text-primary transition-colors flex items-center gap-1">
                          <FileCheck size={14} className="text-primary" /> {candidate.thesisVersion}
                       </span>
                    </div>
                 </TableCell>
                 <TableCell className="text-right align-top pt-4">
                    <div className="flex justify-end gap-2 flex-col sm:flex-row">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-destructive/30 text-destructive hover:bg-destructive/10">Deny & Return</Button>
                         </DialogTrigger>
                         <DialogContent>
                           <DialogHeader>
                             <DialogTitle>Return to School Level</DialogTitle>
                           </DialogHeader>
                           <div className="space-y-4 py-4">
                              <p className="text-xs text-muted-foreground">If PG School standards are not met, return the candidate to the School Coordinator's desk.</p>
                              <label className="text-xs font-bold text-foreground">Deficiencies Noted</label>
                              <Textarea placeholder="Define missing documents, critical formatting errors, or procedural issues..." />
                           </div>
                           <DialogFooter>
                             <Button variant="outline">Cancel</Button>
                             <Button variant="destructive" onClick={() => handleReturn(candidate.name)}>Return to School</Button>
                           </DialogFooter>
                         </DialogContent>
                       </Dialog>
                       
                       <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-success-foreground text-[10px] font-bold uppercase gap-1" onClick={() => handleApprove(candidate.name)}>
                          Approve for Exam
                       </Button>
                    </div>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
