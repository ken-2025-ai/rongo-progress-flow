import { motion } from "framer-motion";
import { 
  FileText, CheckCircle2, XCircle, Clock, Upload, 
  MessageSquare, History, AlertCircle, FileCheck2, ShieldCheck, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  SheetHeader, SheetTitle, SheetDescription 
} from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "sonner";

interface StudentDetailPanelProps {
  student: any;
}

export function StudentDetailPanel({ student }: StudentDetailPanelProps) {
  const [comment, setComment] = useState("");

  const handleAction = (action: string) => {
    toast.success(`${action} successful`, {
      description: `Action recorded for ${student.name}`,
    });
    setComment("");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <SheetHeader className="p-6 border-b border-border bg-card sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <SheetTitle className="text-2xl font-bold text-foreground mb-1">{student.name}</SheetTitle>
            <SheetDescription className="text-sm font-medium">
              Master of Science in Information Systems · {student.dept}
            </SheetDescription>
          </div>
          <Badge variant="outline" className={`uppercase tracking-wider font-bold ${
            student.risk === "urgent" ? "bg-destructive/10 text-destructive border-transparent" :
            student.risk === "high" ? "bg-status-warning/10 text-status-warning border-transparent" :
            "bg-primary/10 text-primary border-transparent"
          }`}>
            {student.status}
          </Badge>
        </div>
        
        {/* Research Info Bar */}
        <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border flex flex-col gap-3">
          <div>
             <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Research Title</h4>
             <p className="text-sm font-semibold text-foreground mt-1 line-clamp-2">
               Evaluating Machine Learning Models for Early Bug Detection in Continuous Integration Pipelines: A Case Study of Kenyan FinTech Companies.
             </p>
          </div>
          <div className="flex items-center gap-6 mt-2 pt-3 border-t border-border/50">
             <div>
                <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Current Stage</h4>
                <p className="text-sm font-bold text-primary flex items-center gap-1.5 mt-0.5">
                   <Clock size={14} />
                   {student.stage}
                </p>
             </div>
             <div>
                <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Time in Stage</h4>
                <p className="text-sm font-bold text-foreground mt-0.5">
                   {student.risk === "urgent" ? (
                      <span className="text-destructive flex items-center gap-1"><AlertCircle size={14}/> 64 Days (Overdue)</span>
                   ) : "12 Days"}
                </p>
             </div>
          </div>
        </div>
      </SheetHeader>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8 pb-10">
          
          {/* Section 1: Thesis Submissions */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <History size={16} /> Latest Submission
            </h3>
            <div className="card-shadow rounded-xl bg-card border border-border p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Draft_Chapter1to3_v2.pdf</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex gap-2">
                       <span>Uploaded {student.lastSubmission}</span>
                       <span>• 4.2 MB</span>
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-bold uppercase">
                  <Download size={14} />
                  Download
                </Button>
              </div>

              <div className="bg-muted/10 rounded-lg p-4 border border-border/50 mt-4 space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <MessageSquare size={14} className="text-muted-foreground" /> 
                  Supervisor Feedback
                </label>
                <Textarea 
                  placeholder="Enter specific feedback, corrections, or approval notes for the student..." 
                  className="bg-background min-h-[100px] text-sm"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-bold uppercase" onClick={() => handleAction("Return for Revision")}>
                     <XCircle size={14} className="mr-1.5" /> Return Draft
                  </Button>
                  <Button className="bg-success text-success-foreground hover:bg-success/90 text-xs font-bold uppercase" onClick={() => handleAction("Approve Submission")}>
                     <CheckCircle2 size={14} className="mr-1.5" /> Approve Draft
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Corrections Verification */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <FileCheck2 size={16} /> Corrections Verification
            </h3>
            <div className="card-shadow rounded-xl bg-card border border-border p-5">
              <p className="text-xs text-muted-foreground mb-4">
                Student has marked the following corrections from the last Departmental Seminar as <strong className="text-foreground">Completed</strong>. Please verify.
              </p>
              
              <div className="space-y-3">
                {[
                  "Revise methodology to include ethical considerations.",
                  "Update 2024 citations in Literature Review."
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start bg-muted/20 p-3 rounded-lg border border-border/40">
                    <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{item}</p>
                      <Button variant="link" className="p-0 h-auto text-[10px] text-primary mt-1 font-bold uppercase">View Evidence Upload</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                 <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full md:w-auto text-xs font-bold uppercase" onClick={() => handleAction("Corrections Verified")}>
                    Verify All Corrections
                 </Button>
              </div>
            </div>
          </section>

          {/* Section 3: Seminar Readiness */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck size={16} /> Seminar Readiness Approval
            </h3>
            <div className="card-shadow rounded-xl bg-primary/5 border border-primary/20 p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Approve to Book Seminar</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Once approved, the student will be allowed to book a slot for the next available <strong className="text-foreground">Departmental Seminar</strong>. The Coordinator will be notified.
                  </p>
                  <Button className="mt-4 bg-primary text-white hover:bg-primary/90 text-xs font-bold uppercase w-full sm:w-auto" onClick={() => handleAction("Readiness Approved")}>
                    Grant Readiness Approval
                  </Button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </ScrollArea>
    </div>
  );
}
