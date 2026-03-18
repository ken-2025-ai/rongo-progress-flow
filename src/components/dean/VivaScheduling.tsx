import { motion } from "framer-motion";
import { 
  CalendarDays, PlayCircle, Users, 
  MapPin, CheckCircle2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState } from "react";

const VIVA_QUEUE = [
  {
    id: 1,
    student: "John Musyoka",
    programme: "MSc Health Informatics",
    internal: "Dr. Lwanga (Rongo)",
    external: "Prof. Njuguna (JKUAT)",
    lockedThesis: "v5_final_post_school.pdf",
    status: "Examiner Reports Received",
  }
];

export function VivaScheduling() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");

  const handleSchedule = (name: string) => {
    toast.success(`Viva Voce Scheduled for ${name}`, {
      description: "Invitations dispatched to candidate, supervisor, and assigned examiners.",
      duration: 5000
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="text-primary" />
            Viva Voce Scheduling
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Coordinate final defence dates for candidates with complete examiner reports.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {VIVA_QUEUE.map((candidate) => (
          <motion.div key={candidate.id} variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border">
             <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <div className="flex flex-col gap-1">
                   <h3 className="font-bold text-foreground text-lg">{candidate.student}</h3>
                   <span className="text-xs text-muted-foreground">{candidate.programme}</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 uppercase tracking-wider text-[10px] animate-pulse glow-success">
                   {candidate.status}
                </Badge>
             </div>

             <div className="p-6 flex flex-col xl:flex-row gap-8">
                
                {/* Information Column */}
                <div className="flex-1 space-y-4">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><Users size={14}/> Examination Board</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                         <p className="text-[10px] uppercase font-bold text-muted-foreground">Internal Reviewer</p>
                         <p className="text-sm font-bold text-foreground mt-1">{candidate.internal}</p>
                         <p className="text-[10px] text-success flex items-center gap-1 mt-1 font-bold"><CheckCircle2 size={12}/> Report Received</p>
                      </div>
                      <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                         <p className="text-[10px] uppercase font-bold text-muted-foreground">External Reviewer</p>
                         <p className="text-sm font-bold text-foreground mt-1">{candidate.external}</p>
                         <p className="text-[10px] text-success flex items-center gap-1 mt-1 font-bold"><CheckCircle2 size={12}/> Report Received</p>
                      </div>
                   </div>
                   <div className="mt-4 p-3 bg-secondary/5 rounded border border-secondary/20">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-secondary flex items-center gap-1.5 mb-1">
                         <Shield size={12}/> Guarded Document
                      </p>
                      <p className="text-xs font-mono text-foreground">{candidate.lockedThesis}</p>
                   </div>
                </div>

                {/* Scheduling Column */}
                <div className="w-full xl:w-96 flex flex-col gap-4 bg-muted/20 p-6 rounded-xl border border-border/50 shadow-inner">
                   <h4 className="text-[10px] uppercase font-bold tracking-widest text-foreground text-center mb-1">Set Defence Parameters</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-2">
                         <CalendarDays size={16} className="text-muted-foreground shrink-0" />
                         <Input type="date" className="h-9 bg-background text-xs" onChange={(e) => setDate(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                         <Clock size={16} className="text-muted-foreground shrink-0" />
                         <Input type="time" className="h-9 bg-background text-xs" onChange={(e) => setTime(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                         <MapPin size={16} className="text-muted-foreground shrink-0" />
                         <Input placeholder="e.g. PG Boardroom 2" className="h-9 bg-background text-xs" onChange={(e) => setVenue(e.target.value)} />
                      </div>
                   </div>

                   <Dialog>
                     <DialogTrigger asChild>
                       <Button 
                         disabled={!date || !time || !venue}
                         className="w-full h-10 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                       >
                          Schedule Defense
                       </Button>
                     </DialogTrigger>
                     <DialogContent>
                       <DialogHeader>
                         <DialogTitle className="flex items-center gap-2">
                            <PlayCircle className="text-primary" /> Confirm Viva Dispatch
                         </DialogTitle>
                       </DialogHeader>
                       <div className="py-4 space-y-4">
                          <p className="text-sm text-foreground">You are generating the official University Viva Voce invitation for <strong className="font-bold underline">{candidate.student}</strong>.</p>
                          <ul className="text-xs space-y-2 bg-primary/10 p-4 rounded-lg border border-primary/20 font-mono font-medium text-foreground">
                             <li>Date: {date}</li>
                             <li>Time: {time}</li>
                             <li>Venue: {venue}</li>
                          </ul>
                       </div>
                       <DialogFooter>
                         <Button variant="outline" className="text-xs font-bold uppercase">Cancel</Button>
                         <Button className="bg-primary text-primary-foreground text-xs font-bold uppercase" onClick={() => handleSchedule(candidate.student)}>Dispatch Invites</Button>
                       </DialogFooter>
                     </DialogContent>
                   </Dialog>
                </div>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
