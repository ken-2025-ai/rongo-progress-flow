import { motion } from "framer-motion";
import { UserPlus, UploadCloud, Building2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";

export function StudentRegistry() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 card-shadow bg-card p-6 rounded-2xl border border-border">
         <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
               <UserPlus className="text-primary"/> Post-Graduate Student Admission
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
               Manually register a single scholar or use the bulk import tool to process a cohort via CSV. The system will automatically generate sequential Admission Numbers using strict institutional format.
            </p>
         </div>
         <div className="flex items-start gap-3 shrink-0">
            <Button variant="outline" className="border-dashed h-10 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
               <UploadCloud size={16} className="mr-2"/> Bulk CSV Import
            </Button>
            <Button className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
               Register Student
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Manual Admission Form */}
         <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border/50 bg-muted/10">
               <h3 className="font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-primary/20 text-primary rounded text-[10px]">1</span> Manual Registration Flow
               </h3>
            </div>
            
            <form className="p-6 space-y-8 flex-1">
               {/* Identity */}
               <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Personal Identity</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">First Name</label>
                        <Input className="h-11 bg-background" placeholder="e.g. John" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Last Name</label>
                        <Input className="h-11 bg-background" placeholder="e.g. Doe" />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Official Email</label>
                        <Input type="email" className="h-11 bg-background" placeholder="john.doe@rongo.ac.ke" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Contact Phone</label>
                        <Input className="h-11 bg-background" placeholder="+254..." />
                     </div>
                  </div>
               </div>

               {/* Academic Placement */}
               <div className="space-y-4 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Academic Placement</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">School</label>
                        <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                           <option>School of Computing & Info Sciences</option>
                           <option>School of Education</option>
                           <option>School of Business</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Department</label>
                        <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                           <option>CIT</option>
                           <option>Computer Science</option>
                           <option>Informatics</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Programme</label>
                        <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                           <option>MSc. Health Informatics</option>
                           <option>MSc. Computer Science</option>
                           <option>PhD. Information Systems</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Intake Year</label>
                        <Input className="h-11 bg-background" defaultValue="2026" />
                     </div>
                  </div>
               </div>
            </form>
         </motion.div>

         {/* Admission Number Engine */}
         <motion.div variants={itemVariants} className="space-y-6">
            <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden border-t-4 border-t-primary">
               <div className="p-5 border-b border-border/50 bg-primary/5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2 uppercase tracking-widest">
                     ID Generation Engine
                  </h3>
               </div>
               <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-full rounded-xl bg-background border border-border p-4 shadow-inner">
                     <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Projected Admission No.</p>
                     <p className="text-xl font-mono text-primary font-black tracking-widest">RONGO/PG/CIT/26/<span className="text-foreground animate-pulse">***</span></p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     The system automatically appends the sequential index upon successful database insertion to guarantee zero duplicates.
                  </p>
               </div>
            </div>

            <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm p-5 space-y-4">
               <h3 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pb-2 border-b border-border">Current Database Stats</h3>
               <div className="flex justify-between items-center text-sm font-bold text-foreground">
                  <span>Total Active PG Students</span>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-transparent">2,451</Badge>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-foreground">
                  <span>CIT Department Quota</span>
                  <Badge variant="outline" className="bg-muted border-transparent">140 / 150</Badge>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-foreground">
                  <span>Graduated (Historical)</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-transparent">4,208</Badge>
               </div>
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
