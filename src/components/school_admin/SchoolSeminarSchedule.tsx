import { motion } from "framer-motion";
import { 
  PlayCircle, ClipboardCheck, Users, 
  Clock, CalendarPlus, FileText, CheckCircle2, AlertTriangle, MessageSquare, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState } from "react";

const SESSIONS = [
  {
    id: 1,
    date: "April 16, 2026",
    type: "Third Thursday (School Seminar)",
    room: "Main PG Hall",
    presenters: [
      { name: "John Musyoka", department: "IHRS", status: "Ongoing", time: "10:00 AM", panel: ["Prof. Kibet", "Dr. Ochieng", "Prof. Maina"] },
    ]
  }
];

export function SchoolSeminarSchedule() {
  const [selectedDecision, setSelectedDecision] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);

  const startSession = () => {
    setSessionStarted(true);
    toast.success("School Session Started", {
      description: "Scores for the Third Thursday Seminar can now be recorded."
    });
  };

  const recordDecision = (student: string) => {
    toast.success("School Decision Recorded", {
      description: `Results for ${student} saved. Supervisor notified of any necessary corrections.`
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarPlus className="text-secondary" />
            School Seminar Schedule
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Manage the exclusive Third Thursday School Level presentations.</p>
        </div>
        <div className="flex flex-col gap-1 items-end">
           <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">3rd Thursday Enforced</Badge>
        </div>
      </div>

      {SESSIONS.map(session => (
        <motion.div key={session.id} variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
          <div className="p-4 border-b border-border bg-muted/30 flex flex-col md:flex-row justify-between md:items-center gap-4">
             <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-background border border-border/50 flex flex-col items-center justify-center">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase leading-tight">Apr</span>
                   <span className="text-xl font-black text-secondary leading-none">16</span>
                </div>
                <div>
                   <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
                      {session.room}
                   </h3>
                   <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5 mt-0.5">
                      <Clock size={12} /> {session.type}
                   </p>
                </div>
             </div>
             
             <Button
                size="sm"
                className={`gap-2 h-9 text-xs font-bold uppercase transition-all ${
                  sessionStarted ? "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20" : "bg-primary text-white"
                }`}
                onClick={sessionStarted ? undefined : startSession}
             >
                {sessionStarted ? <Clock size={16} /> : <PlayCircle size={16} />}
                {sessionStarted ? "Session Active" : "Start Session"}
             </Button>
          </div>
          
          <div className="divide-y divide-border/50">
            {session.presenters.map((p, i) => (
              <div key={i} className={`p-5 transition-colors ${p.status === "Ongoing" ? "bg-primary/5" : "bg-background"}`}>
                 <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-3">
                       <div className="flex items-center gap-3">
                          <span className="text-sm font-bold bg-muted/30 text-muted-foreground p-1 px-2.5 rounded-md border border-border/40 font-mono">
                             {p.time}
                          </span>
                          <h4 className="text-lg font-bold text-foreground">{p.name}</h4>
                          <Badge variant="outline" className="text-[10px] bg-muted/50 text-muted-foreground">
                             {p.department}
                          </Badge>
                          {p.status === "Ongoing" && (
                            <Badge variant="outline" className="text-[10px] bg-primary text-primary-foreground border-transparent uppercase tracking-wider font-bold animate-pulse shadow-glow shadow-primary/20">
                              Presenting Now
                            </Badge>
                          )}
                       </div>
                       <p className="text-xs font-medium text-foreground">
                          School Panel: <span className="text-muted-foreground font-bold">{p.panel.join(" • ")}</span>
                       </p>
                       <div className="flex items-center gap-3 pt-2">
                          <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase gap-1.5 text-secondary">
                             <BookOpen size={14} /> Open Thesis Draft
                          </Button>
                          <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase gap-1.5 text-muted-foreground">
                             <ClipboardCheck size={14} /> View Dept History
                          </Button>
                       </div>
                    </div>
                    
                    <div className="w-full lg:w-48 xl:w-64">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button 
                             disabled={!sessionStarted || p.status === "Waiting"} 
                             className="w-full h-10 bg-success hover:bg-success/90 text-success-foreground text-xs font-bold uppercase shadow-lg shadow-success/20 disabled:shadow-none transition-all"
                           >
                              Record School Decision
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-md">
                           <DialogHeader>
                             <DialogTitle className="flex items-center gap-2">
                                <ClipboardCheck className="text-primary" /> Record School Decision
                             </DialogTitle>
                           </DialogHeader>
                           <div className="space-y-4 py-4">
                              <p className="text-xs text-muted-foreground">Log the final School Panel consensus for <strong className="text-foreground">{p.name}</strong>. This dictates if they move to the Final Examination.</p>
                              
                              <div className="grid grid-cols-2 gap-2">
                                 <Button variant={selectedDecision === "pass" ? "default" : "outline"} className={`h-12 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "pass" ? "bg-success text-success-foreground border-transparent" : "hover:bg-success/5 hover:text-success"}`} onClick={() => setSelectedDecision("pass")}>
                                    <CheckCircle2 size={16} className="mr-2" /> Cleared for PG
                                 </Button>
                                 <Button variant={selectedDecision === "minor" ? "default" : "outline"} className={`h-12 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "minor" ? "bg-status-warning text-status-warning-foreground border-transparent" : "hover:bg-status-warning/5 hover:text-status-warning"}`} onClick={() => setSelectedDecision("minor")}>
                                    <AlertTriangle size={16} className="mr-2" /> Minor Fixes
                                 </Button>
                                 <Button variant={selectedDecision === "major" ? "default" : "outline"} className={`h-12 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "major" ? "bg-destructive text-destructive-foreground border-transparent" : "hover:bg-destructive/5 hover:text-destructive"}`} onClick={() => setSelectedDecision("major")}>
                                    <AlertTriangle size={16} className="mr-2" /> Major Fixes
                                 </Button>
                                 <Button variant={selectedDecision === "repeat" ? "default" : "outline"} className={`h-12 border-border/50 text-[10px] font-bold uppercase tracking-wider justify-start px-3 ${selectedDecision === "repeat" ? "bg-muted text-foreground border-transparent" : "hover:bg-muted/10 hover:text-foreground"}`} onClick={() => setSelectedDecision("repeat")}>
                                    <PlayCircle size={16} className="mr-2" /> Repeat School
                                 </Button>
                              </div>

                              <div className="space-y-2 pt-2">
                                 <label className="text-xs font-bold text-foreground flex items-center gap-1"><MessageSquare size={12}/> Required Actions (Sent to Student)</label>
                                 <Textarea placeholder="List specific corrections requested by the School Panel..." className="min-h-[100px] text-sm" />
                              </div>
                           </div>
                           <DialogFooter>
                              <Button variant="outline" className="text-xs font-bold uppercase">Cancel</Button>
                              <Button className="bg-primary text-white text-xs font-bold uppercase" onClick={() => recordDecision(p.name)} disabled={!selectedDecision}>Save Decision</Button>
                           </DialogFooter>
                         </DialogContent>
                       </Dialog>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
