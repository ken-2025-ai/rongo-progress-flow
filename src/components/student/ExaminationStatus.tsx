import { motion } from "framer-motion";
import { Shield, UserCheck, CalendarDays, Award, Clock, FileCheck2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";

export function ExaminationStatus() {
  const examiners = [
    { role: "Internal Examiner", name: "Prof. Jackson Maina", department: "SGS, Rongo", status: "Review in progress", progress: 65 },
    { role: "External Examiner", name: "Dr. Catherine Wambui", university: "Kenyatta University", status: "Review in progress", progress: 40 },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Visual Progress Bar */}
      <motion.div variants={itemVariants} className="card-shadow rounded-xl bg-card border-l-4 border-secondary p-6">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="text-secondary" size={24} />
          Final Examination Status
        </h2>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
            <Award size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground uppercase tracking-widest text-muted-foreground mb-1 font-black">Overall Examination State</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-secondary uppercase italic">Under Examination</span>
              <div className="h-6 w-[1px] bg-border mx-2" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-muted-foreground uppercase">Estimated Viva Date</span>
                <span className="text-sm font-bold text-foreground">January 20, 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Examiners */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Board of Examiners</h3>
            {examiners.map((e, index) => (
              <div key={index} className="p-5 rounded-xl bg-muted/20 border border-border/40 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center text-primary/60 border border-border/20">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{e.role}</p>
                      <h4 className="text-base font-bold text-foreground">{e.name}</h4>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase">
                    <span>Review Progress</span>
                    <span>{e.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${e.progress}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
                
                <p className="mt-4 text-[11px] text-muted-foreground italic flex items-center gap-1.5 opacity-70">
                  <Clock size={12} />
                  Status: {e.status}
                </p>
              </div>
            ))}
          </div>

          {/* VIVA PREP */}
          <div className="space-y-6">
             <div className="p-6 rounded-xl bg-primary text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <CalendarDays className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
                <h3 className="text-lg font-bold mb-2">Viva Voce Preparation</h3>
                <p className="text-xs text-white/80 mb-6 leading-relaxed">
                  Your viva session has been tentatively scheduled. Ensure all presentation materials are ready and corrections from previous stages are properly documented.
                </p>
                <div className="flex gap-2">
                   <Button className="flex-1 bg-white text-primary hover:bg-white/90 text-xs font-bold uppercase">Download Guidelines</Button>
                   <Button variant="outline" className="flex-1 border-white/40 text-white hover:bg-white/10 text-xs font-bold uppercase">Resource Hub</Button>
                </div>
             </div>

             <div className="p-5 rounded-xl border border-dashed border-border/60 bg-muted/5 flex items-center gap-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-lg">
                   <FileCheck2 size={24} />
                </div>
                <div>
                   <h4 className="text-sm font-bold text-foreground">Final Thesis Clearance</h4>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Pending Exam Board Decision</p>
                </div>
             </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="p-4 rounded-xl bg-status-info/5 border border-status-info/20 flex gap-4">
        <Info className="text-status-info shrink-0" size={24} />
        <p className="text-xs text-status-info font-medium italic">
          <strong>Note:</strong> Examiners are anonymous to protect the integrity of the process. Names displayed here are for demonstration purposes. Official letters will be sent via Academic Updates.
        </p>
      </motion.div>
    </motion.div>
  );
}
