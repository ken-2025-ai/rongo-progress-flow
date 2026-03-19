import { motion } from "framer-motion";
import { GraduationCap, BookOpen, UserCheck, Calendar, Info, Loader2, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export function ThesisExams() {
  const navigate = useNavigate();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto p-6 space-y-8">
      
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft size={20} />
         </Button>
         <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Thesis & Examination Board</h2>
            <p className="text-muted-foreground font-medium">Manage final defense milestones and examiner coordination.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Milestone Cards */}
         {[
           { label: "Thesis Readiness", count: "4", icon: BookOpen, color: "text-primary", bg: "bg-primary/10", desc: "Drafts awaiting internal review." },
           { label: "Viva-Voce Booked", count: "2", icon: Calendar, color: "text-secondary", bg: "bg-secondary/10", desc: "Oral defenses scheduled this month." },
           { label: "Final Clearances", count: "1", icon: Trophy, color: "text-success", bg: "bg-success/10", desc: "Students ready for graduation." },
         ].map((stat, i) => (
           <motion.div key={i} variants={itemVariants} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-4 relative overflow-hidden group">
              <div className={`absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity ${stat.color}`}>
                 <stat.icon size={120} />
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                 <stat.icon size={24} className={stat.color} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                 <p className="text-3xl font-black mt-1">{stat.count}</p>
                 <p className="text-xs text-muted-foreground mt-2">{stat.desc}</p>
              </div>
           </motion.div>
         ))}
      </div>

      <motion.div variants={itemVariants} className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-12">
         <div className="bg-primary/10 p-8 rounded-full mb-8 relative">
            <GraduationCap size={80} className="text-primary" />
            <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-black px-3 py-1 rounded-full shadow-lg animate-bounce">
               COMING SOON
            </div>
         </div>
         <h3 className="text-2xl font-black text-foreground">Examination Board Desk</h3>
         <p className="text-muted-foreground max-w-lg mt-4 font-medium leading-relaxed">
            The Senior Engineering team is currently finalizing the real-time examiner booking and digital thesis marking module. 
            Once live, this portal will serve as the single source of truth for all Viva-Voce proceedings and final grade awards.
         </p>
         <div className="flex gap-4 mt-10">
            <Button variant="outline" className="h-12 px-8 font-bold gap-2">
               <Info size={18} /> View Manuals
            </Button>
            <Button className="h-12 px-8 bg-primary font-bold gap-2 shadow-lg shadow-primary/20">
               <UserCheck size={18} /> Meet Examiners
            </Button>
         </div>
      </motion.div>

    </motion.div>
  );
}
