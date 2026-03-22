import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, GraduationCap, School, Building2, MapPin, Loader2, BookOpen, 
  Search, ShieldCheck, Mail, ArrowRight, UserCheck, MoreVertical, 
  Trash2, UserCircle2, Briefcase, Award, CheckCircle2, XCircle, ChevronRight, PlusCircle
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STUDY_LEVELS = [
  { value: "masters", label: "Master's Degree (MSc / MA)", icon: "📚" },
  { value: "phd",     label: "Doctor of Philosophy (PhD)", icon: "🎓" },
];

export function StudentRegistry() {
  // DB Lists
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(""); // masters | phd
  const [selectedProgId, setSelectedProgId] = useState("");
  const [selectedSupervisorId, setSelectedSupervisorId] = useState("");
  const [intakeYear, setIntakeYear] = useState("2026");
  
  // Management State
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStudentForSupervisor, setSelectedStudentForSupervisor] = useState<any>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Cascading fetches
  useEffect(() => {
    if (selectedSchoolId) {
       fetchDepartments(selectedSchoolId);
    } else {
       setDepartments([]);
       setSelectedDeptId("");
    }
  }, [selectedSchoolId]);

  useEffect(() => {
    if (selectedDeptId) {
       fetchProgrammes(selectedDeptId);
    } else {
       setProgrammes([]);
       setSelectedProgId("");
    }
  }, [selectedDeptId]);

  const fetchInitialData = async () => {
    try {
      const [{ data: sData }, { data: stData }, { data: supData }] = await Promise.all([
        supabase.from('schools').select('*').order('name'),
        supabase.from('students').select(`
          *,
          user:users!students_user_id_fkey(first_name, last_name, email),
          programme:programmes(name, code, department:departments(name, school:schools(name))),
          supervisor:users!students_supervisor_id_fkey(first_name, last_name)
        `).order('created_at', { ascending: false }),
        supabase.from('users').select('*').in('role', ['SUPERVISOR', 'DEPT_COORDINATOR', 'SCHOOL_COORDINATOR', 'PG_DEAN']).order('first_name')
      ]);
      
      if (sData) setSchools(sData);
      if (stData) setStudents(stData);
      if (supData) setSupervisors(supData);
    } catch (err: any) {
      toast.error("Registry Sync Failure", { description: err.message });
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchDepartments = async (schoolId: string) => {
    const { data } = await supabase.from('departments').select('*').eq('school_id', schoolId).order('name');
    setDepartments(data || []);
  };

  const fetchProgrammes = async (deptId: string) => {
    const { data } = await supabase.from('programmes').select('*').eq('department_id', deptId).order('name');
    setProgrammes(data || []);
  };

  const handleStudentRegistration = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email || !selectedProgId || !firstName || !admissionNumber || !selectedSchoolId || !selectedDeptId) {
      toast.error("Validation Violation", { description: "Core identity parameters are missing." });
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: "pgstudent",
        options: { data: { first_name: firstName, last_name: lastName } }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: studentError } = await supabase.from('students').insert({
          user_id: authData.user.id,
          registration_number: admissionNumber,
          programme_id: selectedProgId,
          supervisor_id: selectedSupervisorId || null,
          current_stage: 'DEPT_SEMINAR_PENDING',
          intake_year: parseInt(intakeYear) || new Date().getFullYear()
        });

        if (studentError) throw studentError;

        toast.success("Scholar Node Active", { description: `${admissionNumber} has been synchronized.` });
        
        // Reset and refresh
        setFirstName(""); setLastName(""); setEmail(""); setAdmissionNumber("");
        setSelectedSchoolId(""); setSelectedDeptId(""); setSelectedLevel(""); setSelectedProgId(""); setSelectedSupervisorId("");
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error("Admission protocol failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignSupervisor = async (supervisorId: string) => {
    if (!selectedStudentForSupervisor) return;
    setIsAssigning(true);
    try {
      const { error } = await supabase.from('students').update({ supervisor_id: supervisorId }).eq('id', selectedStudentForSupervisor.id);
      
      if (error) throw error;
      toast.success("Supervisor Linked", { description: "Academic mentorship bond established." });
      setSelectedStudentForSupervisor(null);
      fetchInitialData();
    } catch (err: any) {
      toast.error("Assignment Error", { description: err.message });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteStudent = async (student: any) => {
    if (!confirm(`Delete ${student.registration_number}? This is irreversible.`)) return;
    try {
      const { error } = await supabase.from('students').delete().eq('id', student.id);
      if (error) throw error;
      toast.success("Node Purged", { description: "Student record removed." });
      fetchInitialData();
    } catch (err: any) {
      toast.error("Deletion Blocked", { description: "Active records depend on this node." });
    }
  };

  const selectClass = "flex h-14 w-full rounded-2xl border-2 border-border/60 bg-background px-6 py-2 text-sm font-black focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-primary/40 shadow-inner";

  const filteredStudents = students.filter(s => 
    s.registration_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isInitializing) return (
     <div className="h-screen flex flex-col items-center justify-center gap-6 bg-black/5">
        <div className="w-16 h-16 border-[6px] border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Initializing Registry Engine</p>
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-[1400px] mx-auto space-y-12 pb-32">

      {/* Futuristic Header Section */}
      <div className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-[40px] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
         <div className="relative flex flex-col xl:flex-row justify-between gap-8 card-shadow bg-card p-12 rounded-[40px] border border-border shadow-3xl overflow-hidden backdrop-blur-3xl">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
               <UserPlus size={360} />
            </div>
            
            <div className="relative z-10 space-y-4">
               <Badge className="bg-primary/5 text-primary border-primary/10 tracking-[0.2em] font-black italic px-4 py-1.5 uppercase text-[9px] mb-2">Systems Governance Portal</Badge>
               <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-4">
                  Scholar <span className="text-primary underline decoration-gold/40 decoration-4 underline-offset-8">Registry</span> Matrix
               </h2>
               <p className="text-sm text-muted-foreground max-w-2xl font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6">
                  Calibrating institutional nodes for postgraduate advancement. Use this terminal to provision global scholarship credentials and authorize curriculum participation.
               </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 self-end">
               <div className="flex flex-col items-center sm:items-end text-right px-6 py-4 bg-muted/30 rounded-3xl border border-border/50 backdrop-blur-sm">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Identity Seed</span>
                  <span className="text-primary font-mono text-xs font-black leading-none mt-2 shadow-[0_0_10px_rgba(20,181,217,0.3)]">pgstudent</span>
               </div>
               <Button
                 onClick={handleStudentRegistration}
                 disabled={isLoading}
                 className="h-20 px-12 bg-primary hover:bg-primary/90 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-3xl shadow-2xl shadow-primary/30 transition-all active:scale-95 group"
               >
                 {isLoading ? <Loader2 className="animate-spin" /> : (
                   <div className="flex items-center gap-3">
                      Deploy Protocol <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                   </div>
                 )}
               </Button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">

        {/* Admission Protocol Terminal */}
        <motion.div variants={itemVariants} className="xl:col-span-3 card-shadow rounded-[45px] bg-card border border-border shadow-3xl overflow-hidden flex flex-col border-t-8 border-t-primary shadow-2xl">
          <div className="p-10 border-b border-border/40 bg-muted/10 flex items-center justify-between">
            <h3 className="font-black text-foreground text-[10px] uppercase tracking-[0.4em] flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-2xl flex items-center justify-center font-mono">01</div> Deployment Parameters
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
               <span className="text-[9px] font-black text-success uppercase tracking-widest">Active Connection</span>
            </div>
          </div>

          <form className="p-12 space-y-16" onSubmit={handleStudentRegistration}>
            {/* Identity Cluster */}
            <div className="space-y-10">
              <div className="flex items-center gap-6">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-primary whitespace-nowrap opacity-80 flex items-center gap-3">
                    <UserCircle2 size={16} /> Identity Node
                 </h4>
                 <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 flex items-center gap-2">Forename <span className="text-primary">*</span></label>
                  <Input 
                     className="h-16 font-black bg-muted/5 border-2 rounded-[22px] focus:border-primary transition-all px-8 text-lg shadow-inner" 
                     placeholder="e.g. Victor" 
                     value={firstName} 
                     onChange={e => setFirstName(e.target.value)} 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Surname</label>
                  <Input 
                     className="h-16 font-black bg-muted/5 border-2 rounded-[22px] focus:border-primary transition-all px-8 text-lg" 
                     placeholder="e.g. Korir" 
                     value={lastName} 
                     onChange={e => setLastName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Institutional Link (Email)</label>
                  <div className="relative group">
                     <Mail size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                     <Input 
                        type="email" 
                        className="h-16 font-black bg-muted/5 border-2 rounded-[22px] focus:border-primary transition-all pl-16 pr-8 text-lg" 
                        placeholder="v.korir@rongo.ac.ke" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                     />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2">Communication Resolution</label>
                  <Input 
                     className="h-16 font-black bg-muted/5 border-2 rounded-[22px] focus:border-primary transition-all px-8 text-lg font-mono opacity-80" 
                     placeholder="+254 XXX XXX XXX" 
                  />
                </div>
              </div>
            </div>

            {/* Academic Cluster */}
            <div className="space-y-10 pt-4">
               <div className="flex items-center gap-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-secondary whitespace-nowrap opacity-80 flex items-center gap-3">
                     <GraduationCap size={16} /> Academic Placement
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-secondary/20 to-transparent" />
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 flex items-center gap-2"><School size={14} className="text-secondary"/> Host School</label>
                  <select
                    aria-label="Host school"
                    value={selectedSchoolId}
                    onChange={e => setSelectedSchoolId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="" className="font-bold opacity-20 italic">— Select Target Entity —</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id} className="font-bold py-2">{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 flex items-center gap-2"><Building2 size={14} className="text-secondary"/> Department Mapping</label>
                  <select
                    aria-label="Department mapping"
                    value={selectedDeptId}
                    onChange={e => setSelectedDeptId(e.target.value)}
                    disabled={!selectedSchoolId}
                    className={selectClass}
                  >
                    <option value="" className="italic">— {selectedSchoolId ? "Select Host Branch" : "Authorization Required"} —</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id} className="font-bold py-2">{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Study Level Visual Command */}
              <div className="space-y-4 px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 px-2 block mb-6">Degree Tier Selection</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {STUDY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setSelectedLevel(level.value)}
                      className={`flex items-center gap-6 h-24 rounded-[28px] border-2 px-8 text-left transition-all relative overflow-hidden group/btn ${
                        selectedLevel === level.value
                          ? "bg-secondary/10 border-secondary text-secondary shadow-2xl shadow-secondary/20 scale-[1.02] ring-4 ring-secondary/5"
                          : "bg-background border-border hover:border-secondary/40 hover:bg-muted/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className={`text-4xl transition-all duration-500 ${selectedLevel === level.value ? 'scale-125 rotate-6' : 'group-hover/btn:scale-110'}`}>{level.icon}</div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em]">{level.value}</p>
                        <p className="text-[10px] font-bold opacity-60 italic tracking-wide">{level.label}</p>
                      </div>
                      {selectedLevel === level.value && <div className="absolute right-0 top-0 h-full w-2 bg-secondary animate-pulse" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Programme Dropdown */}
              <div className="space-y-3 px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 flex items-center gap-2"><BookOpen size={14} className="text-secondary"/> Target Degree Programme</label>
                <select
                  aria-label="Target degree programme"
                  value={selectedProgId}
                  onChange={e => setSelectedProgId(e.target.value)}
                  disabled={!selectedDeptId || !selectedLevel}
                  className={selectClass}
                >
                  <option value="" className="italic">
                    {!selectedDeptId
                      ? "— Mapping resolution required —"
                      : !selectedLevel
                      ? "— Scholastic level authorization required —"
                      : "Authorize Admission Point"}
                  </option>
                  {programmes
                    .filter(p => {
                       if (selectedLevel === 'phd') return p.name.toUpperCase().includes('PHD');
                       if (selectedLevel === 'masters') return !p.name.toUpperCase().includes('PHD');
                       return true;
                    })
                    .map(p => (
                      <option key={p.id} value={p.id} className="font-bold py-2">{p.name} ({p.code})</option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-3 px-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-2 flex items-center gap-2"><UserCheck size={14} className="text-secondary"/> Primary Supervisor (Optional)</label>
                <select
                  aria-label="Primary supervisor"
                  value={selectedSupervisorId}
                  onChange={e => setSelectedSupervisorId(e.target.value)}
                  className={selectClass}
                >
                  <option value="" className="italic">— Assign later —</option>
                  {supervisors
                    .filter(s => !selectedDeptId || s.department_id === selectedDeptId)
                    .map(s => (
                      <option key={s.id} value={s.id} className="font-bold py-2">
                        {s.first_name} {s.last_name} ({s.staff_id || "NO-ID"})
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Final Deployment Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 px-2 border-t border-border/40 mt-12">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 px-2 flex items-center gap-2">Cohort Lifecycle</label>
                  <Input className="h-16 font-black bg-muted/5 border-2 rounded-2xl focus:border-secondary transition-all px-8 text-xl tracking-widest shadow-inner border-secondary/10" value={intakeYear} onChange={e => setIntakeYear(e.target.value)} />
                </div>
                <div className="space-y-3 relative group">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-2 flex items-center justify-between">
                     Registry Authority Number <Badge className="bg-primary/20 text-primary border-none shadow-[0_0_10px_rgba(20,181,217,0.3)] px-3 py-0.5 rounded-full scale-90">REQUIRED</Badge>
                  </label>
                  <Input
                    className="h-16 font-black bg-primary/5 border-2 border-primary/40 rounded-2xl focus:border-primary transition-all px-8 font-mono text-xl tracking-[0.15em] text-primary placeholder:opacity-10 italic uppercase shadow-xl"
                    placeholder="RONGO/PG/XXXX/XX"
                    value={admissionNumber}
                    onChange={e => setAdmissionNumber(e.target.value.toUpperCase())}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                     <div className="w-1.5 h-6 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Global Intelligence Column */}
        <motion.div variants={itemVariants} className="xl:col-span-1 space-y-10">
          
          <div className="card-shadow rounded-[36px] bg-[#0c0c10] border border-white/5 shadow-4xl overflow-hidden border-t-8 border-t-primary relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none group-hover:opacity-60 transition-opacity" />
            <div className="relative z-10 p-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
              <h3 className="font-black text-white text-[10px] uppercase tracking-[0.4em] flex items-center gap-3 italic">
                 <ShieldCheck className="text-primary animate-pulse" size={18}/> Registry <span className="text-primary">Node</span>
              </h3>
            </div>
            <div className="relative z-10 p-12 flex flex-col items-center justify-center text-center space-y-10">
              <div className="w-full rounded-[35px] bg-white/5 border border-white/10 p-10 shadow-2xl backdrop-blur-xl group/card relative">
                <div className="absolute top-4 right-6 text-[8px] font-black text-primary animate-shimmer opacity-30">ENCRYPTED</div>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mb-6 drop-shadow-lg">Institutional Key</p>
                <p className="text-2xl font-mono text-white font-black tracking-[0.2em] uppercase truncate max-w-full italic drop-shadow-[0_4px_12px_rgba(20,181,217,0.5)]">
                  {admissionNumber || "PENDING"}
                </p>
                <div className="mt-6 flex justify-center gap-2">
                   {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1 rounded-full transition-all duration-500 ${admissionNumber.length > i*3 ? 'w-4 bg-primary' : 'w-2 bg-white/10'}`} />)}
                </div>
              </div>
              <div className="space-y-6 w-full opacity-60">
                 <div className="h-px bg-white/10 w-full" />
                 <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed italic px-4">
                    Authorized for live curriculum deployment. Baseline clearance tier: <span className="text-white hover:text-primary transition-colors cursor-help underline decoration-dotted underline-offset-4">pgstudent</span>
                 </p>
              </div>
            </div>
          </div>

          <div className="card-shadow rounded-[45px] bg-card border border-border shadow-2xl overflow-hidden p-12 space-y-10 relative">
            <div className="absolute bottom-0 right-0 p-6 opacity-10 pointer-events-none rotate-12 scale-150">
               <MapPin size={100} className="text-secondary" />
            </div>
            <h3 className="font-black text-foreground text-[11px] uppercase tracking-[0.4em] italic border-b border-border/60 pb-8 flex items-center justify-between">
               Placement Matrix <Badge variant="outline" className="border-secondary/30 text-secondary text-[8px] tracking-widest bg-secondary/5 font-black">READ_ONLY</Badge>
            </h3>
            <div className="space-y-10 relative z-10">
              {[
                { label: "Institutional School", icon: <School size={12}/>, value: schools.find(s => s.id === selectedSchoolId)?.name || "—", color: "primary" },
                { label: "Governing Department", icon: <Building2 size={12}/>, value: departments.find(d => d.id === selectedDeptId)?.name || "—", color: "secondary" },
                { label: "Research Trajectory",  icon: <Award size={12}/>, value: selectedLevel ? (selectedLevel === 'phd' ? 'Doctor of Philosophy' : 'Master\'s Science') : "—", color: "gold" },
                { label: "Academic Programme",   icon: <BookOpen size={12}/>, value: programmes.find(p => p.id === selectedProgId)?.name || "—", color: "primary" },
              ].map((item, idx) => (
                <div key={item.label} className="flex flex-col gap-3 group">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">{item.icon} {item.label}</span>
                  <p className={`font-black text-foreground text-sm tracking-tight border-l-4 border-muted hover:border-primary pl-6 py-2 transition-all bg-muted/5 rounded-r-xl group-hover:bg-muted/10`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* GLOBAL STUDENT LISTING LAYER */}
      <motion.div variants={itemVariants} className="pt-20 space-y-10">
         <div className="flex flex-col md:flex-row justify-between items-end gap-6 px-4">
            <div className="space-y-3">
               <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase italic flex items-center gap-4">
                  Curriculum <span className="text-primary italic">Live Feed</span>
               </h3>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] italic opacity-60">Synchronized Global Student Database</p>
            </div>

            <div className="relative group min-w-[340px]">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-all scale-110" />
               <Input 
                  placeholder="Search Admission / Master ID..." 
                  className="h-16 pl-14 pr-8 bg-card border-2 border-border/80 focus:border-primary rounded-3xl font-black text-sm tracking-wide shadow-xl focus:shadow-primary/10 transition-all"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
               />
            </div>
         </div>

         <div className="card-shadow bg-card rounded-[50px] border border-border overflow-hidden shadow-4xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
            <table className="w-full relative z-10">
               <thead>
                  <tr className="bg-muted text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] italic border-b border-border/60">
                     <td className="p-8">Institutional Identity</td>
                     <td className="p-8">Degree Placement & Stage</td>
                     <td className="p-8">Mentorship Status</td>
                     <td className="p-8 text-right pr-12">Registry Operations</td>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/40">
                  <AnimatePresence mode="popLayout">
                     {filteredStudents.map((st, i) => (
                        <motion.tr 
                          key={st.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-primary/5 transition-all border-l-8 border-l-transparent hover:border-l-primary"
                        >
                           <td className="p-8">
                              <div className="flex items-center gap-6">
                                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-primary shadow-inner border border-white/40">
                                    <UserCheck size={26} className="group-hover:scale-110 transition-transform" />
                                 </div>
                                 <div className="space-y-1.5">
                                    <span className="text-lg font-black text-foreground tracking-tighter uppercase italic">{st.user?.first_name} {st.user?.last_name}</span>
                                    <div className="flex items-center gap-3">
                                       <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black px-3 py-1 shadow shadow-primary/5">{st.registration_number}</Badge>
                                       <span className="text-[10px] font-bold text-muted-foreground/60 italic lowercase tracking-tight">{st.user?.email}</span>
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="p-8">
                              <div className="space-y-3">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">{st.programme?.name}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground italic group-hover:text-foreground/60 transition-colors uppercase tracking-tighter">
                                       {st.programme?.department?.name} 
                                       <ChevronRight className="inline-block mx-1" size={10} /> 
                                       {st.programme?.department?.schools?.name}
                                    </span>
                                 </div>
                                 <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                                   st.current_stage.includes('COMPLETED') ? 'text-success border-success/30 bg-success/5' : 'text-gold border-gold/30 bg-gold/5'
                                 }`}>
                                    {st.current_stage.replace(/_/g, ' ')}
                                 </Badge>
                              </div>
                           </td>
                           <td className="p-8">
                              <Dialog open={selectedStudentForSupervisor?.id === st.id} onOpenChange={(open) => !open && setSelectedStudentForSupervisor(null)}>
                                 <div className="flex flex-col gap-3">
                                    {st.supervisor ? (
                                       <div className="flex items-center gap-4 group/mentor">
                                          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 group-hover/mentor:scale-110 transition-all shadow-lg shadow-secondary/10">
                                             <Briefcase size={18} />
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-xs font-black text-foreground tracking-tight uppercase group-hover/mentor:text-secondary transition-colors">Prof. {st.supervisor.first_name} {st.supervisor.last_name}</span>
                                             <DialogTrigger asChild>
                                                <button onClick={() => setSelectedStudentForSupervisor(st)} className="text-[9px] font-bold text-primary italic text-left hover:underline tracking-widest uppercase opacity-60 hover:opacity-100">Redesignate Mentor</button>
                                             </DialogTrigger>
                                          </div>
                                       </div>
                                    ) : (
                                       <DialogTrigger asChild>
                                          <Button 
                                             onClick={() => setSelectedStudentForSupervisor(st)}
                                             variant="outline" 
                                             className="h-12 border-2 border-dashed border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-2xl group/assign"
                                          >
                                             <PlusCircle size={14} className="mr-2 group-hover/assign:rotate-90 transition-transform" /> Assign Supervisor
                                          </Button>
                                       </DialogTrigger>
                                    )}
                                 </div>
                                 <DialogContent className="sm:max-w-[600px] p-0 rounded-[40px] border-none shadow-5xl overflow-hidden bg-card">
                                    <div className="bg-primary/5 p-12 space-y-8">
                                       <DialogHeader>
                                          <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
                                             Mentor <span className="text-primary italic">Provisioning</span>
                                          </DialogTitle>
                                          <DialogDescription className="text-muted-foreground font-medium italic pt-2">
                                             Appoint a designated academic lead for {st.registration_number}. This link will authorize mentorship dashboard access.
                                          </DialogDescription>
                                       </DialogHeader>

                                       <div className="space-y-6">
                                          <div className="relative group">
                                             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground scale-90" />
                                             <Input placeholder="Search Mentors by Title..." className="pl-12 h-14 bg-background border-2 border-border/40 focus:border-primary rounded-2xl font-bold" />
                                          </div>

                                          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                             {supervisors.map(sup => (
                                                <button
                                                   key={sup.id}
                                                   onClick={() => handleAssignSupervisor(sup.id)}
                                                   disabled={isAssigning}
                                                   className="w-full flex items-center justify-between p-6 bg-background rounded-[24px] border border-border/60 hover:border-primary hover:bg-primary/5 transition-all text-left shadow-sm group/item"
                                                >
                                                   <div className="flex items-center gap-5">
                                                      <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover/item:bg-secondary/20 transition-all font-mono font-black border border-secondary/10">RU</div>
                                                      <div className="flex flex-col">
                                                         <span className="font-black text-foreground text-sm uppercase group-hover/item:text-primary transition-colors">Prof. {sup.first_name} {sup.last_name}</span>
                                                         <span className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">{sup.email}</span>
                                                      </div>
                                                   </div>
                                                   <div className="flex items-center gap-3">
                                                      <Badge className="bg-muted text-muted-foreground border-none text-[8px] font-black uppercase tracking-widest py-1 hidden sm:block">SENIOR_LD</Badge>
                                                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover/item:opacity-100 transition-all">
                                                         {isAssigning ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18} />}
                                                      </div>
                                                   </div>
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                       
                                       <Button variant="ghost" className="w-full text-[10px] font-black tracking-widest uppercase hover:underline" onClick={() => setSelectedStudentForSupervisor(null)}>Cancel Operation</Button>
                                    </div>
                                 </DialogContent>
                              </Dialog>
                           </td>
                           <td className="p-8 text-right pr-12">
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-12 w-12 rounded-2xl hover:bg-muted font-black border border-transparent hover:border-border transition-all">
                                       <MoreVertical size={20} />
                                    </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="w-64 p-3 rounded-3xl bg-card border-2 border-border/80 shadow-[0_30px_60px_rgba(0,0,0,0.15)] ring-1 ring-black/5 animate-shimmer-slow backdrop-blur-3xl">
                                    <DropdownMenuItem className="p-4 font-black flex items-center gap-4 cursor-pointer rounded-2xl mb-1 group transition-all hover:pl-6 focus:bg-primary/5 focus:text-primary">
                                       <UserCircle2 size={18} className="text-muted-foreground group-hover:text-primary transition-colors" /> View Academic File
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-4 font-black flex items-center gap-4 cursor-pointer rounded-2xl mb-1 group transition-all hover:pl-6 focus:bg-primary/5 focus:text-primary">
                                       <Award size={18} className="text-muted-foreground group-hover:text-primary transition-colors" /> Academic Progress
                                    </DropdownMenuItem>
                                    <div className="h-px bg-border/40 my-2 mx-2" />
                                    <DropdownMenuItem 
                                       onClick={() => handleDeleteStudent(st)}
                                       className="p-4 font-black text-rose-500 flex items-center gap-4 cursor-pointer rounded-2xl group hover:bg-rose-500/10 transition-all hover:pl-6"
                                    >
                                       <Trash2 size={18} /> Delete Global Node
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
            
            {filteredStudents.length === 0 && (
               <div className="p-32 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground opacity-30 shadow-inner">
                     <Search size={40} />
                  </div>
                  <div className="space-y-2">
                     <h4 className="text-xl font-black text-foreground/40 uppercase tracking-tighter italic">No Nodes Discovered</h4>
                     <p className="text-xs font-medium text-muted-foreground/60 italic max-w-sm uppercase tracking-widest">Adjust search parameters or provision new scholars via the admission portal above.</p>
                  </div>
               </div>
            )}

            <div className="p-10 border-t border-border/60 bg-primary/5 flex flex-col sm:flex-row justify-between items-center gap-8">
               <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">Global Database Status</span>
                     <span className="flex items-center gap-2 text-xs font-black text-primary uppercase"><div className="w-2 h-2 rounded-full bg-success animate-pulse" /> Fully Synced</span>
                  </div>
                  <div className="h-8 w-px bg-border/60 hidden sm:block" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1">Registry Counter</span>
                     <span className="text-xs font-black text-foreground uppercase tracking-wider italic">{students.length} Total Institutional Nodes</span>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Button variant="outline" className="h-14 px-10 border-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95 shadow-xl shadow-black/5">
                     Export Registry Hub
                  </Button>
               </div>
            </div>
         </div>
      </motion.div>

    </motion.div>
  );
}
