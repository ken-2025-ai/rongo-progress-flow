import { motion } from "framer-motion";
import { 
  FileBarChart, Search, Filter, CheckCircle2, 
  AlertTriangle, PlayCircle, Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState } from "react";

const DECISION_LOGS = [
  { 
    id: 1, 
    date: "April 16, 2026", 
    student: "John Musyoka", 
    dept: "IHRS", 
    level: "School Seminar",
    decision: "Cleared for PG Examination",
    recordedBy: "Prof. Oduor (School Admin)"
  },
  { 
    id: 2, 
    date: "March 19, 2026", 
    student: "Mercy Wanjala", 
    dept: "CMJ", 
    level: "School Seminar",
    decision: "Major Corrections",
    recordedBy: "Prof. Oduor (School Admin)"
  },
];

export function SchoolDecisions() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="text-secondary" />
            School Decision History
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Official audit log of all 3rd Thursday School Seminar outcomes.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search records..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
         <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Historical Records</h3>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
               <Filter size={14} /> Filter Log
            </Button>
         </div>
         
         <Table>
           <TableHeader className="bg-background">
             <TableRow>
               <TableHead className="font-bold whitespace-nowrap">Date Recorded</TableHead>
               <TableHead className="font-bold">Candidate Identity</TableHead>
               <TableHead className="font-bold whitespace-nowrap">Seminar Level</TableHead>
               <TableHead className="font-bold text-center">Final Consensus</TableHead>
               <TableHead className="text-right font-bold whitespace-nowrap">Recorded By</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {DECISION_LOGS.filter(s => s.student.toLowerCase().includes(searchTerm.toLowerCase())).map((log) => (
               <TableRow key={log.id}>
                 <TableCell className="font-medium text-xs text-muted-foreground uppercase">{log.date}</TableCell>
                 <TableCell className="font-bold text-foreground">
                    <div className="flex flex-col">
                       {log.student}
                       <Badge variant="outline" className="text-[9px] uppercase tracking-wider w-fit mt-1">{log.dept}</Badge>
                    </div>
                 </TableCell>
                 <TableCell className="text-xs font-semibold">{log.level}</TableCell>
                 <TableCell className="text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1 border ${
                       log.decision === "Cleared for PG Examination" ? "bg-success/10 text-success border-success/20" : 
                       log.decision.includes("Minor") ? "bg-status-warning/10 text-status-warning border-status-warning/20" : 
                       log.decision.includes("Major") ? "bg-destructive/10 text-destructive border-destructive/20" :
                       "bg-muted text-foreground border-border"
                    }`}>
                       {log.decision.includes("Cleared") && <CheckCircle2 size={10} />}
                       {log.decision.includes("Minor") && <AlertTriangle size={10} />}
                       {log.decision.includes("Major") && <AlertTriangle size={10} />}
                       {log.decision.includes("Repeat") && <PlayCircle size={10} />}
                       {log.decision}
                    </span>
                 </TableCell>
                 <TableCell className="text-right">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center justify-end gap-1.5">
                       <Shield size={12} className="text-secondary/50" /> {log.recordedBy}
                    </span>
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
