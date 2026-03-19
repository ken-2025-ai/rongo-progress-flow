import { motion, AnimatePresence } from "framer-motion";
import { 
  GitBranch, Search, Filter, AlertTriangle, 
  ArrowRightCircle, CheckCircle2, Loader2, ChevronRight, UserCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export function StudentProgressControl() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (user?.department_id) fetchDepartmentRoster();
  }, [user]);

  const fetchDepartmentRoster = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name),
          programme:programme_id(name)
        `)
        .eq('programme!inner(department_id)', user.department_id);
      
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Roster Synchronization Failure");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (studentId: string, currentStage: string, name: string) => {
    // Basic progression logic: PENDING -> COMPLETED -> SCHOOL_PENDING -> SCHOOL_COMPLETED -> READINESS -> EXAM -> VIVA -> CORRECTIONS -> DONE
    const stages = [
      'DEPT_SEMINAR_PENDING', 'DEPT_SEMINAR_COMPLETED',
      'SCHOOL_SEMINAR_PENDING', 'SCHOOL_SEMINAR_COMPLETED',
      'THESIS_READINESS_CHECK', 'PG_EXAMINATION', 
      'VIVA_SCHEDULED', 'CORRECTIONS', 'COMPLETED'
    ];
    
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
       toast.error("Terminal Stage Reached", { description: "Cannot advance beyond completion protocol." });
       return;
    }

    const nextStage = stages[currentIndex + 1];

    try {
      // @ts-ignore
      const { error } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', studentId);
      
      if (error) throw error;

      toast.success("Architectural Stage Advanced", {
        description: `${name} has been moved to ${nextStage.replace(/_/g, ' ')}.`
      });
      fetchDepartmentRoster();
    } catch (err) {
      toast.error("Manual Override Failed");
    }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card/60 backdrop-blur-md p-8 rounded-[2rem] border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none scale-150">
           <GitBranch size={100} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3 tracking-tight">
            <GitBranch className="text-primary" size={28} />
            Departmental Roster Control
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium max-w-md italic">Manually calibrate student progression stages for the academic administrative pipeline.</p>
        </div>
        <div className="relative w-full md:w-80 z-10">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
           <Input 
             placeholder="Search active candidates..." 
             className="pl-9 h-12 text-sm rounded-2xl bg-background border-border shadow-inner"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-3xl overflow-hidden border border-border/50 shadow-xl">
         <div className="p-6 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
               <UserCircle size={14} /> Official Roster Matrix
            </h3>
            <Badge variant="outline" className="font-bold text-[9px] uppercase bg-secondary/10 text-secondary border-secondary/20 px-3 py-1">
               {students.length} Candidates Enrolled
            </Badge>
         </div>
         
         <Table>
           <TableHeader className="bg-muted/5">
             <TableRow className="border-b border-border/40 hover:bg-transparent">
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 px-8">Candidate Identity</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5">Program Domain</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5">Architectural Status</TableHead>
               <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 px-8">Protocol Override</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             <AnimatePresence>
             {students
               .filter(s => `${s.user?.first_name} ${s.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) || s.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
               .map((student) => (
               <TableRow key={student.id} className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
                 <TableCell className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black shadow-inner">
                        {student.user?.first_name?.charAt(0)}{student.user?.last_name?.charAt(0)}
                      </div>
                      <div className="leading-tight">
                         <span className="block font-black text-[15px] group-hover:text-primary transition-colors">{student.user?.first_name} {student.user?.last_name}</span>
                         <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter opacity-70">{student.registration_number}</span>
                      </div>
                    </div>
                 </TableCell>
                 <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-background border-border/60 px-2.5 py-1 rounded-lg italic">
                      {student.programme?.name || "Unmapped Domain"}
                    </Badge>
                 </TableCell>
                 <TableCell>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black uppercase text-foreground tracking-tight flex items-center gap-1.5">
                         <ChevronRight size={12} className="text-primary" /> {student.current_stage.replace(/_/g, ' ')}
                      </span>
                    </div>
                 </TableCell>
                 <TableCell className="text-right py-5 px-8">
                    <Button 
                      size="sm" 
                      className="h-10 px-6 bg-secondary hover:bg-secondary/90 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-secondary/20 rounded-xl transition-all active:scale-[0.98] group/btn" 
                      onClick={() => handleAdvance(student.id, student.current_stage, student.user?.first_name)}
                    >
                       Advance Stage <ArrowRightCircle size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                 </TableCell>
               </TableRow>
             ))}
             </AnimatePresence>
           </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
