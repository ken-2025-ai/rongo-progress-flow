import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Filter, MoreHorizontal, User, FileText, 
  CheckCircle2, AlertTriangle, Clock, Download, ExternalLink,
  ChevronRight, ArrowUpRight
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Sheet, SheetContent, SheetHeader, 
  SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { StudentDetailPanel } from "./StudentDetailPanel";
import { containerVariants, itemVariants } from "@/lib/animations";

const STUDENTS = [
  { 
    id: "1", 
    name: "Alex Kipronoh", 
    dept: "IHRS", 
    stage: "Department Level", 
    lastSubmission: "Mar 15, 2026", 
    status: "Ready for Review",
    risk: "none"
  },
  { 
    id: "2", 
    name: "Sarah Omolo", 
    dept: "CMJ", 
    stage: "School Level", 
    lastSubmission: "Feb 28, 2026", 
    status: "Corrections Pending",
    risk: "high"
  },
  { 
    id: "3", 
    name: "John Musyoka", 
    dept: "IHRS", 
    stage: "PG Examination", 
    lastSubmission: "Mar 10, 2026", 
    status: "Under Examination",
    risk: "none"
  },
  { 
    id: "4", 
    name: "Faith Chebet", 
    dept: "CMJ", 
    stage: "Department Level", 
    lastSubmission: "Jan 12, 2026", 
    status: "Overdue",
    risk: "urgent"
  },
];

export function MyStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filteredStudents = STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Risk Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-4">
          <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-destructive">Urgent Attention (2)</h3>
            <p className="text-[11px] text-destructive/80 mt-1">Students stuck in stage for more than 60 days.</p>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/20 flex items-start gap-4">
          <div className="p-2 bg-status-warning/10 rounded-lg text-status-warning">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-status-warning">Pending Reviews (5)</h3>
            <p className="text-[11px] text-status-warning/80 mt-1">Submissions awaiting your feedback.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary">Seminar Ready (3)</h3>
            <p className="text-[11px] text-primary/80 mt-1">Students cleared for presentation booking.</p>
          </div>
        </motion.div>
      </div>

      {/* Main Working Table */}
      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Search by name or department..." 
              className="pl-10 h-10 rounded-lg bg-muted/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter size={16} />
              Filter
            </Button>
            <Button size="sm" className="bg-primary text-white hover:bg-primary/90">
              Download Full Export
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-bold">Student Name</TableHead>
              <TableHead className="font-bold text-center">Dept</TableHead>
              <TableHead className="font-bold">Current Stage</TableHead>
              <TableHead className="font-bold">Last Submission</TableHead>
              <TableHead className="font-bold">Status Badge</TableHead>
              <TableHead className="text-right font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/10 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {student.name.charAt(0)}
                    </div>
                    {student.name}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{student.dept}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold">{student.stage}</span>
                    <div className="h-1 w-24 bg-muted rounded-full">
                      <div className="h-full bg-secondary rounded-full w-1/3" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs font-medium text-muted-foreground">{student.lastSubmission}</TableCell>
                <TableCell>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    student.status === "Ready for Review" ? "bg-primary/10 text-primary" :
                    student.status === "Corrections Pending" ? "bg-status-warning/10 text-status-warning" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {student.status}
                  </span>
                  {student.risk === "urgent" && (
                    <div className="mt-1 flex items-center gap-1 text-[9px] text-destructive font-bold uppercase animate-pulse">
                      <AlertTriangle size={10} /> Urgent Attention
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(student)} className="gap-2 hover:bg-primary/10 hover:text-primary">
                        View Details
                        <ArrowUpRight size={14} />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="sm:max-w-xl overflow-y-auto w-full p-0 border-l border-border/50">
                      {selectedStudent && <StudentDetailPanel student={selectedStudent} />}
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
