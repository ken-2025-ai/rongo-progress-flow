import { motion } from "framer-motion";
import { 
  CalendarDays, Search, CheckCircle2, 
  XCircle, Clock, Filter, AlertTriangle, ArrowRight 
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

const REQUESTS = [
  { 
    id: 1, 
    student: "Alex Kipronoh", 
    dept: "IHRS", 
    supervisorStatus: "Approved", 
    requestedDate: "First Thursday (April 2)", 
    type: "Department Seminar",
    status: "Pending Scheduler"
  },
  { 
    id: 2, 
    student: "Faith Chebet", 
    dept: "CMJ", 
    supervisorStatus: "Approved", 
    requestedDate: "Second Thursday (April 9)", 
    type: "Department Seminar",
    status: "Pending Scheduler"
  },
  { 
    id: 3, 
    student: "John Musyoka", 
    dept: "IHRS", 
    supervisorStatus: "Pending", 
    requestedDate: "Third Thursday (April 16)", 
    type: "School Seminar",
    status: "Blocked"
  },
];

export function SeminarBookingRequests() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = (action: string, studentName: string) => {
    toast.success(`Booking ${action} for ${studentName}`, {
      description: "Student dashboard and calendars have been updated."
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="text-primary" />
            Seminar Booking Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Manage and schedule incoming student presentation requests.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search bookings..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* The Action Queue */}
        <motion.div variants={itemVariants} className="xl:col-span-3 card-shadow bg-card rounded-xl overflow-hidden border border-border">
           <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Pending Requests</h3>
              <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
                 <Filter size={14} /> Filter Queue
              </Button>
           </div>
           
           <Table>
             <TableHeader className="bg-background">
               <TableRow>
                 <TableHead className="font-bold">Student</TableHead>
                 <TableHead className="font-bold">Seminar Type</TableHead>
                 <TableHead className="font-bold">Requested Date</TableHead>
                 <TableHead className="font-bold">Supervisor</TableHead>
                 <TableHead className="text-right font-bold">Scheduling Action</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {REQUESTS.filter(r => r.student.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                 <TableRow key={req.id}>
                   <TableCell className="font-medium text-foreground">{req.student}</TableCell>
                   <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider ${
                         req.type.includes("School") ? "bg-secondary/10 text-secondary border-transparent" : "bg-primary/10 text-primary border-transparent"
                      }`}>
                         {req.type}
                      </Badge>
                   </TableCell>
                   <TableCell className="text-xs font-semibold">{req.requestedDate}</TableCell>
                   <TableCell>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center w-fit gap-1 ${
                         req.supervisorStatus === "Approved" ? "bg-success/10 text-success" : "bg-status-warning/10 text-status-warning"
                      }`}>
                         {req.supervisorStatus === "Approved" ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                         {req.supervisorStatus}
                      </span>
                   </TableCell>
                   <TableCell className="text-right">
                      {req.supervisorStatus === "Approved" ? (
                         <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-7 text-xs font-bold uppercase border-destructive/30 text-destructive hover:bg-destructive/10">Return</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Return Booking Request</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                   <label className="text-xs font-bold text-foreground">Reason for Return</label>
                                   <Textarea placeholder="e.g. Schedule is full, please rebook for next month..." />
                                </div>
                                <DialogFooter>
                                  <Button variant="outline">Cancel</Button>
                                  <Button variant="destructive" onClick={() => handleAction("Returned", req.student)}>Return Request</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" className="h-7 bg-success hover:bg-success/90 text-xs font-bold uppercase" onClick={() => handleAction("Approved", req.student)}>
                               Approve
                            </Button>
                         </div>
                      ) : (
                         <span className="text-[10px] text-muted-foreground uppercase font-bold flex items-center justify-end gap-1">
                            <AlertTriangle size={12} className="text-status-warning" /> Blocked
                         </span>
                      )}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </motion.div>

        {/* Visual Calendar Panel */}
        <motion.div variants={itemVariants} className="card-shadow bg-card rounded-xl border border-border overflow-hidden flex flex-col">
           <div className="p-4 bg-muted/30 border-b border-border text-center">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Department Calendar</h3>
              <p className="text-xl font-black text-foreground mt-1">April 2026</p>
           </div>
           
           <div className="p-4 flex-1 space-y-4">
              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary uppercase">1st Thursday</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Apr 2</Badge>
                 </div>
                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary/10">
                    <span className="text-[10px] font-bold text-muted-foreground">Dept Seminars</span>
                    <span className="text-xs font-black text-foreground">3 / 5 Slots</span>
                 </div>
              </div>

              <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-primary uppercase">2nd Thursday</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Apr 9</Badge>
                 </div>
                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-primary/10">
                    <span className="text-[10px] font-bold text-muted-foreground">Dept Seminars</span>
                    <span className="text-xs font-black text-foreground">5 / 5 Slots (Full)</span>
                 </div>
              </div>

              <div className="p-3 rounded-lg border border-secondary/20 bg-secondary/5 cursor-pointer hover:bg-secondary/10 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-secondary uppercase flex items-center gap-1"><AlertTriangle size={10} /> 3rd Thursday</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">Apr 16</Badge>
                 </div>
                 <div className="flex justify-between items-center mt-2 pt-2 border-t border-secondary/10">
                    <span className="text-[10px] font-bold text-muted-foreground">School Seminars</span>
                    <span className="text-xs font-black text-foreground">1 / 5 Slots</span>
                 </div>
              </div>
           </div>
           
           <div className="p-4 border-t border-border bg-muted/10">
              <Button variant="outline" className="w-full text-xs font-bold uppercase gap-2 h-9">
                 Manage Slots <ArrowRight size={14} />
              </Button>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
