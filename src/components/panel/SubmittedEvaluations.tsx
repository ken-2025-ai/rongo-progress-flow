import { motion } from "framer-motion";
import { 
  FileBarChart, Search, CheckCircle2,
  Users, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState } from "react";

const HISTORY = [
  {
    id: 1,
    student: "Jane Kipkogei",
    evaluationType: "School Seminar",
    date: "2026-03-01",
    myDecision: "Pass",
    myScore: 82,
    consensus: {
       averageScore: 78,
       majorityVerdict: "Minor Corrections",
       hasConflict: true,
       note: "2 Examiners: Pass, 1 Examiner: Minor Corrections"
    }
  }
];

export function SubmittedEvaluations() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="text-status-warning" />
            Submitted Evaluations
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Archived evaluation reports and Panel Consensus visualizations.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search by candidate name..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
         <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Historical Logs</h3>
         </div>
         
         <Table>
           <TableHeader className="bg-background">
             <TableRow>
               <TableHead className="font-bold">Candidate</TableHead>
               <TableHead className="font-bold">My Verdict</TableHead>
               <TableHead className="font-bold border-l border-border/50">Overall Panel Consensus</TableHead>
               <TableHead className="text-right font-bold">Actions</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {HISTORY.filter(h => h.student.toLowerCase().includes(searchTerm.toLowerCase())).map((record) => (
               <TableRow key={record.id}>
                 <TableCell className="font-medium text-foreground align-top pt-4">
                    <div>
                       <span className="block font-bold text-[15px]">{record.student}</span>
                       <Badge variant="outline" className="text-[9px] uppercase tracking-wider mt-1.5 bg-muted/30">{record.evaluationType}</Badge>
                       <p className="text-[10px] uppercase font-bold text-muted-foreground mt-2">{record.date}</p>
                    </div>
                 </TableCell>

                 <TableCell className="align-top pt-4">
                    <div className="flex flex-col gap-2">
                       <span className={`text-xs font-bold px-2 py-1 rounded w-fit ${record.myDecision === 'Pass' ? 'bg-success/10 text-success' : 'bg-status-warning/10 text-status-warning'}`}>
                          {record.myDecision}
                       </span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          Score: <span className="text-secondary text-sm">{record.myScore}/100</span>
                       </span>
                    </div>
                 </TableCell>

                 <TableCell className="align-top pt-4 border-l border-border/50 bg-secondary/5">
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black text-muted-foreground flex items-center gap-1"><Users size={12}/> Average Score</span>
                          <span className="text-sm font-black text-foreground">{record.consensus.averageScore}/100</span>
                       </div>
                       
                       <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black text-muted-foreground">Majority Vote</span>
                          <span className="text-xs font-bold text-status-warning">{record.consensus.majorityVerdict}</span>
                       </div>

                       {record.consensus.hasConflict && (
                          <div className="bg-destructive/10 text-destructive p-2 rounded flex items-start gap-2 border border-destructive/20 mt-1">
                             <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                             <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase underline">Decision Conflict</span>
                                <span className="text-[10px] font-medium leading-tight mt-0.5">{record.consensus.note}</span>
                             </div>
                          </div>
                       )}
                    </div>
                 </TableCell>

                 <TableCell className="text-right align-top pt-4">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase transition-colors">
                       View My Report
                    </Button>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
