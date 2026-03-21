import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, Briefcase, Key, Hash, ShieldCheck, Database, Loader2, 
  Mail, School, Building2, Search, MoreVertical, Trash2, ShieldAlert,
  Edit3, CheckCircle2, ChevronRight, UserCircle2, ArrowRight, Zap, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [staffList, setStaffList] = useState<any[]>([]);
  
  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [staffId, setStaffId] = useState("");
  const [selectedRole, setSelectedRole] = useState("SUPERVISOR");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [isExaminer, setIsExaminer] = useState(true);
  
  // Management State
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [{ data: sData }, { data: dData }, { data: stData }] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('departments').select('*').order('name'),
        supabase.from('users').select('*, department:department_id(name, schools(name))')
          .neq('role', 'STUDENT')
          .order('first_name')
      ]);
      
      if (sData) setSchools(sData);
      if (dData) setDepartments(dData);
      if (stData) setStaffList(stData);
    } catch (err: any) {
      toast.error("Initialization Failed", { description: err.message });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStaffProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !selectedDept || !staffId) {
      toast.error("Schema Violation", { description: "Core metadata nodes are required." });
      return;
    }

    setIsLoading(true);
    const defaultPassword = DEFAULT_PASSWORDS[selectedRole] || "staffpassword";

    try {
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
        // @ts-ignore
        const { error: updateError } = await supabase.from('users').update({
          role: selectedRole as any,
          department_id: selectedDept,
          staff_id: staffId,
        }).eq('id', authData.user.id);

        if (updateError) throw updateError;

        toast.success("Institutional Clearance Granted", {
          description: `${fullName} has been provisioned as ${selectedRole}.`,
        });
        
        setFullName(""); setEmail(""); setStaffId(""); setSelectedSchool(""); setSelectedDept("");
        fetchData();
      }
    } catch (err: any) {
      toast.error("Provisioning algorithm failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStaff = async (staff: any) => {
    if (!confirm(`Revoke clearance for ${staff.first_name} ${staff.last_name}?`)) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', staff.id);
      if (error) throw error;
      toast.success("Identity Purged", { description: "Staff credentials revoked from infrastructure." });
      fetchData();
    } catch (err: any) {
      toast.error("Revocation Blocked", { description: "Active mentorship bonds prevent deletion." });
    }
  };

  const filteredStaff = staffList.filter(s => 
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.staff_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInitializing) return (
     <div className="h-screen flex flex-col items-center justify-center gap-6 bg-black/5">
        <div className="w-16 h-16 border-[6px] border-secondary/20 border-t-secondary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-secondary/60 animate-pulse">Synchronizing Authority Gates</p>
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1400px] mx-auto space-y-12 pb-32">
      
      {/* Premium Command Header */}
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-secondary/30 to-primary/30 rounded-[40px] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
         <div className="relative flex flex-col md:flex-row justify-between gap-10 card-shadow bg-card p-12 rounded-[40px] border border-border shadow-3xl overflow-hidden backdrop-blur-3xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform duration-1000">
               <ShieldCheck size={380} />
            </div>
            
            <div className="relative z-10 flex-1 space-y-4">
               <Badge className="bg-secondary/10 text-secondary border-secondary/20 tracking-[0.3em] font-black italic px-4 py-1.5 uppercase text-[9px] mb-2 shadow-sm shadow-secondary/10">Authority Control Node</Badge>
               <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-4">
                  Personnel <span className="text-secondary underline decoration-amber/30 decoration-4 underline-offset-8">Authorization</span> Portal
               </h2>
               <p className="text-sm text-muted-foreground mt-3 max-w-2xl font-medium italic opacity-80 leading-relaxed border-l-4 border-secondary/20 pl-8 py-1">
                  Orchestrating institutional clearance and multi-tier access for supervisors, coordinators, and panel examiners. Mandatory institutional UPI alignment enforced.
               </p>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-6 relative z-10 self-end min-w-[300px]">
               <div className="bg-muted/40 p-5 rounded-[2.5rem] border border-border/40 shadow-inner backdrop-blur-md w-full ring-1 ring-white/10 group-hover:ring-secondary/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Authorization Tier</span>
                     <Badge className="bg-secondary/20 text-secondary border-none scale-75 animate-pulse">LOCKED</Badge>
                  </div>
                  <span className="text-secondary font-mono text-xs font-black tracking-widest uppercase flex items-center gap-3">
                     <Zap size={14} className="fill-secondary animate-shimmer" /> {selectedRole.replace(/_/g, ' ')} 
                  </span>
                  <div className="mt-4 pt-4 border-t border-border/40 flex justify-between items-center">
                     <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">INSTITUTIONAL UPI</span>
                     <span className="text-[10px] font-black text-foreground/60 font-mono tracking-tighter">{staffId || "SPECIFY_ID"}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
         {/* Provisioning Command Terminal */}
         <motion.div variants={itemVariants} className="xl:col-span-3 card-shadow rounded-[50px] bg-card border border-border shadow-4xl overflow-hidden flex flex-col border-t-8 border-t-secondary relative">
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/[0.03] to-transparent pointer-events-none" />
            <div className="p-10 border-b border-border/40 bg-muted/10 flex justify-between items-center backdrop-blur-sm">
               <h3 className="font-black text-foreground text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-[20px] flex items-center justify-center border border-secondary/20 shadow-lg shadow-secondary/5">
                     <UserPlus size={22} className="animate-shimmer" />
                  </div>
                  Credential Provisioning Hub
               </h3>
               <div className="flex items-center gap-3 bg-success/5 border border-success/20 px-4 py-2 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  <span className="text-[9px] uppercase font-black text-success tracking-[0.2em] leading-none">Security Core Nominal</span>
               </div>
            </div>
            
            <form className="p-14 space-y-16" onSubmit={handleStaffProvisioning}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Identity Column */}
                  <div className="space-y-10 group/id">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-secondary flex items-center gap-3 border-b border-border/50 pb-6 mb-10 group-hover/id:tracking-[0.7em] transition-all">
                        <Database size={16} /> Identity Node
                     </h4>
                     
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2">Professional Nomenclature</label>
                        <div className="relative group/input">
                           <UserCircle2 size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-secondary group-focus-within/input:scale-110 transition-all" />
                           <Input className="h-16 bg-muted/10 rounded-[22px] border-2 border-border/40 focus:border-secondary pl-16 pr-8 text-lg font-black transition-all shadow-inner" placeholder="PDRS. David Lagat" value={fullName} onChange={e => setFullName(e.target.value)} />
                        </div>
                     </div>
                     <div className="space-y-4 pt-2">
                        <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2">Institutional Syncer (Email)</label>
                        <div className="relative group/input">
                           <Mail size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within/input:text-secondary transition-all" />
                           <Input type="email" className="h-16 bg-muted/10 rounded-[22px] border-2 border-border/40 focus:border-secondary pl-16 pr-8 text-lg font-black transition-all" placeholder="d.lagat@rongo.ac.ke" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                     </div>
                     <div className="space-y-4 pt-2">
                        <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2">Communication Resolution</label>
                        <Input className="h-16 bg-muted/10 rounded-[22px] border-2 border-border/40 focus:border-secondary px-8 text-lg font-black font-mono opacity-80" placeholder="+254 7XX XXX XXX" />
                     </div>
                  </div>

                  {/* Governance Column */}
                  <div className="space-y-10 group/auth">
                     <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary flex items-center gap-3 border-b border-border/50 pb-6 mb-10 group-hover/auth:tracking-[0.7em] transition-all">
                        <Key size={16} /> Authority Mapping
                     </h4>
                     
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2">Security Authorization Tier</label>
                        <div className="relative">
                           <select 
                              value={selectedRole}
                              onChange={e => setSelectedRole(e.target.value)}
                              className="flex h-16 w-full rounded-[22px] border-2 text-secondary font-black border-secondary/30 bg-secondary/5 px-8 py-2 text-md focus:outline-none focus:ring-4 focus:ring-secondary/5 shadow-2xl appearance-none cursor-pointer transition-all hover:border-secondary/60"
                           >
                              <option value="SUPERVISOR" className="font-bold">Supervisor / Senior Lecturer</option>
                              <option value="DEPT_COORDINATOR" className="font-bold">Department Coordinator</option>
                              <option value="SCHOOL_COORDINATOR" className="font-bold">School Coordinator</option>
                              <option value="PG_DEAN" className="font-bold">Postgraduate Dean</option>
                              <option value="EXAMINER" className="font-bold">External / Panel Examiner</option>
                              <option value="SUPER_ADMIN" className="font-bold">System Global Administrator</option>
                           </select>
                           <ShieldAlert size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-secondary opacity-40 pointer-events-none" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2 flex items-center gap-2"><School size={12} className="text-primary"/> Target School</label>
                           <select 
                              value={selectedSchool}
                              onChange={e => {
                                 setSelectedSchool(e.target.value);
                                 setSelectedDept("");
                              }}
                              className="flex h-14 w-full rounded-2xl border-2 border-border/40 bg-background px-6 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all hover:border-primary/40 shadow-inner"
                           >
                              <option value="" className="italic">Choose Host Node</option>
                              {schools.map(s => <option key={s.id} value={s.id} className="font-bold">{s.name}</option>)}
                           </select>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest px-2 flex items-center gap-2"><Building2 size={12} className="text-primary"/> Department</label>
                           <select 
                              value={selectedDept}
                              onChange={e => setSelectedDept(e.target.value)}
                              disabled={!selectedSchool}
                              className="flex h-14 w-full rounded-2xl border-2 border-border/40 bg-background px-6 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none disabled:opacity-30 transition-all hover:border-primary/40 shadow-inner"
                           >
                              <option value="" className="italic">— Allocate Juris —</option>
                              {departments.filter(d => d.school_id === selectedSchool).map(d => (
                                 <option key={d.id} value={d.id} className="font-bold">{d.name}</option>
                              ))}
                           </select>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-2 flex justify-between items-center">
                           <span>Institutional UPI (Staff ID)</span>
                           <Badge className="bg-secondary/10 text-secondary border-none text-[8px] animate-pulse">CRITICAL NODE</Badge>
                        </label>
                        <Input 
                           className="h-20 bg-muted/10 font-mono font-black border-secondary/40 text-secondary rounded-[24px] text-2xl shadow-inner text-center tracking-[0.2em] focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" 
                           placeholder="RU/PG/XXXX" 
                           value={staffId}
                           onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                        />
                     </div>
                  </div>
               </div>

               <div className="pt-10 border-t border-border/40 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                     <label className="flex items-center gap-4 p-5 rounded-[2rem] border border-border/60 bg-muted/5 hover:bg-muted/20 cursor-pointer transition-all active:scale-[0.98] group/checker ring-offset-2 ring-primary/20 hover:ring-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExaminer ? 'bg-success text-white' : 'bg-muted/40 text-muted-foreground/40'}`}>
                           {isExaminer ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                        </div>
                        <input 
                           type="checkbox" 
                           className="hidden" 
                           checked={isExaminer} 
                           onChange={e => setIsExaminer(e.target.checked)} 
                        />
                        <div className="flex-1">
                           <span className="text-xs font-black block text-foreground leading-none group-hover/checker:text-secondary transition-colors uppercase italic">Grant Examiner Status</span>
                           <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground block mt-1.5 opacity-60">Authorize participation in assessment committees</span>
                        </div>
                     </label>
                  </div>

                  <Button 
                     onClick={handleStaffProvisioning}
                     disabled={isLoading}
                     className="h-20 px-16 bg-black hover:bg-secondary text-white font-black text-[12px] uppercase tracking-[0.4em] shadow-3xl shadow-black/20 hover:shadow-secondary/30 transition-all active:scale-95 rounded-[30px] group"
                  >
                     {isLoading ? <Loader2 className="animate-spin" /> : (
                        <div className="flex items-center gap-4">
                           Provision Account <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform duration-500" />
                        </div>
                     )}
                  </Button>
               </div>
            </form>
         </motion.div>

         {/* UPI Master Intel Card */}
         <motion.div variants={itemVariants} className="xl:col-span-2 space-y-12">
            <div className="bg-gradient-to-br from-[#0c0c10] to-[#1a1a24] rounded-[50px] border border-white/10 shadow-5xl p-12 flex flex-col items-center justify-center text-center relative overflow-hidden group/intel">
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary via-amber to-secondary shadow-[0_0_25px_rgba(251,191,36,0.3)] opacity-80 group-hover:h-3 transition-all"></div>
               <div className="absolute -right-16 -bottom-16 opacity-5 rotate-12 group-hover:rotate-[20deg] group-hover:scale-110 transition-transform duration-1000">
                  <Hash size={240} className="text-white" />
               </div>
               
               <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-secondary mb-10 shadow-2xl backdrop-blur-3xl group-hover:rotate-12 transition-transform duration-700">
                  <Hash size={40} className="animate-pulse" />
               </div>
               
               <h3 className="font-black text-[12px] text-white uppercase tracking-[0.4em] mb-4 italic opacity-80">Institutional Intel Node</h3>
               <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] mb-10 px-8 leading-relaxed">Unique Personnel Identifier Synchronization Matrix</p>
               
               <div className="w-full px-12 py-8 bg-black/40 border-2 border-dashed border-secondary/30 rounded-[35px] shadow-2xl relative group-hover:border-secondary/60 transition-all duration-700 backdrop-blur-xl group-hover:scale-[1.05]">
                  <span className="text-4xl font-mono text-secondary font-black tracking-[0.2em] italic drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">{staffId || "RESOLVING-ID"}</span>
               </div>
               
               <div className="mt-12 flex items-center justify-center gap-8 w-full">
                  {[
                     { label: "Identity", state: !!fullName, color: "secondary" },
                     { label: "Jurisdiction", state: !!selectedDept, color: "primary" },
                     { label: "UPI Key", state: staffId.length >= 4, color: "amber" }
                  ].map((p, i) => (
                     <div key={i} className={`flex flex-col items-center gap-3 transition-all duration-500 ${p.state ? 'scale-110 opacity-100' : 'opacity-20 translate-y-2'}`}>
                        <div className={`w-4 h-4 rounded-full ${p.state ? 'bg-success shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-white/10'}`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{p.label}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-card/40 backdrop-blur-3xl p-12 rounded-[50px] border border-border shadow-2xl relative group overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-all">
                  <ShieldCheck size={140} className="text-primary" />
               </div>
               <h5 className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/60 mb-8 italic flex items-center gap-3">
                  <ShieldCheck size={16} /> Protocol Advisory
               </h5>
               <div className="space-y-6">
                  <p className="text-sm text-foreground/80 leading-relaxed italic font-medium opacity-70 border-l-2 border-primary/20 pl-6 group-hover:border-primary transition-all">
                    "Personnel provisioned through this gateway inherit default security protocols. Identity synchronization requires Institutional Email validation."
                  </p>
                  <div className="pt-6 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 italic">
                     <CheckCircle2 size={12} className="text-success" /> Multi-Factor Authentication Active
                  </div>
               </div>
            </div>
         </motion.div>
      </div>

      {/* GLOBAL STAFF LISTING MATRIX */}
      <motion.div variants={itemVariants} className="pt-24 space-y-12">
         <div className="flex flex-col md:flex-row justify-between items-end gap-10 px-8">
            <div className="space-y-4">
               <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-5">
                  Institutional <span className="text-secondary italic">Personnel Nodes</span>
               </h3>
               <div className="flex items-center gap-4 group/stats">
                  <div className="h-1.5 w-12 bg-secondary rounded-full group-hover:w-20 transition-all" />
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.5em] italic opacity-60">Global Academic Authority Register</p>
               </div>
            </div>

            <div className="relative group min-w-[400px]">
               <div className="absolute -inset-0.5 bg-secondary/20 rounded-3xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
               <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-secondary transition-all scale-110" />
                  <Input 
                     placeholder="Search Personnel by Name, ID or Role..." 
                     className="h-18 pl-16 pr-8 bg-card border-2 border-border/80 focus:border-secondary rounded-[24px] font-black text-md tracking-wide shadow-2xl focus:shadow-secondary/10 transition-all"
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>
         </div>

         <div className="bg-card rounded-[60px] border border-border shadow-5xl overflow-hidden relative border-b-[15px] border-b-secondary/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/[0.04] via-transparent to-primary/[0.04] pointer-events-none" />
            <table className="w-full relative z-10">
               <thead>
                  <tr className="bg-muted text-[11px] font-black uppercase text-muted-foreground tracking-[0.4em] italic border-b border-border/60">
                     <td className="p-10 pl-14">Personnel Identity</td>
                     <td className="p-10">Institutional Jurisdiction</td>
                     <td className="p-10">Deployment Tier</td>
                     <td className="p-10 text-right pr-16">Authorization Desk</td>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/40">
                  <AnimatePresence mode="popLayout">
                     {filteredStaff.map((staff, i) => (
                        <motion.tr 
                          key={staff.id}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-secondary/[0.03] transition-all border-l-[10px] border-l-transparent hover:border-l-secondary"
                        >
                           <td className="p-10 pl-14">
                              <div className="flex items-center gap-8">
                                 <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-secondary/10 to-amber/10 flex items-center justify-center text-secondary shadow-xl border border-white/50 group-hover:rotate-6 transition-all duration-700">
                                    <UserCircle2 size={30} className="group-hover:scale-110 transition-transform" />
                                 </div>
                                 <div className="space-y-2">
                                    <span className="text-xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-3">
                                       {staff.first_name} {staff.last_name}
                                       {staff.role === 'SUPER_ADMIN' && <Badge className="bg-rose-500 text-white border-none scale-75 h-5">ROOT</Badge>}
                                    </span>
                                    <div className="flex items-center gap-4">
                                       <Badge className="bg-secondary/10 text-secondary border-none text-[9px] font-black px-4 py-1.5 shadow-sm uppercase tracking-[0.2em]">{staff.staff_id || "NOT_ASSIGNED"}</Badge>
                                       <span className="text-[10px] font-bold text-muted-foreground/50 italic lowercase tracking-wider border-l border-border pl-4">{staff.email}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-10">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase text-foreground/80 tracking-widest mb-1 group-hover:text-secondary transition-colors italic">{staff.department?.name || "Global Command"}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter flex items-center gap-2">
                                       <School size={10} className="text-secondary opacity-40"/> {staff.department?.schools?.name || "RU Main Campus"}
                                    </span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-10">
                              <div className="flex flex-col gap-3">
                                 <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-2xl w-fit italic ${
                                   staff.role.includes('ADMIN') ? 'text-rose-500 border-rose-500/30 bg-rose-500/5' : 
                                   staff.role.includes('DEAN') ? 'text-primary border-primary/30 bg-primary/5' :
                                   'text-secondary border-secondary/30 bg-secondary/5'
                                 }`}>
                                    {staff.role.replace(/_/g, ' ')}
                                 </Badge>
                                 <div className="flex items-center gap-2 px-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${staff.is_active ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                                    <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Status: {staff.is_active ? 'Active' : 'Offline'}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="p-10 text-right pr-16">
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-14 w-14 rounded-[22px] hover:bg-muted font-black border border-transparent hover:border-border transition-all shadow-sm hover:shadow-md">
                                       <MoreVertical size={24} />
                                    </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="w-72 p-4 rounded-[32px] bg-card border-2 border-border/80 shadow-5xl backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
                                    <DropdownMenuItem className="p-4 font-black flex items-center gap-4 cursor-pointer rounded-2xl mb-1 group hover:bg-secondary/5 hover:text-secondary transition-all">
                                       <Edit3 size={18} className="text-muted-foreground group-hover:text-secondary transition-colors" /> Edit Profile Node
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-4 font-black flex items-center gap-4 cursor-pointer rounded-2xl mb-1 group hover:bg-primary/5 hover:text-primary transition-all">
                                       <ShieldCheck size={18} className="text-muted-foreground group-hover:text-primary transition-colors" /> Access Control
                                    </DropdownMenuItem>
                                    <div className="h-px bg-border/40 my-3 mx-2" />
                                    <DropdownMenuItem 
                                       onClick={() => handleDeleteStaff(staff)}
                                       className="p-4 font-black text-rose-500 flex items-center gap-4 cursor-pointer rounded-2xl group hover:bg-rose-500/10 transition-all"
                                    >
                                       <Trash2 size={18} /> Revoke Clearance
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
            
            {filteredStaff.length === 0 && (
               <div className="p-40 flex flex-col items-center justify-center text-center space-y-8">
                  <div className="w-32 h-32 rounded-[40px] bg-muted/20 flex items-center justify-center text-muted-foreground opacity-20 shadow-inner group">
                     <Search size={50} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-3">
                     <h4 className="text-2xl font-black text-foreground/30 uppercase tracking-tighter italic">Identity Void Detected</h4>
                     <p className="text-xs font-bold text-muted-foreground/50 italic max-w-sm uppercase tracking-widest leading-relaxed">No personnel nodes match your current search vector. Provision new authorities via the gateway portal.</p>
                  </div>
               </div>
            )}

            <div className="p-12 border-t border-border/60 bg-secondary/[0.03] flex flex-col lg:flex-row justify-between items-center gap-10">
               <div className="flex flex-wrap items-center gap-12">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2 px-1">Infrastructure Health</span>
                     <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-white/80 shadow-sm">
                        <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                        <span className="text-xs font-black text-foreground uppercase tracking-widest">Global Synced</span>
                     </div>
                  </div>
                  <div className="h-10 w-px bg-border hidden lg:block" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-2 px-1">Authority Counter</span>
                     <span className="text-xs font-black text-foreground uppercase tracking-[0.2em] italic bg-secondary/10 px-4 py-2 rounded-2xl border border-secondary/20 shadow-sm">{staffList.length} Active System Personnel</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Button variant="outline" className="h-16 px-12 border-2 border-border/60 rounded-[22px] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-secondary hover:text-white hover:border-secondary transition-all active:scale-95 shadow-xl group">
                     Institutional Export <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
                  </Button>
               </div>
            </div>
         </div>
      </motion.div>

    </motion.div>
  );
}
