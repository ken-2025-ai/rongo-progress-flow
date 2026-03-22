import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, GraduationCap, Building2, ListTree, School as SchoolIcon, 
  Layers, MapPin, Search, PlusCircle, MoreVertical, Edit3, CheckCircle2,
  ChevronRight, ArrowRight, Zap, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRole } from "@/contexts/RoleContext";
import { isSimulationDemoUser } from "@/lib/authGuards";
import { formatSupabaseCallError } from "@/lib/supabaseErrors";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AcademicStructure() {
  const { user } = useRole();
  const [activeTab, setActiveTab] = useState("schools");
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  
  // Create States
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [newProgName, setNewProgName] = useState("");
  const [newProgCode, setNewProgCode] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        toast.error("Configuration Required", {
          description: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.",
        });
        return;
      }
      const { data: sData } = await supabase.from('schools').select('*').order('name');
      const { data: dData } = await supabase.from('departments').select('*, schools(name)').order('name');
      const { data: pData } = await supabase.from('programmes').select('*, department:department_id(name, schools(name))').order('name');
      
      if (sData) setSchools(sData);
      if (dData) setDepartments(dData);
      if (pData) setProgrammes(pData);
    } catch (err: unknown) {
      toast.error("Initialization Failed", {
        description: formatSupabaseCallError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName) return;
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase environment variables are missing. Update .env and restart the app.");
      }
      if (isSimulationDemoUser(user)) {
        throw new Error(
          "Simulation login has no database session. Configure Supabase and sign in at /system-admin with a user whose public.users.role is SUPER_ADMIN."
        );
      }
      const { error } = await supabase.from('schools').insert({ name: newSchoolName });
      if (error) throw error;
      toast.success("Institutional Node Active", { description: `${newSchoolName} has been established.` });
      setNewSchoolName("");
      fetchData();
    } catch (err: unknown) {
      toast.error("Deployment Error", { description: formatSupabaseCallError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !selectedSchoolId) return;
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase environment variables are missing. Update .env and restart the app.");
      }
      if (isSimulationDemoUser(user)) {
        throw new Error(
          "Simulation login has no database session. Sign in with a real SUPER_ADMIN account."
        );
      }
       // @ts-ignore
      const { error } = await supabase.from('departments').insert({ 
        name: newDeptName, 
        school_id: selectedSchoolId 
      });
      if (error) throw error;
      toast.success("Department Online", { description: `${newDeptName} mapped to host school.` });
      setNewDeptName("");
      fetchData();
    } catch (err: unknown) {
      toast.error("Deployment Error", { description: formatSupabaseCallError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName || !selectedDeptId || !newProgCode) {
      toast.error("Constraint Violation", { description: "Title, Code and Department mapping are mandatory." });
      return;
    }

    setIsLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase environment variables are missing. Update .env and restart the app.");
      }
      if (isSimulationDemoUser(user)) {
        throw new Error(
          "Simulation login has no database session. Sign in with a real SUPER_ADMIN account."
        );
      }
       // @ts-ignore
      const { error } = await supabase.from('programmes').insert({ 
        name: newProgName, 
        code: newProgCode.toUpperCase(),
        department_id: selectedDeptId 
      });
      if (error) throw error;
      
      toast.success("Curriculum Pillar Established", { description: `${newProgName} has been appended.` });
      setNewProgName("");
      setNewProgCode("");
      fetchData();
    } catch (err: unknown) {
      toast.error("Deployment Error", { description: formatSupabaseCallError(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (table: string, id: string, name: string) => {
    if (!confirm(`Are you certain you wish to decommission ${name}? This action is destructive.`)) return;
    
    try {
      if (!isSupabaseConfigured) {
        throw new Error("Supabase is not configured.");
      }
      if (isSimulationDemoUser(user)) {
        throw new Error("Simulation login cannot modify the database.");
      }
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success("Node Decommissioned", { description: `${name} removed from infrastructure.` });
      fetchData();
    } catch (err: unknown) {
      const msg = formatSupabaseCallError(err);
      toast.error("Operation Denied", {
        description:
          msg.includes("Simulation") || msg.includes("not configured")
            ? msg
            : "Dependency detected or permission denied: " + msg,
      });
    }
  };

  const filteredSchools = schools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.schools?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProgrammes = programmes.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* Premium Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-[40px] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
        <div className="relative bg-card p-10 rounded-[35px] border border-border shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 overflow-hidden">
          <div className="absolute right-0 top-0 opacity-[0.02] -mr-20 -mt-20 rotate-12 pointer-events-none">
            <Building2 size={400} />
          </div>
          
          <div className="space-y-4 relative z-10">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-[18px] text-primary">
                   <Layers size={30} className="animate-shimmer" />
                </div>
                <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic">
                   Academic <span className="text-primary">Architecture</span>
                </h2>
             </div>
             <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed italic border-l-4 border-primary/30 pl-6">
                Orchestrating the institutional hierarchy. Define Schools, map Departments, and provision postgraduate Programmes for the Rongo University metadata engine.
             </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 min-w-[200px] relative z-10">
             <div className="bg-muted flex p-1.5 rounded-2xl border border-border/50 shadow-inner">
                <div className="px-4 py-2 bg-card rounded-xl border border-border/60 shadow-sm">
                   <span className="block text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5">Global Status</span>
                   <span className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live Infrastructure
                   </span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        
        {/* Navigation & Stats */}
        <div className="xl:col-span-1 space-y-8">
           <div className="card-shadow rounded-[32px] bg-card border border-border overflow-hidden shadow-xl">
              <div className="p-4 space-y-2">
                 {[
                   { id: "schools", icon: <SchoolIcon size={18} />, label: "Institutional Schools", count: schools.length },
                   { id: "depts", icon: <Building2 size={18} />, label: "Academic Departments", count: departments.length },
                   { id: "programmes", icon: <GraduationCap size={18} />, label: "Postgraduate Degrees", count: programmes.length },
                 ].map((nav) => (
                   <button
                     key={nav.id}
                     onClick={() => setActiveTab(nav.id)}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                       activeTab === nav.id 
                       ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]" 
                       : "hover:bg-muted text-muted-foreground hover:text-foreground"
                     }`}
                   >
                     <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${activeTab === nav.id ? "bg-white/20" : "bg-primary/5 text-primary group-hover:bg-primary/10"}`}>
                           {nav.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{nav.label}</span>
                     </div>
                     <Badge className={`${activeTab === nav.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"} border-none text-[10px] font-black h-6 w-10 flex justify-center`}>
                        {nav.count}
                     </Badge>
                   </button>
                 ))}
              </div>
           </div>

           {/* Quick Action Contextual Card */}
           <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card-shadow rounded-[32px] bg-[#0c0c10] border border-white/5 p-8 shadow-2xl relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none rotate-12">
                    {activeTab === 'schools' ? <SchoolIcon size={120} /> : activeTab === 'depts' ? <Building2 size={120} /> : <GraduationCap size={120} />}
                 </div>

                 <h3 className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Zap size={12} className="fill-primary" /> Provisioning Portal
                 </h3>

                 <form onSubmit={activeTab === 'schools' ? handleAddSchool : activeTab === 'depts' ? handleAddDept : handleAddProgramme} className="space-y-6 relative z-10">
                    {activeTab === 'schools' ? (
                       <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">School Designation</label>
                          <Input 
                            placeholder="e.g. School of Science" 
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/40 font-bold"
                            value={newSchoolName}
                            onChange={e => setNewSchoolName(e.target.value)}
                          />
                       </div>
                    ) : activeTab === 'depts' ? (
                       <>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Parent Institution</label>
                            <select 
                               aria-label="Parent institution"
                               className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-xl px-4 text-xs font-black appearance-none"
                               value={selectedSchoolId}
                               onChange={e => setSelectedSchoolId(e.target.value)}
                            >
                               <option value="" className="bg-[#0c0c10]">Select Host School</option>
                               {schools.map(s => <option key={s.id} value={s.id} className="bg-[#0c0c10]">{s.name}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Department Nomenclature</label>
                            <Input 
                               placeholder="e.g. Biological Sciences" 
                               className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/40 font-bold"
                               value={newDeptName}
                               onChange={e => setNewDeptName(e.target.value)}
                            />
                         </div>
                       </>
                    ) : (
                       <>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Host Department</label>
                            <select 
                               aria-label="Host department"
                               className="w-full bg-white/5 border border-white/10 text-white h-12 rounded-xl px-4 text-xs font-black appearance-none"
                               value={selectedDeptId}
                               onChange={e => setSelectedDeptId(e.target.value)}
                            >
                               <option value="" className="bg-[#0c0c10]">Select Mapping</option>
                               {departments.map(d => <option key={d.id} value={d.id} className="bg-[#0c0c10]">{d.name} ({d.schools?.name})</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Programme Title</label>
                            <Input 
                               placeholder="e.g. MSc. in Data Science" 
                               className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/40 font-bold"
                               value={newProgName}
                               onChange={e => setNewProgName(e.target.value)}
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-white/40 tracking-widest ml-1">Programme Code</label>
                            <Input 
                               placeholder="e.g. MSC.DS" 
                               className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-primary/40 font-mono font-black"
                               value={newProgCode}
                               onChange={e => setNewProgCode(e.target.value)}
                            />
                         </div>
                       </>
                    )}
                    <Button 
                      disabled={isLoading}
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-white uppercase font-black tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                      {isLoading ? "Synchronizing..." : `Deploy ${activeTab === 'schools' ? 'School' : activeTab === 'depts' ? 'Dept' : 'Degree'}`}
                    </Button>
                 </form>
              </motion.div>
           </AnimatePresence>
        </div>

        {/* Dynamic Display Table */}
        <div className="xl:col-span-3 space-y-6">
           <div className="bg-card rounded-[40px] border border-border overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
              
              {/* Table Toolbar */}
              <div className="p-8 border-b border-border/60 flex flex-col md:flex-row justify-between items-center gap-6 bg-muted/5">
                 <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <Input 
                       placeholder={`Search ${activeTab}...`} 
                       className="pl-12 h-14 bg-background border-2 border-border/40 focus:border-primary rounded-[20px] shadow-inner font-bold" 
                       value={searchQuery}
                       onChange={e => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="flex -space-x-3 overflow-hidden p-2">
                       {filteredSchools.slice(0, 3).map((_, i) => (
                          <div key={i} className="inline-block h-8 w-8 rounded-full ring-4 ring-card bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">SC</div>
                       ))}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">{activeTab === 'schools' ? filteredSchools.length : activeTab === 'depts' ? filteredDepartments.length : filteredProgrammes.length} Active Entities Found</span>
                 </div>
              </div>

              {/* Table Core */}
              <div className="flex-1 overflow-auto">
                 <table className="w-full border-collapse">
                    <thead>
                       <tr className="bg-muted/30 text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em] italic">
                          <td className="p-6 pl-10 border-b border-border/40">Identification & Nomenclature</td>
                          <td className="p-6 border-b border-border/40">Mapping & Placement</td>
                          <td className="p-6 border-b border-border/40">Structural Health</td>
                          <td className="p-6 text-right pr-10 border-b border-border/40">Operations</td>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                       <AnimatePresence mode="popLayout">
                          {activeTab === "schools" ? (
                             filteredSchools.map((school, i) => (
                                <motion.tr 
                                  key={school.id} 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="group hover:bg-primary/5 transition-all border-l-4 border-l-transparent hover:border-l-primary"
                                >
                                   <td className="p-6 pl-10">
                                      <div className="flex items-center gap-5">
                                         <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-inner">
                                            <SchoolIcon size={22} className="group-hover:rotate-[360deg] transition-transform duration-1000" />
                                         </div>
                                         <div className="space-y-1">
                                            <span className="text-lg font-black text-foreground tracking-tight">{school.name}</span>
                                            <span className="block text-[10px] font-bold text-muted-foreground uppercase opacity-60">System ID: {school.id.slice(0, 8)}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="p-6">
                                      <Badge variant="outline" className="border-border/60 bg-muted/20 text-muted-foreground font-black px-3 py-1 text-[10px] uppercase tracking-tighter">
                                         Institutional Root
                                      </Badge>
                                   </td>
                                   <td className="p-6">
                                      <div className="flex items-center gap-2">
                                         <CheckCircle2 size={16} className="text-success" />
                                         <span className="text-xs font-black text-foreground/70 uppercase">Online</span>
                                      </div>
                                   </td>
                                   <td className="p-6 text-right pr-10">
                                      <DropdownMenu>
                                         <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-10 w-10 rounded-xl hover:bg-muted font-black">
                                               <MoreVertical size={18} />
                                            </Button>
                                         </DropdownMenuTrigger>
                                         <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl bg-card border-2 border-border shadow-2xl">
                                            <DropdownMenuItem className="p-3 font-bold flex items-center gap-3 cursor-pointer rounded-xl mb-1 group">
                                               <Edit3 size={16} className="text-muted-foreground group-hover:text-primary" /> Edit Node
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                              onClick={() => handleDelete('schools', school.id, school.name)}
                                              className="p-3 font-bold text-destructive flex items-center gap-3 cursor-pointer rounded-xl group hover:bg-destructive/10"
                                            >
                                               <Trash2 size={16} /> Decommission
                                            </DropdownMenuItem>
                                         </DropdownMenuContent>
                                      </DropdownMenu>
                                   </td>
                                </motion.tr>
                             ))
                          ) : activeTab === "depts" ? (
                             filteredDepartments.map((dept, i) => (
                                <motion.tr 
                                  key={dept.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="group hover:bg-primary/5 transition-all border-l-4 border-l-transparent hover:border-l-primary"
                                >
                                   <td className="p-6 pl-10">
                                      <div className="flex items-center gap-5">
                                         <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                            <Building2 size={22} />
                                         </div>
                                         <div className="space-y-1">
                                            <span className="text-lg font-black text-foreground tracking-tight">{dept.name}</span>
                                            <span className="block text-[10px] font-bold text-muted-foreground uppercase opacity-60">Dept Code: RU/DEPT/{dept.name.slice(0, 3).toUpperCase()}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="p-6">
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 italic">Assigned School</span>
                                         <span className="text-sm font-black text-foreground flex items-center gap-2">
                                            <SchoolIcon size={14} className="text-primary opacity-50" /> {dept.schools?.name || "Global"}
                                         </span>
                                      </div>
                                   </td>
                                   <td className="p-6">
                                      <div className="flex items-center gap-2">
                                         <CheckCircle2 size={16} className="text-success" />
                                         <span className="text-xs font-black text-foreground/70 uppercase">Functional</span>
                                      </div>
                                   </td>
                                   <td className="p-6 text-right pr-10">
                                      <Button variant="ghost" onClick={() => handleDelete('departments', dept.id, dept.name)} className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                         <Trash2 size={20} />
                                      </Button>
                                   </td>
                                </motion.tr>
                             ))
                          ) : (
                             filteredProgrammes.map((prog, i) => (
                                <motion.tr 
                                  key={prog.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="group hover:bg-primary/5 transition-all border-l-4 border-l-transparent hover:border-l-primary"
                                >
                                   <td className="p-6 pl-10">
                                      <div className="flex items-center gap-5">
                                         <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-inner">
                                            <GraduationCap size={22} />
                                         </div>
                                         <div className="space-y-1">
                                            <span className="text-lg font-black text-foreground tracking-tight">{prog.name}</span>
                                            <span className="px-2 py-0.5 bg-black/5 rounded font-mono text-[10px] font-black text-primary tracking-widest">{prog.code}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="p-6">
                                      <div className="flex flex-col">
                                         <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 italic">Faculty Context</span>
                                         <span className="text-xs font-black text-foreground flex items-center gap-1.5 mb-0.5">
                                            <Building2 size={12} className="text-primary opacity-50" /> {prog.department?.name}
                                         </span>
                                         <span className="text-[9px] font-black text-muted-foreground flex items-center gap-1 opacity-60">
                                            <ChevronRight size={10} /> {prog.department?.schools?.name}
                                         </span>
                                      </div>
                                   </td>
                                   <td className="p-6">
                                      <Badge className="bg-success text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 shadow shadow-success/20">
                                         Authorized
                                      </Badge>
                                   </td>
                                   <td className="p-6 text-right pr-10">
                                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                         <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-primary rounded-xl">
                                            <Edit3 size={18} />
                                         </Button>
                                         <Button variant="ghost" size="icon" onClick={() => handleDelete('programmes', prog.id, prog.name)} className="h-10 w-10 text-muted-foreground hover:text-destructive rounded-xl">
                                            <Trash2 size={18} />
                                         </Button>
                                      </div>
                                   </td>
                                </motion.tr>
                             ))
                          )}
                       </AnimatePresence>
                    </tbody>
                 </table>
              </div>

              {/* Enhanced Footer Stats */}
              <div className="p-8 border-t border-border/60 bg-[#194973]/5 flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Database Integrity</span>
                       <span className="text-xs font-black text-primary uppercase">Fully Synchronized</span>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Architecture Depth</span>
                       <span className="text-xs font-black text-foreground uppercase tracking-wider">{schools.length} Schools → {departments.length} Depts → {programmes.length} Degrees</span>
                    </div>
                 </div>
                 <Button variant="outline" className="rounded-2xl border-2 font-black text-xs uppercase tracking-widest px-8 group active:scale-95 transition-all">
                    Export Schema <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
}
