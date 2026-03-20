import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ShieldCheck, UserCheck, Search, Filter, AlertTriangle, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const ROLE_COLOR_MAP: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
  PG_DEAN: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  SCHOOL_COORDINATOR: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DEPT_COORDINATOR: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  SUPERVISOR: "bg-green-500/10 text-green-500 border-green-500/20",
  EXAMINER: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
};

export function RoleAssignment() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('users').select('*, departments(name)').neq('role', 'STUDENT').order('first_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error("Cloud Synchro Failure", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      // @ts-ignore
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      
      toast.success("Governance Override Successful", { 
        description: `Subject authority recalculated for system node.`,
      });
      fetchUsers();
    } catch (err: any) {
       toast.error("Operation Denied", { description: err.message });
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.first_name + " " + u.last_name + " " + u.email).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto p-4 md:p-0">
      
      {/* Platform Authority Controller */}
      <div className="bg-[#0a0a0a] p-8 rounded-[40px] border border-white/5 shadow-2xl overflow-hidden relative group">
         <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-3 text-center md:text-left">
               <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full">
                  <Key className="text-red-500" size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Authorization Console</span>
               </div>
               <h2 className="text-4xl font-black text-white tracking-tighter">Governance Node Override</h2>
               <p className="text-white/40 max-w-xl text-sm font-medium leading-relaxed">
                  Modify the functional capabilities of institutional staff. Role changes instantly unlock or restrict access to specific management dashboards across the postgraduate network.
               </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[30px] flex flex-col items-center gap-2 min-w-[240px]">
               <ShieldCheck className="text-success" size={40} />
               <p className="text-white font-bold text-lg tabular-nums">{users.length} Managed Nodes</p>
               <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Global Authority Map</p>
            </div>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <Input 
               placeholder="Search credentials, email, or institutional ID..." 
               className="h-14 bg-[#111] border-white/5 rounded-2xl pl-12 text-white font-medium focus:ring-primary/40 focus:bg-[#151515] transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
               <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="h-14 w-full bg-[#111] border border-white/5 rounded-2xl pl-12 pr-6 text-white text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
               >
                  <option value="ALL">Filter: All Roles</option>
                  {Object.keys(ROLE_COLOR_MAP).map(r => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
               </select>
            </div>
            <Button 
               onClick={fetchUsers}
               variant="outline" 
               className="h-14 w-14 rounded-2xl border-white/5 bg-[#111] hover:bg-white/5 text-white p-0 group"
            >
               <Building2 size={20} className="group-active:rotate-180 transition-transform duration-500" />
            </Button>
         </div>
      </div>

      {/* User Authority Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
         <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
               <motion.div 
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0f0f0f] rounded-[32px] border border-white/5 hover:border-white/10 transition-all p-6 flex flex-col gap-6 relative group overflow-hidden"
               >
                  {/* Background Accents */}
                  <div className={`absolute -right-12 -bottom-12 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity ${ROLE_COLOR_MAP[user.role]?.split(" ")[0].replace("bg-", "bg-")}`} />
                  
                  {/* Identity Header */}
                  <div className="flex items-start gap-4 relative z-10">
                     <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-white shadow-inner">
                        {(user.first_name?.[0] || "") + (user.last_name?.[0] || "")}
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-white text-lg truncate">{user.first_name} {user.last_name}</h3>
                           {user.role === 'SUPER_ADMIN' && <Badge className="bg-red-500 h-2 w-2 rounded-full p-0 animate-pulse" />}
                        </div>
                        <p className="text-xs text-white/30 truncate flex items-center gap-1.5 mt-0.5 font-mono">
                           <User size={12} /> {user.email}
                        </p>
                     </div>
                  </div>

                  {/* Institutional Data */}
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Institutional Node</span>
                        <span className="text-[10px] font-bold text-white/50">{user.staff_id || "N/A"}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Operational Branch</span>
                        <span className="text-[10px] font-bold text-primary truncate max-w-[150px]">{user.departments?.name || "Global Admin"}</span>
                     </div>
                  </div>

                  {/* Authority Override Section */}
                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="h-[1px] flex-1 bg-white/5" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/10">Authorize Status</span>
                        <div className="h-[1px] flex-1 bg-white/5" />
                     </div>
                     
                     <div className="flex flex-col gap-3">
                        <Badge className={`w-fit py-1.5 px-4 rounded-xl text-[10px] border font-black uppercase tracking-widest mb-1 ${ROLE_COLOR_MAP[user.role] || "bg-white/10 text-white"}`}>
                           Active: {user.role.replace(/_/g, " ")}
                        </Badge>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2">
                           <select 
                              disabled={isUpdating === user.id}
                              onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                              className="h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-[10px] font-bold text-white focus:outline-none focus:ring-1 focus:ring-primary/40 col-span-2 hover:bg-white/10 transition-colors"
                              value={user.role}
                           >
                              <optgroup label="Higher Governance">
                                 <option value="SUPER_ADMIN">System Administrator</option>
                                 <option value="PG_DEAN">Postgraduate Dean</option>
                              </optgroup>
                              <optgroup label="Structural Oversight">
                                 <option value="SCHOOL_COORDINATOR">School Coordinator</option>
                                 <option value="DEPT_COORDINATOR">Department Coordinator</option>
                              </optgroup>
                              <optgroup label="Academic Interaction">
                                 <option value="SUPERVISOR">Master Supervisor</option>
                                 <option value="EXAMINER">Evaluation Panel/Examiner</option>
                              </optgroup>
                           </select>
                        </div>
                     </div>
                  </div>

                  {isUpdating === user.id && (
                     <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
                        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white animate-pulse">Recalculating Protocols...</span>
                     </div>
                  )}

               </motion.div>
            ))}
         </AnimatePresence>
         
         {filteredUsers.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 rounded-[40px] border border-dashed border-white/10">
               <AlertTriangle className="text-status-warning opacity-50" size={64} />
               <div>
                  <h4 className="text-xl font-bold text-white">No Authorization Targets Found</h4>
                  <p className="text-sm text-white/30 max-w-sm mx-auto mt-2">No staff nodes match the specified governance filter or search criteria.</p>
               </div>
               <Button onClick={() => {setSearchTerm(""); setFilterRole("ALL");}} variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest">
                  Reset Governance Filter
               </Button>
            </div>
         )}
      </div>

    </motion.div>
  );
}
