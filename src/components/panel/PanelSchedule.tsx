import { motion } from "framer-motion";
import { 
  CalendarDays, MapPin, Search, Users, Clock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const UPCOMING = [
  {
    id: 1,
    student: "John Musyoka",
    type: "Viva Voce Evaluation",
    date: "2026-05-02",
    time: "09:00 AM",
    venue: "Main Boardroom, PG School",
    role: "Internal Examiner",
    panel: ["Dr. Lwanga (Internal)", "Prof. Njuguna (External)"]
  }
];

export function PanelSchedule() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="text-primary" />
            Upcoming Viva Sessions
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Schedules locked in by Department Coordinators or PG Dean.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <Input 
             placeholder="Search by student or date..." 
             className="pl-9 h-9 text-sm rounded-lg bg-muted/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid gap-6">
        {UPCOMING.filter(u => u.student.toLowerCase().includes(searchTerm.toLowerCase())).map((session) => (
          <motion.div key={session.id} variants={itemVariants} className="card-shadow bg-card rounded-xl overflow-hidden border border-border flex flex-col xl:flex-row">
             
             {/* Info Section */}
             <div className="p-6 flex-1 border-b xl:border-b-0 xl:border-r border-border/10">
                <div className="flex justify-between items-start mb-4">
                   <Badge variant="outline" className="bg-primary/10 text-primary border-transparent uppercase tracking-wider text-[10px]">
                      {session.type}
                   </Badge>
                   <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 bg-muted px-2 py-1 rounded">
                      <Clock size={12}/> {session.time}
                   </span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">{session.student}</h3>
                <div className="flex flex-col gap-2 mt-4 text-sm text-foreground">
                   <div className="flex items-center gap-2"><CalendarDays size={16} className="text-muted-foreground"/> <strong className="font-semibold">{session.date}</strong></div>
                   <div className="flex items-center gap-2"><MapPin size={16} className="text-muted-foreground"/> <span className="font-medium text-muted-foreground">{session.venue}</span></div>
                </div>

                <div className="mt-6 p-3 bg-muted/30 rounded border border-border/50 mt-auto">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground flex items-center gap-1.5 mb-2">
                      <Users size={14}/> Examination Panel
                   </p>
                   <div className="text-xs text-muted-foreground font-medium flex gap-4">
                      {session.panel.map((p, idx) => <span key={idx} className={p.includes("Internal") ? "text-primary font-bold" : ""}>{p}</span>)}
                   </div>
                </div>
             </div>

             {/* Action Section */}
             <div className="p-6 w-full xl:w-[350px] bg-muted/10 flex flex-col justify-center items-center text-center">
                <div className="mb-4">
                   <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Your Role</p>
                   <p className="text-sm font-bold text-primary flex items-center gap-1.5 justify-center">
                      <AlertCircle size={14} className="animate-pulse"/> {session.role}
                   </p>
                </div>
                
                <Button 
                   onClick={() => navigate("/evaluations")}
                   className="w-full h-12 bg-secondary hover:bg-secondary/90 text-sm font-bold shadow-lg shadow-secondary/20 uppercase tracking-widest transition-all"
                >
                   Open Workspace
                </Button>
                
                <p className="text-[10px] text-muted-foreground mt-3 italic">Workspace unlocks strictly post-seminar.</p>
             </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
