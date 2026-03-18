import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, XCircle, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";

const PENDING_APPROVALS = [
  { id: 1, name: "Faith Chebet", dept: "CMJ", level: "Departmental Seminar", draftVersion: "v3_final.pdf", submitted: "2 days ago" },
  { id: 2, name: "Alex Kipronoh", dept: "IHRS", level: "School Seminar", draftVersion: "school_draft_v1.pdf", submitted: "5 days ago" },
];

export function SeminarReadiness() {
  const handleApprove = (name: string) => {
    toast.success(`Seminar approval granted for ${name}`, {
      description: "Student is now cleared to book a slot. Department Coordinator has been notified."
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="text-primary" />
            Seminar Readiness Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Students waiting for your approval to present at the next seminar level.</p>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary uppercase font-bold tracking-wider">
          {PENDING_APPROVALS.length} Pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {PENDING_APPROVALS.map((req) => (
          <motion.div key={req.id} variants={itemVariants} className="card-shadow rounded-xl bg-card border border-border overflow-hidden">
             <div className="p-5 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4">
                   <div>
                      <h3 className="text-lg font-bold text-foreground">{req.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{req.dept}</Badge>
                         <span className="text-xs font-semibold text-secondary flex items-center gap-1.5 before:content-[''] before:w-1.5 before:h-1.5 before:bg-secondary before:rounded-full">
                            Requesting: {req.level}
                         </span>
                      </div>
                   </div>

                   <div className="bg-muted/30 p-4 rounded-lg border border-border/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-background rounded-md text-muted-foreground shadow-sm">
                            <FileText size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-semibold">{req.draftVersion}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">Submitted {req.submitted}</p>
                         </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 text-xs font-bold uppercase w-full sm:w-auto h-8">
                         <Download size={14} /> Download Final Draft
                      </Button>
                   </div>
                </div>

                <div className="bg-primary/5 p-5 rounded-lg border border-primary/20 flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground text-center">Quality Control</h4>
                   <Button className="bg-success text-success-foreground hover:bg-success/90 w-full text-xs font-bold uppercase gap-2" onClick={() => handleApprove(req.name)}>
                      <CheckCircle2 size={16} /> Approve Readiness
                   </Button>
                   <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full text-xs font-bold uppercase gap-2">
                      <XCircle size={16} /> Return Draft
                   </Button>
                </div>
             </div>
          </motion.div>
        ))}
        {PENDING_APPROVALS.length === 0 && (
          <div className="text-center p-12 card-shadow bg-card rounded-xl border border-dashed border-border text-muted-foreground">
             <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
             <p className="font-bold">No students pending seminar approval.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
