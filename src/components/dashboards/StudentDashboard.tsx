import { useState, useEffect } from "react";
import { 
  User, Mail, BookOpen, GraduationCap, ShieldCheck, 
  ChevronRight, BrainCircuit, Activity, Clock, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Link } from "react-router-dom";
import { PipelineRail } from "@/components/PipelineRail";
import { STAGE_SEQUENCE } from "@/lib/pipeline";

export function StudentDashboard() {
  const { user, isLoading: authLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    events: 0,
    tasks: 0,
    progress: 0
  });

  useEffect(() => {
    if (!authLoading) {
      if (user?.id) fetchStudentData();
      else setLoading(false);
    }
  }, [user, authLoading]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Student Profile
      // @ts-ignore
      const { data: sData } = await supabase.from('students').select(`
        *,
        programmes:programme_id(name, faculty)
      `).eq('user_id', user.id).maybeSingle();
      
      if (sData) {
        setStudentInfo(sData);

        // 2. Compute System Stats
        // @ts-ignore
        const { count: eCount } = await supabase.from('seminar_bookings').select('*', { count: 'exact', head: true }).eq('student_id', sData.id);
        // @ts-ignore
        const { count: tCount } = await supabase.from('corrections').select('*', { count: 'exact', head: true }).eq('student_id', sData.id).eq('status', 'PENDING');
        
        const progressIdx = STAGE_SEQUENCE.indexOf(sData.current_stage);
        const progressPct = Math.round(((progressIdx + 1) / STAGE_SEQUENCE.length) * 100);

        setStats({
          events: eCount || 0,
          tasks: tCount || 0,
          progress: progressPct
        });
      }
    } catch (err) {
      console.error("Portal Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStageNumeric = (stage: string) => {
    const idx = STAGE_SEQUENCE.indexOf(stage);
    return idx === -1 ? 0 : idx + 1;
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 pb-32">
      
      {/* 1. IDENTITY SHROUD: PERSONAL SCHOLASTIC PROFILE */}
      <motion.div 
        variants={itemVariants} 
        className="card-shadow rounded-[40px] bg-card border border-border/60 overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="p-10 relative z-10">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
             {/* Avatar Node */}
             <div className="relative">
                <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-black shadow-2xl group-hover:scale-105 transition-transform duration-500">
                   {user?.avatar || studentInfo?.registration_number?.slice(-2)}
                </div>
                <div className="absolute -bottom-3 -right-3 bg-success text-white p-2 rounded-2xl shadow-xl border-4 border-card">
                   <ShieldCheck size={20} />
                </div>
             </div>

             {/* Details Node */}
             <div className="flex-1 space-y-6">
                <div>
                   <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-3 px-4 py-1.5 rounded-full">
                      Institutional Scholar Identity
                   </Badge>
                   <h2 className="text-4xl font-black text-foreground tracking-tighter italic">
                      {user?.name || "SCHOLAR IDENTIFIED"}
                   </h2>
                   <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-widest">{studentInfo?.programmes?.name || "PHD RESEARCH PROGRAM"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground">
                         <Clock size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration</p>
                         <p className="text-sm font-black text-foreground">{studentInfo?.registration_number || "RU/PG/1001"}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground">
                         <Mail size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Node</p>
                         <p className="text-sm font-black text-foreground lowercase truncate">{user?.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/20 border border-border/50">
                      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-card border border-border text-muted-foreground">
                         <GraduationCap size={18} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clearance Stage</p>
                         <p className="text-sm font-black text-foreground uppercase tracking-tight italic">{studentInfo?.current_stage?.replace(/_/g, ' ') || 'PRE-REG'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      {/* 2. INSTITUTIONAL ENGINE SUMMARY & PIPELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Pipeline Rail (Span 2) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-3">
                 <Activity className="text-primary" size={16} /> Master Scholastic Pipeline
              </h3>
              <Badge className="bg-primary text-white font-black text-[10px] uppercase rounded-full px-4">{stats.progress}% SYNC</Badge>
           </div>
           <div className="card-shadow p-8 rounded-[40px] bg-card border border-border/60">
              <PipelineRail currentStage={studentInfo?.current_stage ?? ""} />
           </div>
           
           {/* System Executive Summary */}
           <div className="card-shadow p-10 rounded-[40px] bg-primary text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <BrainCircuit size={180} />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                 <div className="max-w-md">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">The Progress Flow <span className="text-white/60">Logic</span></h3>
                    <p className="text-sm font-medium leading-relaxed text-white/80">
                       Rongo University's automated doctoral engine synchronizes your research milestones between Departmental boards, School examiners, and the PG Dean's final convocation node. Every submission is digitally logged, vetted, and archived.
                    </p>
                    <div className="flex gap-4 mt-8">
                       <Link to="/journey">
                          <Button className="h-12 px-8 rounded-2xl bg-white text-primary font-black uppercase text-[10px] tracking-widest hover:bg-white/90">
                             View Journey Logic
                          </Button>
                       </Link>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/10 text-center flex flex-col items-center justify-center min-w-[120px]">
                       <span className="text-3xl font-black mb-1">{stats.events}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Verified Events</span>
                    </div>
                    <div className="p-6 rounded-[32px] bg-white/10 backdrop-blur-md border border-white/10 text-center flex flex-col items-center justify-center min-w-[120px]">
                       <span className="text-3xl font-black mb-1 text-gold">{stats.tasks}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Pending Fixes</span>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Quick Links / Status Guide */}
        <motion.div variants={itemVariants} className="space-y-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground px-4">
              Operation Command
           </h3>
           <div className="space-y-4">
              {[
                { title: "Book Presentation", icon: BookOpen, url: "/booking", desc: "Initiate next departmental seminar", color: "primary" },
                { title: "Review Corrections", icon: BrainCircuit, url: "/feedback", desc: "Sync feedback from latest panel", color: "secondary" },
                { title: "Thesis Submission", icon: GraduationCap, url: "/submit-thesis", desc: "Upload latest research version", color: "primary" },
              ].map((link, i) => (
                <Link to={link.url} key={i} className="block group">
                  <div className="card-shadow p-6 rounded-[32px] bg-card border border-border/60 hover:border-primary/40 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`h-12 w-12 rounded-2xl bg-${link.color}/5 text-${link.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <link.icon size={24} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-foreground tracking-tight">{link.title}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">{link.desc}</p>
                       </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
           </div>

           <div className="p-8 rounded-[32px] bg-muted/30 border border-border/50 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Institutional Integrity</p>
              <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                 All milestones recorded in this portal are officially recognized by the <span className="font-black text-foreground">Rongo University Board of Graduate Studies</span>.
              </p>
           </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
