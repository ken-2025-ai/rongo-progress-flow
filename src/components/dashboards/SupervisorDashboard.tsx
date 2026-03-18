import { motion } from "framer-motion";
import { 
  Users, AlertTriangle, Clock, CheckCircle2, 
  ArrowRight, Search, FileText, ChevronRight, BarChart 
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { containerVariants, itemVariants } from "@/lib/animations";

const STUDENTS = [
  { id: 1, name: "Omondi Okech", topic: "ML-Based Crop Disease Detection", stage: "First Draft", days: 18, status: "warning" },
  { id: 2, name: "Faith Nyambura", topic: "Blockchain in Land Registry", stage: "Ethics Clearance", days: 5, status: "on-track" },
  { id: 3, name: "Kevin Odhiambo", topic: "NLP for Dholuo Language Preservation", stage: "Data Collection", days: 32, status: "overdue" },
  { id: 4, name: "Mercy Chebet", topic: "Solar Microgrid Optimization", stage: "Final Submission Pending", days: 8, status: "on-track" },
  { id: 5, name: "Brian Mutua", topic: "IoT Water Quality Monitoring", stage: "Proposal Review", days: 25, status: "warning" },
];

const PENDING_REPORTS = [
  { id: 101, student: "Omondi Okech", type: "Q4 2025 Report", submitted: "March 12, 2026", urgency: "High" },
  { id: 102, student: "Kevin Odhiambo", type: "Q1 2026 Report", submitted: "March 15, 2026", urgency: "Normal" },
];

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  "on-track": { label: "On Track", classes: "bg-success/10 text-success border-success/20" },
  "warning": { label: "Stalled", classes: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  "overdue": { label: "Critical Delay", classes: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" },
};

export function SupervisorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      
      {/* KPI Command Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Assigned Students", value: "14", icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending Document Reviews", value: "3", icon: Clock, color: "text-status-warning", bg: "bg-status-warning/10" },
          { label: "Critical / Overdue Students", value: "2", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Clearances This Month", value: "4", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
        ].map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className="card-shadow rounded-2xl bg-card p-6 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-border/80 transition-all">
            <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity ${kpi.color}`}>
               <kpi.icon size={80} />
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${kpi.bg} shadow-inner`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
              <p className="text-3xl font-black text-foreground mt-1 tabular-nums">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Tracking Board */}
         <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/50 bg-muted/10">
               <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                     <BarChart className="text-primary"/> Active Supervision Board
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Track all mentees and identify bottlenecks proactively.</p>
               </div>
               <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input 
                     placeholder="Search student or topic..." 
                     className="pl-9 h-9 text-xs rounded-lg bg-background"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex-1 overflow-x-auto">
               <Table>
                 <TableHeader className="bg-muted/30">
                   <TableRow>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Candidate & Topic</TableHead>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Current Phase</TableHead>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-right text-muted-foreground">Idle Days</TableHead>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-center text-muted-foreground">Risk Level</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {[...STUDENTS]
                     .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.topic.toLowerCase().includes(searchTerm.toLowerCase()))
                     .sort((a, b) => b.days - a.days)
                     .map((s) => {
                     const statusInfo = STATUS_MAP[s.status];
                     return (
                       <TableRow key={s.id} className="cursor-pointer hover:bg-muted/20 transition-colors group" onClick={() => navigate("/students")}>
                         <TableCell className="py-4">
                            <span className="block font-bold text-sm text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                            <span className="block text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[250px]">{s.topic}</span>
                         </TableCell>
                         <TableCell>
                            <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-1 rounded inline-flex items-center gap-1.5 whitespace-nowrap border border-secondary/20">
                               <div className="h-1.5 w-1.5 rounded-full bg-secondary"/>
                               {s.stage}
                            </span>
                         </TableCell>
                         <TableCell className="text-right">
                            <span className={`text-sm font-black tabular-nums ${s.days > 20 ? 'text-destructive' : 'text-foreground'}`}>
                               {s.days}
                            </span>
                         </TableCell>
                         <TableCell className="text-center">
                           <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider border ${statusInfo.classes}`}>
                             {statusInfo.label}
                           </Badge>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
            </div>
         </motion.div>

         {/* Action Sidebar */}
         <motion.div variants={itemVariants} className="space-y-6">
            <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-5 border-b border-border/50 bg-status-warning/5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                     <FileText className="text-status-warning"/> Pending Document Reviews
                  </h3>
               </div>
               
               <div className="p-4 space-y-3 flex-1">
                 {PENDING_REPORTS.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                       <CheckCircle2 size={32} className="mb-2 text-success/50"/>
                       <p className="text-xs font-bold uppercase">All caught up</p>
                    </div>
                 ) : (
                    PENDING_REPORTS.map((r) => (
                      <div key={r.id} className="rounded-xl border border-border p-4 bg-background shadow-sm hover:shadow transition-shadow group cursor-pointer" onClick={() => navigate("/reports-review")}>
                        <div className="flex justify-between items-start mb-2">
                           <Badge variant="outline" className="bg-muted text-[9px] font-bold tracking-widest uppercase border-transparent">
                              {r.type}
                           </Badge>
                           {r.urgency === 'High' && (
                              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                           )}
                        </div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{r.student}</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wider">Submitted: {r.submitted}</p>
                        
                        <div className="mt-4 flex items-center gap-2">
                           <Button size="sm" className="h-7 text-[10px] font-bold uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                              Review
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground">
                              Dismiss
                           </Button>
                        </div>
                      </div>
                    ))
                 )}
               </div>
               
               <div className="p-4 border-t border-border/50 bg-muted/10">
                  <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary justify-between group" onClick={() => navigate("/reports-review")}>
                     Go to Review Desk <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
