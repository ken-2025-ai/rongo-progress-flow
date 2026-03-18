import { motion } from "framer-motion";
import { 
  Users, Search, CheckCircle2, 
  XCircle, Clock, Filter, AlertTriangle, ArrowRight, BookOpen 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

const QUEUE = [
  { 
    id: 1, 
    student: "Alex Kipronoh", 
    dept: "IHRS", 
    deptDecision: "Pass",
    corrections: "Verified by Supervisor",
    thesisVersion: "v4_school_ready.pdf", 
    requestedDate: "Third Thursday (May 21)", 
    status: "Pending Booking"
  },
  { 
    id: 2, 
    student: "John Musyoka", 
    dept: "IHRS", 
    deptDecision: "Minor Corrections",
    corrections: "Verified by Supervisor",
    thesisVersion: "v5_final.pdf", 
    requestedDate: "Third Thursday (April 16)", 
    status: "Pending Booking"
  },
];

export function SchoolSeminarQueue() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = (action: string, studentName: string) => {
    toast.success(`Booking ${action} for ${studentName}`, {
      description: "Student will be presented on the Third Thursday school slot."
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="text-primary" />
            Students Awaiting School Seminar
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Displaying only candidates explicitly <strong className="text-foreground">Cleared by Department</strong>.
          </p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search candidate names..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
         <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Eligibility Gateway</h3>
            <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
               <Filter size={14} /> Filter Queue
            </Button>
         </div>
         
         <Table>
           <TableHeader className="bg-background">
             <TableRow>
               <TableHead className="font-bold">Candidate</TableHead>
               <TableHead className="font-bold">Department Clearance</TableHead>
               <TableHead className="font-bold">Thesis Draft</TableHead>
               <TableHead className="font-bold">Requested Date</TableHead>
               <TableHead className="text-right font-bold">Scheduling</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {QUEUE.filter(r => r.student.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
               <TableRow key={req.id}>
                 <TableCell className="font-medium text-foreground">
                    <div>
                       <span className="block font-bold">{req.student}</span>
                       <Badge variant="outline" className="text-[9px] uppercase tracking-wider mt-1 bg-muted/30">{req.dept}</Badge>
                    </div>
                 </TableCell>
                 <TableCell>
                    <div className="flex flex-col gap-1 text-xs">
                       <span className="flex items-center gap-1.5 font-bold text-success">
                          <CheckCircle2 size={12} /> {req.deptDecision}
                       </span>
                       <span className="flex items-center gap-1.5 font-bold text-muted-foreground">
                          <CheckCircle2 size={12} className="text-secondary" /> {req.corrections}
                       </span>
                    </div>
                 </TableCell>
                 <TableCell>
                    <div className="flex items-center gap-2">
                       <BookOpen size={14} className="text-primary" />
                       <span className="text-xs font-semibold underline decoration-border underline-offset-4 cursor-pointer hover:text-primary transition-colors">{req.thesisVersion}</span>
                    </div>
                 </TableCell>
                 <TableCell className="text-xs font-bold text-foreground">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
                       {req.requestedDate}
                    </Badge>
                 </TableCell>
                 <TableCell className="text-right">
                    <div className="flex justify-end gap-2 flex-col sm:flex-row">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase border-destructive/30 text-destructive hover:bg-destructive/10">Return to Dept</Button>
                         </DialogTrigger>
                         <DialogContent>
                           <DialogHeader>
                             <DialogTitle>Return Student to Department</DialogTitle>
                           </DialogHeader>
                           <div className="space-y-4 py-4">
                              <p className="text-xs text-muted-foreground">If academic standards are not met, you can return the candidate to the department level for revision.</p>
                              <label className="text-xs font-bold text-foreground">Reason for Return</label>
                              <Textarea placeholder="e.g. Corrections from Department Seminar were not adequately addressed in v4_school_ready.pdf..." />
                           </div>
                           <DialogFooter>
                             <Button variant="outline">Cancel</Button>
                             <Button variant="destructive" onClick={() => handleAction("Returned", req.student)}>Return to Department</Button>
                           </DialogFooter>
                         </DialogContent>
                       </Dialog>
                       <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-[10px] font-bold uppercase" onClick={() => handleAction("Approved", req.student)}>
                          Approve 3rd Thursday
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
