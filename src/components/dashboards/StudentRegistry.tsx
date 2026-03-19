import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserPlus, UploadCloud, Building2, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function StudentRegistry() {
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedProg, setSelectedProg] = useState("");
  const [intakeYear, setIntakeYear] = useState("2026");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // @ts-ignore
    supabase.from('schools').select('*').then(({ data }) => setSchools(data || []));
    // @ts-ignore
    supabase.from('departments').select('*').then(({ data }) => setDepartments(data || []));
    // @ts-ignore
    supabase.from('programmes').select('*').then(({ data }) => setProgrammes(data || []));
  }, []);

  const handleStudentRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !selectedProg || !firstName || !admissionNumber) {
       toast.error("Validation Error", { description: "Email, Programme, Name and Admission Number are required." });
       return;
    }

    setIsLoading(true);
    try {
      // 1. Create Auth Account with default password "pgstudent"
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: "pgstudent",
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Create Student Profile using manual Admission Number
        // @ts-ignore
        const { error: studentError } = await supabase.from('students').insert({
          user_id: authData.user.id,
          registration_number: admissionNumber,
          programme_id: selectedProg,
          current_stage: 'DEPT_SEMINAR_PENDING'
        });

        if (studentError) throw studentError;

        toast.success("Registration Successful", {
          description: `Scholastic record created: ${admissionNumber}`,
        });
        
        setFirstName(""); setLastName(""); setEmail(""); setAdmissionNumber("");
      }
    } catch (err: any) {
      toast.error("Registration Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 card-shadow bg-card p-6 rounded-2xl border border-border">
         <div>
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
               <UserPlus className="text-primary"/> Post-Graduate Student Admission
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
               Manually register a single scholar or use the bulk import tool to process a cohort via CSV. The system will automatically generate sequential Admission Numbers.
            </p>
         </div>
         <div className="flex items-center gap-4 shrink-0">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Enrollment Key</span>
               <span className="text-primary font-mono text-xs font-black leading-none mt-1">pgstudent</span>
            </div>
            <Button variant="outline" className="border-dashed h-10 px-4 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
               <UploadCloud size={16} className="mr-2"/> Bulk CSV Import
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
               <div className="space-y-4 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">Academic Placement</h4>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-xs font-bold text-foreground">School</label>
                         <select 
                           value={selectedSchool}
                           onChange={e => {
                              setSelectedSchool(e.target.value);
                              setSelectedDept(""); // Reset dept on school change
                              setSelectedProg(""); // Reset prog as well
                           }}
                           className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                         >
                            <option value="">Select School</option>
                            <option value="INFOCOMS">INFOCOMS (Hardware Fallback)</option>
                            {schools.filter(s => s.name !== 'INFOCOMS').map(s => (
                               <option key={s.id} value={s.id}>{s.name || "Unnamed Unit"}</option>
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
                           className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                         >
                            <option value="">Select Department</option>
                            {selectedSchool === 'INFOCOMS' && (
                               <>
                                 <option value="IHRS">IHRS (Academic Unit)</option>
                                 <option value="CMJ">CMJ (Academic Unit)</option>
                               </>
                            )}
                            {departments.filter(d => d.school_id === selectedSchool).map(d => (
                               <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                         </select>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-foreground">Programme</label>
                        <select 
                          value={selectedProg}
                          onChange={e => setSelectedProg(e.target.value)}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                           <option value="">Select Programme</option>
                           {programmes.filter(p => !selectedDept || p.department_id === selectedDept).map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                        </select>
                     </div>
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
         </motion.div>
      </div>

    </motion.div>
  );
}
