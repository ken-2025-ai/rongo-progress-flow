import { motion } from "framer-motion";
import { 
  GitBranch, Search, Filter, AlertTriangle, 
  ArrowRightCircle, CheckCircle2, History 
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
import { toast } from "sonner";

const STUDENTS = [
  { 
    id: 1, 
    name: "Alex Kipronoh", 
    dept: "IHRS", 
    currentStage: "Department Level",
    status: "Corrections Verified",
    supervisorStatus: "Approved",
    readyToAdvance: true
  },
  { 
    id: 2, 
    name: "Sarah Omolo", 
    dept: "CMJ", 
    currentStage: "Department Level",
    status: "Pending Corrections",
    supervisorStatus: "Reviewing",
    readyToAdvance: false
  },
];

export function StudentProgressControl() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAdvance = (student: string) => {
    toast.success(`${student} Advanced to School Level`, {
      description: "Student is now in the School Admin Queue."
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <GitBranch className="text-primary" />
            Student Progress Control
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Manually adjust student stages and forward cleared students to the School level.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search active students..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
         <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Department Roster</h3>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
               <Filter size={14} /> Filter Current Stage
            </Button>
         </div>
         
         <Table>
           <TableHeader className="bg-background">
             <TableRow>
               <TableHead className="font-bold">Student Name</TableHead>
               <TableHead className="font-bold">Programme</TableHead>
               <TableHead className="font-bold">Current Status</TableHead>
               <TableHead className="font-bold whitespace-nowrap">Supervisor Status</TableHead>
               <TableHead className="text-right font-bold">Stage Action</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {STUDENTS.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
               <TableRow key={student.id}>
                 <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <div className="leading-tight">
                         <span className="block">{student.name}</span>
                         <span className="text-[10px] text-muted-foreground font-semibold">{student.currentStage}</span>
                      </div>
                    </div>
                 </TableCell>
                 <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-muted/20">{student.dept}</Badge>
                 </TableCell>
                 <TableCell>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center w-fit gap-1 ${
                       student.status === "Corrections Verified" ? "bg-success/10 text-success" : "bg-status-warning/10 text-status-warning"
                    }`}>
                       {student.status === "Corrections Verified" ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                       {student.status}
                    </span>
                 </TableCell>
                 <TableCell>
                    <span className="text-xs font-semibold text-muted-foreground">{student.supervisorStatus}</span>
                 </TableCell>
                 <TableCell className="text-right">
                    {student.readyToAdvance ? (
                       <Button size="sm" className="h-8 bg-secondary hover:bg-secondary/90 text-xs font-bold uppercase tracking-wider w-full max-w-[200px]" onClick={() => handleAdvance(student.name)}>
                          Forward to School <ArrowRightCircle size={14} className="ml-1.5" />
                       </Button>
                    ) : (
                       <Button variant="outline" size="sm" disabled className="h-8 text-[10px] font-bold uppercase w-full max-w-[200px] border-dashed">
                          Incomplete Requirements
                       </Button>
                    )}
                 </TableCell>
               </TableRow>
             ))}
           </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
