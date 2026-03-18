import { motion } from "framer-motion";
import { User, Mail, Hash, BookOpen, GraduationCap, Building2 } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";

export function AcademicProfile() {
  const { user } = useRole();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Profile Card */}
      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border">
        <div className="h-32 bg-primary/10 relative">
           <div className="absolute -bottom-12 left-8 p-1 bg-card rounded-full">
              <div className="h-24 w-24 bg-primary text-primary-foreground flex items-center justify-center rounded-full text-4xl font-black shadow-lg">
                 {user.name.charAt(0)}
              </div>
           </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex justify-between items-start">
           <div>
              <h2 className="text-2xl font-black text-foreground">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 text-secondary font-medium">
                 <Mail size={14} />
                 <span>{user.email}</span>
              </div>
              <Badge className="mt-4 bg-status-success/15 text-status-success hover:bg-status-success/20 border-transparent font-bold">
                 Active Post-Graduate Student
              </Badge>
           </div>
           
           <div className="flex flex-col gap-2 items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-1">Registration Status</span>
              <div className="flex items-center gap-1.5 bg-success/10 text-success px-3 py-1.5 rounded text-xs font-bold border border-success/20">
                 <div className="h-2 w-2 rounded-full bg-success animate-pulse" /> fully enrolled
              </div>
           </div>
        </div>
      </motion.div>

      {/* Academic Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Institution Details */}
         <motion.div variants={itemVariants} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2 border-b border-border pb-2">
               <Building2 size={16} className="text-primary"/> Institutional Affiliation
            </h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Faculty / School</label>
                  <p className="font-bold text-foreground mt-1">School of Information Sciences</p>
               </div>
               <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Department</label>
                  <p className="font-bold text-foreground mt-1 text-sm bg-muted/40 p-2 rounded border border-border/50">Computing & Information Technology (CIT)</p>
               </div>
            </div>
         </motion.div>

         {/* Programme Details */}
         <motion.div variants={itemVariants} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2 border-b border-border pb-2">
               <GraduationCap size={16} className="text-secondary"/> Degree Programme
            </h3>
            
            <div className="space-y-6">
               <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase flex gap-1.5 items-center"><BookOpen size={12}/> Programme Name</label>
                  <p className="font-bold text-primary text-lg mt-1 tracking-tight">Master of Science (Health Informatics)</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs font-bold text-muted-foreground uppercase flex gap-1.5 items-center"><Hash size={12}/> Registration No.</label>
                     <p className="font-bold text-foreground mt-1 font-mono tracking-wider">MSC/HI/024/2026</p>
                  </div>
                  <div>
                     <label className="text-xs font-bold text-muted-foreground uppercase">Intake Year</label>
                     <p className="font-bold text-foreground mt-1">September 2026</p>
                  </div>
               </div>
            </div>
         </motion.div>
      </div>
      
      {/* Research Topic Section */}
      <motion.div variants={itemVariants} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            Research Synopsis
         </h3>
         <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Approved Research Title</label>
            <p className="text-xl font-bold text-foreground italic leading-relaxed">
               "Predictive Modeling of Communicable Disease Outbreaks in Western Kenya using Deep Learning."
            </p>
            
            <div className="mt-6 flex flex-col md:flex-row gap-6 border-t border-border/50 pt-4">
               <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Assigned Supervisor</label>
                  <p className="font-bold text-sm text-primary">Dr. E. Omuya</p>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Current Academic Stage</label>
                  <Badge variant="outline" className="text-xs font-bold text-status-warning bg-status-warning/10 border-transparent">
                     Departmental Seminar Passed
                  </Badge>
               </div>
            </div>
         </div>
      </motion.div>

    </motion.div>
  );
}
