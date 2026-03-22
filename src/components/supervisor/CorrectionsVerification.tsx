import { motion } from "framer-motion";
import { CheckCircle2, FileCheck2, XCircle, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState } from "react";

const VERIFICATIONS = [
  { 
    id: 1, 
    name: "Sarah Omolo", 
    dept: "CMJ", 
    level: "Departmental Seminar", 
    submitted: "1 day ago",
    items: [
      { id: 101, text: "Revise abstract to 300 words.", done: true },
      { id: 102, text: "Update Figure 4.1 citations.", done: true },
    ]
  },
  { 
    id: 2, 
    name: "John Musyoka", 
    dept: "IHRS", 
    level: "School Seminar", 
    submitted: "3 hours ago",
    items: [
      { id: 201, text: "Include the qualitative analysis appendix.", done: true },
    ]
  },
];

export function CorrectionsVerification() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleVerify = (name: string) => {
    toast.success(`Corrections verified for ${name}`, {
      description: "Student will now progress to the next academic level."
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <FileCheck2 className="text-secondary" />
            Corrections Verification Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Students waiting for your confirmation on requested seminar corrections.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search queue..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {VERIFICATIONS.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
          <motion.div key={student.id} variants={itemVariants} className="card-shadow rounded-xl bg-card border border-border overflow-hidden">
             <div className="p-5 flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4 w-full">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="text-lg font-bold text-foreground">{student.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{student.dept}</Badge>
                            <span className="text-xs font-semibold text-muted-foreground italic">
                               From {student.level}
                            </span>
                         </div>
                      </div>
                      <span className="text-[10px] bg-status-warning/10 text-status-warning font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-status-warning/20">
                         Verification Needed
                      </span>
                   </div>

                   <div className="bg-muted/10 p-5 rounded-xl border border-border/40 space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">Completed Corrections Checklist</h4>
                      <div className="space-y-2.5">
                         {student.items.map(item => (
                            <div key={item.id} className="flex gap-3 items-start bg-card p-3 rounded-lg border border-border/60 shadow-sm">
                               <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
                               <div className="flex-1">
                                  <p className="text-sm text-foreground font-medium leading-relaxed">{item.text}</p>
                                  <div className="flex gap-3 mt-2">
                                     <Button variant="link" className="p-0 h-auto text-[10px] text-primary font-bold uppercase flex items-center gap-1">
                                        View Upload <ExternalLink size={10} />
                                     </Button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-primary/5 p-5 rounded-xl border border-primary/20 flex flex-col gap-3 lg:min-w-[200px] w-full lg:w-auto mt-4 lg:mt-0 lg:sticky lg:top-4">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center mb-1">Final Approval Decision</h4>
                   <Button className="bg-success text-success-foreground hover:bg-success/90 w-full text-xs font-bold uppercase gap-2 py-5" onClick={() => handleVerify(student.name)}>
                      <CheckCircle2 size={16} /> Verify All Fixes
                   </Button>
                   <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full text-xs font-bold uppercase gap-2">
                      <XCircle size={16} /> Return to Student
                   </Button>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
