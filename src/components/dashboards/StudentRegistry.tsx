import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, UploadCloud, GraduationCap, School, Building2, MapPin, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STUDY_LEVELS = [
  { value: "masters", label: "Master's Degree (MSc / MA)", icon: "📚" },
  { value: "phd",     label: "Doctor of Philosophy (PhD)", icon: "🎓" },
];

export function StudentRegistry() {
  // DB Lists
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState(""); // masters | phd
  const [selectedProgId, setSelectedProgId] = useState("");
  const [intakeYear, setIntakeYear] = useState("2026");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initial Data Fetch
  useEffect(() => {
    fetchSchools();
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

  const fetchSchools = async () => {
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('schools').select('*').order('name');
      if (error) throw error;
      setSchools(data || []);
    } catch (err: any) {
      toast.error("Institutional Link Error", { description: err.message });
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchDepartments = async (schoolId: string) => {
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('departments').select('*').eq('school_id', schoolId).order('name');
      if (error) throw error;
      setDepartments(data || []);
    } catch (err: any) {
      toast.error("Department Sync Error", { description: err.message });
    }
  };

  const fetchProgrammes = async (deptId: string) => {
    try {
      // @ts-ignore
      const { data, error } = await supabase.from('programmes').select('*').eq('department_id', deptId).order('name');
      if (error) throw error;
      setProgrammes(data || []);
    } catch (err: any) {
      toast.error("Curriculum Sync Error", { description: err.message });
    }
  };

  const handleStudentRegistration = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!email || !selectedProgId || !firstName || !admissionNumber) {
      toast.error("Structural Deficiency", { 
        description: "Email, Programme, Name, and Admission Number are mandatory for institutional records." 
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Auth Provisioning
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: "pgstudent",
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Student Node Insertion
        // @ts-ignore
        const { error: studentError } = await supabase.from('students').insert({
          user_id: authData.user.id,
          registration_number: admissionNumber,
          programme_id: selectedProgId,
          current_stage: 'DEPT_SEMINAR_PENDING'
        });

        if (studentError) throw studentError;

        toast.success("Institutional Node Active", {
          description: `Scholar ${admissionNumber} has been officially recorded in the curriculum map.`,
        });

        // Reset
        setFirstName(""); setLastName(""); setEmail(""); setAdmissionNumber("");
        setSelectedSchoolId(""); setSelectedDeptId(""); setSelectedLevel(""); setSelectedProgId("");
      }
    } catch (err: any) {
      toast.error("Admission Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = "flex h-12 w-full rounded-xl border-2 border-border/60 bg-background px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:border-primary/40";

  if (isInitializing) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-10 pb-24">

      {/* Hero Admission Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6 card-shadow bg-card p-10 rounded-[32px] border border-border shadow-2xl relative overflow-hidden group">
         <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
         <div className="absolute -right-20 -top-20 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <UserPlus size={400} />
         </div>
         <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-primary/10 rounded-2xl">
                  <UserPlus className="text-primary" size={28} />
               </div>
               <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase italic">Institutional <span className="text-primary">Admission</span></h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl font-medium italic">
               Deploying new scholastic nodes into the PG curriculum. This gatekeeper protocols registers scholars into the institutional database with official admission parameters.
            </p>
         </div>
         <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10">
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right mr-2 bg-muted/20 p-4 rounded-2xl border border-border/50">
               <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Institutional Default</span>
               <span className="text-primary font-mono text-xs font-black leading-none mt-2">pgstudent</span>
            </div>
            <Button
              onClick={handleStudentRegistration}
              disabled={isLoading}
              className="h-16 px-10 bg-black hover:bg-primary text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-[22px] shadow-2xl transition-all active:scale-[0.98] animate-shimmer"
            >
              {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Enroll Scholar"}
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Manual Admission Terminal */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-[40px] bg-card border border-border shadow-3xl overflow-hidden flex flex-col border-t-8 border-t-primary">
          <div className="p-8 border-b border-border/50 bg-muted/5 flex items-center justify-between">
            <h3 className="font-black text-foreground text-xs uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="p-2 bg-primary/20 text-primary rounded-xl">01</div> Protocol Mapping
            </h3>
            <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] px-4 py-1.5 rounded-full uppercase tracking-widest italic">Manual Flow</Badge>
          </div>

          <form className="p-10 space-y-12 flex-1" onSubmit={handleStudentRegistration}>

            {/* Identity Node */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="h-px flex-1 bg-border/40" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground whitespace-nowrap">Scholastic Identity</h4>
                 <div className="h-px flex-1 bg-border/40" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Forename</label>
                  <Input 
                     className="h-14 font-bold bg-muted/10 border-2 rounded-2xl focus:border-primary transition-all px-6" 
                     placeholder="e.g. John" 
                     value={firstName} 
                     onChange={e => setFirstName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Surname</label>
                  <Input 
                     className="h-14 font-bold bg-muted/10 border-2 rounded-2xl focus:border-primary transition-all px-6" 
                     placeholder="e.g. Doe" 
                     value={lastName} 
                     onChange={e => setLastName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Institutional Email</label>
                  <Input 
                     type="email" 
                     className="h-14 font-bold bg-muted/10 border-2 rounded-2xl focus:border-primary transition-all px-6" 
                     placeholder="john.doe@rongo.ac.ke" 
                     value={email} 
                     onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Contact Matrix</label>
                  <Input 
                     className="h-14 font-bold bg-muted/10 border-2 rounded-2xl focus:border-primary transition-all px-6" 
                     placeholder="+254 XXX XXX XXX" 
                  />
                </div>
              </div>
            </div>

            {/* Academic Placement */}
            <div className="space-y-6 pt-4">
               <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground whitespace-nowrap">Curriculum Placement</h4>
                  <div className="h-px flex-1 bg-border/40" />
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2"><Building2 size={12}/> Academic School</label>
                  <select
                    value={selectedSchoolId}
                    onChange={e => setSelectedSchoolId(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select Target School</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2"><MapPin size={12}/> Host Department</label>
                  <select
                    value={selectedDeptId}
                    onChange={e => setSelectedDeptId(e.target.value)}
                    disabled={!selectedSchoolId}
                    className={selectClass}
                  >
                    <option value="">{selectedSchoolId ? "Select Host Branch" : "— Select School First —"}</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Study Level Visual Selector */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2"><GraduationCap size={12}/> Scholastic Level</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {STUDY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setSelectedLevel(level.value)}
                      className={`flex items-center gap-4 h-20 rounded-2xl border-2 px-6 text-left transition-all relative overflow-hidden group ${
                        selectedLevel === level.value
                          ? "bg-primary/5 border-primary text-primary shadow-xl shadow-primary/10 scale-[1.02]"
                          : "bg-background border-border hover:border-primary/40 hover:bg-muted/5"
                      }`}
                    >
                      <span className={`text-3xl transition-transform group-hover:scale-110 ${selectedLevel === level.value ? 'scale-110' : ''}`}>{level.icon}</span>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-widest leading-none">{level.value}</p>
                        <p className={`text-[10px] font-bold opacity-60 italic ${selectedLevel === level.value ? 'text-primary' : ''}`}>Academic Trajectory</p>
                      </div>
                      {selectedLevel === level.value && <div className="absolute right-0 top-0 h-full w-2 bg-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Programme Dropdown */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2"><BookOpen size={12}/> Degree Programme</label>
                <select
                  value={selectedProgId}
                  onChange={e => setSelectedProgId(e.target.value)}
                  disabled={!selectedDeptId || !selectedLevel}
                  className={selectClass}
                >
                  <option value="">
                    {!selectedDeptId
                      ? "— Target host branch mapping required —"
                      : !selectedLevel
                      ? "— Scholastic level selection required —"
                      : "Authorize Target Degree"}
                  </option>
                  {programmes
                    .filter(p => {
                       if (selectedLevel === 'phd') return p.name.toUpperCase().includes('PHD');
                       if (selectedLevel === 'masters') return !p.name.toUpperCase().includes('PHD');
                       return true;
                    })
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  }
                </select>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest pl-2 italic">Filtered by current curriculum map & scholastic level.</p>
              </div>

              {/* Intake & Admission Entry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Intake Deployment</label>
                  <Input className="h-14 font-black bg-muted/10 border-2 rounded-2xl focus:border-primary transition-all px-6" value={intakeYear} onChange={e => setIntakeYear(e.target.value)} />
                </div>
                <div className="space-y-2 relative group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center justify-between">
                     <span>Formal Registry Number</span>
                     <Badge className="bg-primary/10 text-primary border-none text-[8px] animate-pulse">Required</Badge>
                  </label>
                  <Input
                    className="h-14 font-black bg-muted/10 border-2 border-primary/30 rounded-2xl focus:border-primary transition-all px-6 font-mono tracking-widest placeholder:opacity-20 italic"
                    placeholder="RONGO/PG/XXXX/XX/XXX"
                    value={admissionNumber}
                    onChange={e => setAdmissionNumber(e.target.value)}
                  />
                  <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="h-3 w-3 rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Intelligence Sidecard */}
        <motion.div variants={itemVariants} className="space-y-10">
          <div className="card-shadow rounded-[36px] bg-[#0c0c10] border border-white/10 shadow-4xl overflow-hidden border-t-8 border-t-primary relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="p-8 border-b border-white/5 bg-white/5">
              <h3 className="font-black text-white text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
                 <School className="text-primary"/> Institutional <span className="text-primary italic">Node</span>
              </h3>
            </div>
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-8 relative z-10">
              <div className="w-full rounded-[32px] bg-white/5 border border-white/10 p-8 shadow-inner backdrop-blur-xl group">
                <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-4 group-hover:text-primary transition-colors">Registry Pointer</p>
                <p className="text-2xl font-mono text-white font-black tracking-[0.2em] uppercase truncate max-w-full italic drop-shadow-2xl">
                  {admissionNumber || "UNSPECIFIED"}
                </p>
              </div>
              <div className="space-y-6 w-full">
                 <div className="h-px bg-white/5 w-full" />
                 <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                   Authorized by System Admin for immediate curriculum deployment. Initial credential baseline: <span className="text-white italic">pgstudent</span>
                 </p>
              </div>
            </div>
          </div>

          {/* Verification Protocol Matrix */}
          <div className="card-shadow rounded-[40px] bg-card border border-border shadow-2xl overflow-hidden p-10 space-y-8">
            <h3 className="font-black text-foreground text-xs uppercase tracking-[0.3em] italic border-b border-border pb-6 flex items-center justify-between">
               Scholastic Mapping <Badge variant="outline" className="border-primary/20 text-primary text-[8px]">Live</Badge>
            </h3>
            <div className="space-y-6">
              {[
                { label: "School",      value: schools.find(s => s.id === selectedSchoolId)?.name || "—" },
                { label: "Department",  value: departments.find(d => d.id === selectedDeptId)?.name || "—" },
                { label: "Level",       value: selectedLevel ? (selectedLevel === 'phd' ? 'Doctoral' : 'Masters') : "—" },
                { label: "Programme",   value: programmes.find(p => p.id === selectedProgId)?.name || "—" },
              ].map((item, idx) => (
                <div key={item.label} className="flex flex-col gap-2 group">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">{item.label} Placement</span>
                  <p className="font-black text-foreground text-sm tracking-tight truncate border-l-2 border-primary/20 pl-4 py-1 group-hover:border-primary transition-all italic">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
