import { motion } from "framer-motion";
import { FileBarChart, CheckCircle2, XCircle, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState } from "react";

const REPORTS = [
  { 
    id: 1, 
    name: "Alex Kipronoh", 
    dept: "IHRS", 
    quarter: "Q1 2026", 
    submitted: "Today",
    summary: "Completed data collection in Narok County and began preliminary cleaning.",
  },
  { 
    id: 2, 
    name: "Faith Chebet", 
    dept: "CMJ", 
    quarter: "Q4 2025", 
    submitted: "4 days ago",
    summary: "Finalized literature review draft and submitted for supervisor review.",
  },
];

export function ProgressReportsReview() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleApprove = (name: string) => {
    toast.success(`Progress report approved for ${name}`, {
      description: "Report forwarded to Department Coordinator."
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileBarChart className="text-primary" />
            Quarterly Progress Reports
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Review and approve student research progress submissions.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search name or quarter..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {REPORTS.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((report) => (
          <motion.div key={report.id} variants={itemVariants} className="card-shadow rounded-xl bg-card border border-border overflow-hidden">
             <div className="p-5 flex flex-col justify-between h-full gap-6">
                <div className="space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-lg font-bold text-foreground">{report.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{report.dept}</Badge>
                         </div>
                      </div>
                      <div className="text-right">
                         <span className="text-xs font-bold text-foreground bg-muted p-1.5 rounded-md uppercase tracking-widest block mb-1">
                            {report.quarter}
                         </span>
                         <span className="text-[10px] text-muted-foreground font-semibold uppercase">{report.submitted}</span>
                      </div>
                   </div>

                   <div className="bg-muted/10 p-4 rounded-xl border border-border/40 space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Self-Reported Progress</h4>
                      <p className="text-sm font-medium leading-relaxed italic text-foreground/80 border-l-2 border-primary/50 pl-3">
                         "{report.summary}"
                      </p>
                      
                      <div className="pt-3 flex gap-4">
                         <Button variant="outline" size="sm" className="gap-2 text-xs font-bold uppercase h-8 bg-background">
                            <Download size={14} /> Full Form Data
                         </Button>
                         <Button variant="outline" size="sm" className="gap-2 text-xs font-bold uppercase h-8 bg-background">
                            <Download size={14} /> Attachments
                         </Button>
                      </div>
                   </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 mt-auto">
                   <Button className="flex-1 bg-success text-success-foreground hover:bg-success/90 text-[11px] font-bold uppercase gap-2 h-10" onClick={() => handleApprove(report.name)}>
                      <CheckCircle2 size={16} /> Approve Report
                   </Button>
                   <Button variant="outline" className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 text-[11px] font-bold uppercase gap-2 h-10">
                      <XCircle size={16} /> Request Changes
                   </Button>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
