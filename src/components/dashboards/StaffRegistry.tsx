import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, Briefcase, Key, Hash, ShieldCheck, Database, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEFAULT_PASSWORDS: Record<string, string> = {
  SUPERVISOR: "supervisor",
  DEPT_COORDINATOR: "pgcoordinator",
  SCHOOL_COORDINATOR: "pgcoordinator",
  PG_DEAN: "pgdean",
  EXAMINER: "pgexaminer",
  SUPER_ADMIN: "rongoadmin"
};

export function StaffRegistry() {
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [selectedRole, setSelectedRole] = useState("SUPERVISOR");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isExaminer, setIsExaminer] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // @ts-ignore
    supabase.from('schools').select('*').then(({ data }) => setSchools(data || []));
    // @ts-ignore
    supabase.from('departments').select('*').then(({ data }) => setDepartments(data || []));
  }, []);

  const handleStaffProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !selectedDept || !staffId) {
      toast.error("Schema Violation", { description: "Name, email, department, and Staff ID (UPI) are required." });
      return;
    }

    if (staffId.length < 4) {
      toast.error("Validation Error", { description: "Institutional Staff ID must be at least 4 characters." });
      return;
    }

    setIsLoading(true);
    const defaultPassword = DEFAULT_PASSWORDS[selectedRole] || "staffpassword";

    try {
      // 1. Auth Provisioning
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: defaultPassword,
        options: {
          data: {
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ').slice(1).join(' '),
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Update role, department, and staff_id on the public.users record
        // Note: The database trigger handles the initial record creation, so we update it here.
        // @ts-ignore
        const { error: updateError } = await supabase.from('users').update({
          role: selectedRole as any,
          department_id: selectedDept,
          staff_id: staffId,
          // If we had a boolean 'is_examiner' column, we would update it here:
          // is_examiner: isExaminer
        }).eq('id', authData.user.id);

        if (updateError) throw updateError;

        toast.success("Staff Account Provisioned", {
          description: `${fullName} has been successfully registered in the ${selectedRole} tier with UPI: ${staffId}.`,
        });
        
        setFullName("");
        setEmail("");
        setStaffId("");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Provisioning Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6 pb-20">
      
      {/* Premium Header Container */}
      <div className="flex flex-col md:flex-row justify-between gap-6 card-shadow bg-card p-10 rounded-[2.5rem] border border-border shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
            <ShieldCheck size={180} />
         </div>
         <div className="relative z-10 flex-1">
            <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 mb-4 mb-4">Personnel Command Node</Badge>
            <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
               <Briefcase className="text-secondary" size={32} /> Academic Staff Registry
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-xl font-medium italic opacity-80 leading-relaxed">
               Granting institutional clearance and provisioning access for supervisors, coordinators, and panel examiners. IDs are locked to personnel metadata upon creation.
            </p>
         </div>
         <div className="relative z-10 flex flex-col justify-end items-end gap-3 min-w-[240px]">
            <div className="bg-muted/10 p-4 rounded-2xl border border-border/60 w-full">
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] block mb-1">Assigned Security Tier</span>
               <span className="text-secondary font-mono text-xs font-black tracking-tight uppercase flex items-center justify-between">
                  {selectedRole.replace(/_/g, ' ')} 
                  <span className="bg-secondary/20 text-[10px] px-2 py-0.5 rounded">ID: {staffId || "TBD"}</span>
               </span>
               <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase opacity-40">Initial Key: {DEFAULT_PASSWORDS[selectedRole] || "staffpassword"}</p>
            </div>
            <Button 
              onClick={handleStaffProvisioning}
              disabled={isLoading}
              className="w-full h-14 bg-secondary hover:bg-secondary/90 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-secondary/30 transition-all active:scale-[0.98] rounded-2xl"
            >
               {isLoading ? <Loader2 className="animate-spin" /> : "Authorize & Provision Account"}
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Provisioning Form */}
         <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-[2rem] bg-card border border-border shadow-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border bg-muted/5 flex justify-between items-center">
               <h3 className="font-black text-foreground text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <UserPlus size={16} className="text-secondary"/> Staff Metadata Entry
               </h3>
               <div className="flex items-center gap-2 bg-success/5 border border-success/10 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[10px] uppercase font-black text-success tracking-widest leading-none">Institutional UPI active</span>
               </div>
            </div>
            
            <form className="p-8 space-y-10" onSubmit={handleStaffProvisioning}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Identity Column */}
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-3 mb-6">
                        <Database size={14} /> Scholastic Credentials
                     </h4>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider">Professional Title & Name</label>
                        <Input className="h-12 bg-background rounded-xl border-border/50 text-sm" placeholder="e.g. Prof. David Lagat" value={fullName} onChange={e => setFullName(e.target.value)} />
                     </div>
                     <div className="space-y-2 pt-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider">Academic Institutional Email</label>
                        <Input type="email" className="h-12 bg-background rounded-xl border-border/50 text-sm" placeholder="d.lagat@rongo.ac.ke" value={email} onChange={e => setEmail(e.target.value)} />
                     </div>
                     <div className="space-y-2 pt-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider">Contact Resolution</label>
                        <Input className="h-12 bg-background rounded-xl border-border/50 text-sm" placeholder="+254 7XX XXX XXX" />
                     </div>
                  </div>

                  {/* Governance Column */}
                  <div className="space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 border-b border-border/50 pb-3 mb-6">
                        <Key size={14} /> Authorization Parameters
                     </h4>
                     
                     <div className="space-y-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider">System Role Level</label>
                        <select 
                          value={selectedRole}
                          onChange={e => setSelectedRole(e.target.value)}
                          className="flex h-12 w-full rounded-xl border-2 text-primary font-black border-primary/20 bg-primary/5 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-inner appearance-none"
                        >
                           <option value="SUPERVISOR">Supervisor / Senior Lecturer</option>
                           <option value="DEPT_COORDINATOR">Department Coordinator</option>
                           <option value="SCHOOL_COORDINATOR">School Coordinator</option>
                           <option value="PG_DEAN">Postgraduate Dean</option>
                           <option value="EXAMINER">External / Panel Examiner</option>
                           <option value="SUPER_ADMIN">System Global Administrator</option>
                        </select>
                     </div>

                      <div className="space-y-2 pt-2">
                         <label className="text-xs font-black text-foreground uppercase tracking-wider">School Allocation</label>
                         <select 
                           value={selectedSchool}
                           onChange={e => {
                              setSelectedSchool(e.target.value);
                              setSelectedDept("");
                           }}
                           className="flex h-12 w-full rounded-xl border border-border/50 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                         >
                            <option value="">Choose School Node...</option>
                            <option value="INFOCOMS">INFOCOMS (Information & Comm.)</option>
                            <option value="SAES">SAES (Arts & Env.)</option>
                            <option value="SASSB">SASSB (Social Sciences)</option>
                            <option value="Education">School of Education</option>
                            {schools.filter(s => !['INFOCOMS', 'SAES', 'SASSB', 'Education'].includes(s.name)).map(s => (
                               <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                         </select>
                      </div>

                      <div className="space-y-2 pt-2">
                         <label className="text-xs font-black text-foreground uppercase tracking-wider">Departmental Jurisdiction</label>
                         <select 
                           value={selectedDept}
                           onChange={e => setSelectedDept(e.target.value)}
                           className="flex h-12 w-full rounded-xl border border-border/50 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                         >
                            <option value="">Allocate Department...</option>
                            {selectedSchool === 'INFOCOMS' && (
                               <>
                                 <option value="IHRS">Information & Health Research</option>
                                 <option value="CMJ">Comm. & Media Journalism</option>
                               </>
                            )}
                            {departments.filter(d => d.school_id === selectedSchool).map(d => (
                               <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                         </select>
                      </div>

                     <div className="space-y-2 pt-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-wider font-mono">Institutional UPI (Staff ID)</label>
                        <Input 
                          className="h-12 bg-background font-mono font-black border-secondary/30 text-secondary rounded-xl text-lg shadow-inner" 
                          placeholder="e.g. RU/PG/1001" 
                          value={staffId}
                          onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                        />
                     </div>

                     <div className="pt-6 mt-4 border-t border-border/30">
                        <label className="flex items-center gap-4 p-5 rounded-2xl border border-border/60 hover:bg-muted/10 cursor-pointer transition-all active:scale-[0.99] group/check">
                           <input 
                             type="checkbox" 
                             className="h-6 w-6 rounded-lg text-secondary focus:ring-secondary border-border/80" 
                             checked={isExaminer} 
                             onChange={e => setIsExaminer(e.target.checked)} 
                           />
                           <div className="flex-1">
                              <span className="text-sm font-black block text-foreground leading-none group-hover/check:text-secondary transition-colors">Grant Examiner Status</span>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mt-1 opacity-70">Enable participation in viva assessment panels</span>
                           </div>
                        </label>
                     </div>
                  </div>
               </div>
               <input type="submit" className="hidden" />
            </form>
         </motion.div>

         {/* UPI Generator & Preview */}
         <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-gradient-to-br from-card to-secondary/5 rounded-[2rem] border border-secondary/20 shadow-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
               <Hash size={48} className="text-secondary/30 mb-5 group-hover:rotate-12 transition-transform" />
               <h3 className="font-black text-[11px] text-foreground uppercase tracking-[0.3em] mb-3">Institutional UPI Engine</h3>
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-6 px-4">Locked Unique Personnel Identifier</p>
               
               <div className="w-full px-8 py-5 bg-background border-2 border-dashed border-secondary/40 rounded-2xl shadow-inner relative group-hover:border-secondary/60 transition-colors">
                  <span className="text-3xl font-mono text-secondary font-black tracking-[0.1em]">{staffId || "SPECIFY-ID"}</span>
               </div>
               
               <div className="mt-8 flex items-center justify-center gap-6 w-full opacity-60">
                  <div className="flex flex-col items-center">
                     <div className={`w-3 h-3 rounded-full mb-1 ${fullName ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-muted'}`} />
                     <span className="text-[8px] font-black uppercase">Identity</span>
                  </div>
                  <div className="h-px bg-border flex-1 mx-2" />
                  <div className="flex flex-col items-center">
                     <div className={`w-3 h-3 rounded-full mb-1 ${selectedDept ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-muted'}`} />
                     <span className="text-[8px] font-black uppercase">Authority</span>
                  </div>
                  <div className="h-px bg-border flex-1 mx-2" />
                  <div className="flex flex-col items-center">
                     <div className={`w-3 h-3 rounded-full mb-1 ${staffId.length >= 4 ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-muted'}`} />
                     <span className="text-[8px] font-black uppercase">UPI Valid</span>
                  </div>
               </div>
            </div>

            <div className="bg-muted/10 p-8 rounded-[2rem] border border-border/40 font-medium">
               <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Security Policy Note</h5>
               <p className="text-xs text-muted-foreground leading-relaxed italic">
                 "Personnel provisioned through this gateway inherit the default security protocol associated with their tier. Credentials should be rotated via the self-service portal upon first synchronization."
               </p>
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
