import { motion } from "framer-motion";
import { GraduationCap, BookOpen, UserCheck, Calendar, Info, Loader2, ArrowLeft, Trophy, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function ThesisExams() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     if (user?.id) fetchCandidates();
  }, [user]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name))
        `)
        .eq('supervisor_id', user.id)
        .in('current_stage', ['PG_EXAMINATION', 'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED']);
      
      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Board Synchronization Error");
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
     { 
        label: "External Review", 
        count: candidates.filter(c => c.current_stage === 'PG_EXAMINATION').length.toString(), 
        icon: BookOpen, 
        color: "text-primary", 
        bg: "bg-primary/10", 
        desc: "Thesis currently with external examiners." 
     },
     { 
        label: "Viva-Voce Booked", 
        count: candidates.filter(c => c.current_stage === 'VIVA_SCHEDULED').length.toString(), 
        icon: Calendar, 
        color: "text-secondary", 
        bg: "bg-secondary/10", 
        desc: "Candidates scheduled for oral defense." 
     },
     { 
        label: "Final Clearances", 
        count: candidates.filter(c => c.current_stage === 'COMPLETED').length.toString(), 
        icon: Trophy, 
        color: "text-success", 
        bg: "bg-success/10", 
        desc: "Candidates who have finalized everything." 
     },
  ];

  if (loading) return (
     <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

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
         {kpis.map((stat, i) => (
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

      {candidates.length === 0 ? (
         <motion.div variants={itemVariants} className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-12">
            <div className="bg-primary/10 p-8 rounded-full mb-8 relative">
               <GraduationCap size={80} className="text-primary" />
            </div>
            <h3 className="text-2xl font-black text-foreground">Examination Board Desk</h3>
            <p className="text-muted-foreground max-w-lg mt-4 font-medium leading-relaxed">
               No candidates currently in the final examination pipeline. 
               Candidates migrate here once they complete the Thesis Readiness clearance.
            </p>
         </motion.div>
      ) : (
         <div className="grid gap-6">
            {candidates.map((candidate) => (
               <motion.div key={candidate.id} variants={itemVariants} className="bg-card p-8 rounded-3xl border border-border/60 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                     <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4">
                           <h3 className="text-2xl font-black">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                           <Badge className="bg-primary/10 text-primary border-primary/20 uppercase font-black text-[9px] tracking-widest">
                              {candidate.current_stage.replace(/_/g, ' ')}
                           </Badge>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground max-w-2xl italic">"{candidate.research_title || "Thesis Title Not Finalized"}"</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                           <div className="bg-muted/5 p-4 rounded-2xl border border-border/40">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Examiner Reports</p>
                              <div className="flex items-center gap-2 text-xs font-bold text-success">
                                 <FileText size={16}/> External Reports Received (2/3)
                              </div>
                           </div>
                           <div className="bg-muted/5 p-4 rounded-2xl border border-border/40">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-2">Defense Timeline</p>
                              <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                                 <Calendar size={16}/> Viva-Voce: TBD
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex flex-col gap-3 w-full lg:w-64">
                        <Button className="h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-primary/20">
                           Coordination Panel
                        </Button>
                        <Button variant="outline" className="h-12 border-border/60 font-black uppercase text-[10px] tracking-widest rounded-xl">
                           View Submissions
                        </Button>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      )}

    </motion.div>
  );
}
