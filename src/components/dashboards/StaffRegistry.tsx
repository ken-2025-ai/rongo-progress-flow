import { motion } from "framer-motion";
import { UserPlus, Briefcase, Key, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";

export function StaffRegistry() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 card-shadow bg-card p-6 rounded-2xl border border-border">
         <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
               <Briefcase className="text-secondary"/> Academic Staff Registry
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
               Provision institutional access for Lecturers, Coordinators, Examiners, and Deans. Assign roles, ranks, and examiner toggles with immediate effect.
            </p>
         </div>
         <div className="flex shrink-0">
            <Button className="h-10 px-6 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
               Provision Staff Account
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Manual Provision Form */}
         <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col md:col-span-2">
            <div className="p-5 border-b border-border/50 bg-secondary/10 flex justify-between items-center">
               <h3 className="font-bold text-secondary text-sm uppercase tracking-widest flex items-center gap-2">
                  <UserPlus size={16}/> Staff Provisioning Interface
               </h3>
               <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest bg-background border border-border/50 px-2 py-0.5 rounded">UPI Generation Active</span>
            </div>
            
            <form className="p-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Identity */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Academic Profile Profile</h4>
                     
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Full Name / Title</label>
                        <Input className="h-11 bg-background" placeholder="e.g. Dr. John Omondi" />
                     </div>
                     <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-foreground">Official Institution Email</label>
                        <Input type="email" className="h-11 bg-background" placeholder="j.omondi@rongo.ac.ke" />
                     </div>
                     <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-foreground">Contact Phone</label>
                        <Input className="h-11 bg-background" placeholder="+254..." />
                     </div>
                  </div>

                  {/* Operational Settings */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Governance Settings</h4>
                     
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground border-l-2 border-primary pl-2 uppercase tracking-wide">Primary System Role</label>
                        <select className="flex h-11 w-full rounded-md border text-primary font-bold border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner">
                           <option>Supervisor / Lecturer</option>
                           <option>Department Coordinator</option>
                           <option>School Cooridnator</option>
                           <option>Postgraduate Dean</option>
                           <option>Panel / Examiner Only</option>
                        </select>
                     </div>

                     <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-foreground">Department Allocation</label>
                        <select className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                           <option>Computing & Information Technology (CIT)</option>
                           <option>Linguistics</option>
                           <option>Business Admin</option>
                        </select>
                     </div>

                     <div className="pt-4 mt-2 border-t border-border/50">
                        <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer transition-colors">
                           <input type="checkbox" className="h-4 w-4 bg-background border-border checked:bg-primary" defaultChecked />
                           <div className="space-y-0.5">
                              <span className="text-sm font-bold block text-foreground leading-none">Can Act As Examiner</span>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block">Injects into Viva Panel Pool</span>
                           </div>
                        </label>
                     </div>
                  </div>
               </div>
            </form>
         </motion.div>

         {/* UPI Generator Display */}
         <motion.div variants={itemVariants} className="md:col-span-2 bg-gradient-to-r from-card to-secondary/5 rounded-2xl border border-secondary/20 shadow-sm p-6 flex flex-col items-center justify-center text-center">
            <Hash size={32} className="text-secondary/50 mb-3" />
            <h3 className="font-bold text-sm text-foreground uppercase tracking-widest mb-1">Projected UPI (Universal Personnel Identifier)</h3>
            <div className="px-6 py-2 bg-background border-2 border-dashed border-secondary/40 rounded-lg shadow-inner mt-2">
               <span className="text-2xl font-mono text-secondary font-black tracking-[0.2em]">UPI-CIT-01<span className="animate-pulse">_</span></span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4 font-bold border-t border-border/50 pt-3">
               <Key size={10} className="inline mr-1" />
               Generated algorithmically upon creation
            </p>
         </motion.div>
      </div>

    </motion.div>
  );
}
