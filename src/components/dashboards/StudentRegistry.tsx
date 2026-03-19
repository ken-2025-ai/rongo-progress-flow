import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ──────────────────────────────────────────────────────────
// Institutional Academic Structure (static config)
// DB IDs are resolved at runtime — labels are authoritative.
// ──────────────────────────────────────────────────────────
const SCHOOL_CONFIG: Record<string, {
  depts: Record<string, {
    phd: string[];
    masters: string[];
  }>;
}> = {
  INFOCOMS: {
    depts: {
      IHRS: {
        masters: ["MSc. IT Specialization", "MSc. Health Informatics"],
        phd:     ["PhD. IT Specialization", "PhD. Health Informatics"],
      },
      CMJ: {
        masters: ["MSc. Photography", "MA. Journalism"],
        phd:     ["PhD. Photography", "PhD. Journalism"],
      },
    },
  },
  SAES: { depts: {} },
  SASSB: { depts: {} },
  Education: { depts: {} },
};

const STUDY_LEVELS = [
  { value: "phd",     label: "Doctor of Philosophy (PhD)", icon: "🎓" },
  { value: "masters", label: "Master's Degree (MSc / MA)", icon: "📚" },
];

export function StudentRegistry() {
  // DB lookup maps: name → id
  const [schoolMap,  setSchoolMap]  = useState<Record<string, string>>({});
  const [deptMap,    setDeptMap]    = useState<Record<string, string>>({});
  const [progMap,    setProgMap]    = useState<Record<string, string>>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(""); // school name key
  const [selectedDept,   setSelectedDept]   = useState(""); // dept name key
  const [selectedLevel,  setSelectedLevel]  = useState(""); // "phd" | "masters"
  const [selectedProg,   setSelectedProg]   = useState(""); // programme name (used as key → resolve ID on submit)
  const [intakeYear,     setIntakeYear]     = useState("2026");
  const [isLoading,      setIsLoading]      = useState(false);

  useEffect(() => {
    // Build name→id maps from DB. Labels come from SCHOOL_CONFIG.
    // @ts-ignore
    supabase.from('schools').select('id,name').then(({ data }) => {
      if (data) setSchoolMap(Object.fromEntries(data.map((s: any) => [s.name, s.id])));
    });
    // @ts-ignore
    supabase.from('departments').select('id,name').then(({ data }) => {
      if (data) setDeptMap(Object.fromEntries(data.map((d: any) => [d.name, d.id])));
    });
    // @ts-ignore
    supabase.from('programmes').select('id,name').then(({ data }) => {
      if (data) setProgMap(Object.fromEntries(data.map((p: any) => [p.name, p.id])));
    });
  }, []);

  // Derive options from static config filtered by current selections
  const availableDepts  = selectedSchool ? Object.keys(SCHOOL_CONFIG[selectedSchool]?.depts || {}) : [];
  const availableProgs: string[] = selectedDept && selectedSchool
    ? (selectedLevel === 'phd'
        ? SCHOOL_CONFIG[selectedSchool]?.depts[selectedDept]?.phd
        : selectedLevel === 'masters'
        ? SCHOOL_CONFIG[selectedSchool]?.depts[selectedDept]?.masters
        : [
            ...(SCHOOL_CONFIG[selectedSchool]?.depts[selectedDept]?.masters || []),
            ...(SCHOOL_CONFIG[selectedSchool]?.depts[selectedDept]?.phd || []),
          ]
      ) || []
    : [];



  const handleStudentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    // Resolve DB ID from the programme name
    const progId = progMap[selectedProg];
    if (!email || !progId || !firstName || !admissionNumber) {
      toast.error("Validation Error", { description: "Email, Programme, Name and Admission Number are required." });
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: "pgstudent",
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // @ts-ignore
        const { error: studentError } = await supabase.from('students').insert({
          user_id: authData.user.id,
          registration_number: admissionNumber,
          programme_id: progId,
          current_stage: 'DEPT_SEMINAR_PENDING'
        });

        if (studentError) throw studentError;

        toast.success("Registration Successful", {
          description: `Scholastic record created: ${admissionNumber}`,
        });

        setFirstName(""); setLastName(""); setEmail(""); setAdmissionNumber("");
        setSelectedSchool(""); setSelectedDept(""); setSelectedLevel(""); setSelectedProg("");
      }
    } catch (err: any) {
      toast.error("Registration Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass = "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 card-shadow bg-card p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <UserPlus className="text-primary" /> Post-Graduate Student Admission
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Register a postgraduate scholar. Select study level to filter available programmes.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Default Password</span>
            <span className="text-primary font-mono text-xs font-black leading-none mt-1">pgstudent</span>
          </div>
          <Button variant="outline" className="border-dashed h-10 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <UploadCloud size={16} className="mr-2" /> Bulk CSV Import
          </Button>
          <Button
            onClick={handleStudentRegistration}
            disabled={isLoading}
            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            {isLoading ? "Enrolling..." : "Enroll Scholar"}
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

          <form className="p-6 space-y-8 flex-1" onSubmit={handleStudentRegistration}>

            {/* Identity */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Personal Identity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">First Name</label>
                  <Input className="h-11 bg-background" placeholder="e.g. John" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Last Name</label>
                  <Input className="h-11 bg-background" placeholder="e.g. Doe" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Official Email</label>
                  <Input type="email" className="h-11 bg-background" placeholder="john.doe@rongo.ac.ke" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Contact Phone</label>
                  <Input className="h-11 bg-background" placeholder="+254..." />
                </div>
              </div>
            </div>

            {/* Academic Placement */}
            <div className="space-y-4 pt-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Academic Placement</h4>

              {/* School & Department — driven by SCHOOL_CONFIG */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">School</label>
                  <select
                    value={selectedSchool}
                    onChange={e => {
                      setSelectedSchool(e.target.value);
                      setSelectedDept("");
                      setSelectedLevel("");
                      setSelectedProg("");
                    }}
                    className={selectClass}
                  >
                    <option value="">Select School</option>
                    {Object.keys(SCHOOL_CONFIG).map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Department</label>
                  <select
                    value={selectedDept}
                    onChange={e => {
                      setSelectedDept(e.target.value);
                      setSelectedProg("");
                    }}
                    disabled={!selectedSchool}
                    className={selectClass}
                  >
                    <option value="">Select Department</option>
                    {availableDepts.map(deptName => (
                      <option key={deptName} value={deptName}>{deptName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* --- STUDY LEVEL SELECTOR --- */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Study Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {STUDY_LEVELS.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => {
                        setSelectedLevel(level.value);
                        setSelectedProg("");
                      }}
                      className={`flex items-center gap-3 h-14 rounded-xl border px-4 text-left transition-all font-bold text-sm ${
                        selectedLevel === level.value
                          ? "bg-primary/10 border-primary text-primary shadow-sm"
                          : "bg-background border-input text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="text-2xl">{level.icon}</span>
                      <div>
                        <p className="text-[11px] font-black leading-tight">{level.value.toUpperCase()}</p>
                        <p className="text-[10px] font-medium opacity-70 leading-tight">{level.value === 'phd' ? 'Doctoral Programme' : "Master's Programme"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Programme */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Programme</label>
                <select
                  value={selectedProg}
                  onChange={e => setSelectedProg(e.target.value)}
                  disabled={!selectedDept || !selectedLevel}
                  className={selectClass}
                >
                  <option value="">
                    {!selectedDept
                      ? "— Select a department first —"
                      : !selectedLevel
                      ? "— Select a study level first —"
                      : availableProgs.length === 0
                      ? "No programmes found for this selection"
                      : "Select Programme"}
                  </option>
                  {selectedLevel === 'phd' && availableProgs.length > 0 && (
                    <optgroup label="PhD Programmes">
                      {availableProgs.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </optgroup>
                  )}
                  {selectedLevel === 'masters' && availableProgs.length > 0 && (
                    <optgroup label="Master's Programmes">
                      {availableProgs.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Intake Year & Admission Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Intake Year</label>
                  <Input className="h-11 bg-background" value={intakeYear} onChange={e => setIntakeYear(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Official Admission Number</label>
                  <Input
                    className="h-11 bg-background font-mono font-bold border-primary/30"
                    placeholder="e.g. RONGO/PG/IHRS/26/001"
                    value={admissionNumber}
                    onChange={e => setAdmissionNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Sidebar — ID Engine + Level Preview */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden border-t-4 border-t-primary">
            <div className="p-5 border-b border-border/50 bg-primary/5">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2 uppercase tracking-widest">
                ID Generation Engine
              </h3>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-full rounded-xl bg-background border border-border p-4 shadow-inner">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Assigned Admission No.</p>
                <p className="text-xl font-mono text-primary font-black tracking-widest uppercase truncate max-w-full">
                  {admissionNumber || "SPECIFY-ID"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manually defined by System Admin to match institutional records.
              </p>
            </div>
          </div>

          {/* Enrolment Summary Card */}
          <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 bg-muted/10">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-widest">Enrolment Summary</h3>
            </div>
            <div className="p-5 space-y-3 text-xs">
              {[
                { label: "School",      value: selectedSchool || "—" },
                { label: "Department",  value: selectedDept   || "—" },
                { label: "Study Level", value: selectedLevel  ? STUDY_LEVELS.find(l => l.value === selectedLevel)?.label : "—" },
                { label: "Programme",   value: selectedProg   || "—" },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-start gap-2">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider shrink-0">{item.label}</span>
                  <span className="font-black text-foreground text-right break-all">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
