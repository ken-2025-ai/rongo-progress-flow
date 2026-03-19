import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Briefcase, Key, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function StaffRegistry() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("SUPERVISOR");
  const [selectedDept, setSelectedDept] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // @ts-ignore
    supabase.from('departments').select('*').then(({ data }) => {
      if (data) setDepartments(data);
    });
  }, []);

  const handleStaffProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !selectedDept) {
      toast.error("Schema Violation", { description: "Department and email are required for provision." });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Auth Provisioning
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: "StaffPassword123!", // In a real system, use invite system
        options: {
          data: {
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ').slice(1).join(' '),
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Update role and department on the public.users record
        // The trigger created the row initially as STUDENT (default)
        // @ts-ignore
        const { error: updateError } = await supabase.from('users').update({
          role: selectedRole as any,
          department_id: selectedDept,
          staff_id: `RU/PG/${Math.floor(Math.random() * 9000) + 1000}`
        }).eq('id', authData.user.id);

        if (updateError) throw updateError;

        toast.success("Staff Account Locked", {
          description: `${fullName} has been provisioned as ${selectedRole}.`,
        });
        
        setFullName("");
        setEmail("");
      }
    } catch (err: any) {
      toast.error("Provisioning Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

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
            <Button 
              onClick={handleStaffProvisioning}
              disabled={isLoading}
              className="h-10 px-6 bg-secondary hover:bg-secondary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
               {isLoading ? "Provisioning..." : "Provision Staff Account"}
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
            
            <form className="p-6" onSubmit={handleStaffProvisioning}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Identity */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Academic Profile</h4>
                     
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Full Name / Title</label>
                        <Input className="h-11 bg-background" placeholder="e.g. Dr. John Omondi" value={fullName} onChange={e => setFullName(e.target.value)} />
                     </div>
                     <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-foreground">Official Institution Email</label>
                        <Input type="email" className="h-11 bg-background" placeholder="j.omondi@rongo.ac.ke" value={email} onChange={e => setEmail(e.target.value)} />
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
                        <select 
                          value={selectedRole}
                          onChange={e => setSelectedRole(e.target.value)}
                          className="flex h-11 w-full rounded-md border text-primary font-bold border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
                        >
                           <option value="SUPERVISOR">Supervisor / Lecturer</option>
                           <option value="DEPT_COORDINATOR">Department Coordinator</option>
                           <option value="SCHOOL_COORDINATOR">School Coordinator</option>
                           <option value="PG_DEAN">Postgraduate Dean</option>
                           <option value="EXAMINER">Panel / Examiner Only</option>
                        </select>
                     </div>

                     <div className="space-y-1.5 pt-2">
                        <label className="text-xs font-bold text-foreground">Department Allocation</label>
                        <select 
                          value={selectedDept}
                          onChange={e => setSelectedDept(e.target.value)}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                           <option value="">Select Department</option>
                           {departments.map(d => (
                             <option key={d.id} value={d.id}>{d.name}</option>
                           ))}
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
               <span className="text-2xl font-mono text-secondary font-black tracking-[0.2em]">UPI-{departments.find(d => d.id === selectedDept)?.name || "PG"}-01<span className="animate-pulse">_</span></span>
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
