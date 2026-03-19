import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, CheckCircle2, 
  Clock, Filter, BookOpen, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export function SchoolSeminarQueue() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<any[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  useEffect(() => {
    if (user?.department_id) fetchSchoolQueue();
  }, [user]);

  const fetchSchoolQueue = async () => {
    setLoading(true);
    try {
      // 1. Find school ID from user's department
      // @ts-ignore
      const { data: deptData } = await supabase.from('departments').select('school_id, schools(name)').eq('id', user.department_id).single();
      if (!deptData) return;
      setSchoolInfo(deptData.schools);

      // 2. Fetch all SCHOOL_SEMINAR bookings for this school
      // @ts-ignore
      const { data } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            registration_number,
            user:user_id(first_name, last_name),
            programme:programme_id(name, department:department_id(name, school_id))
          )
        `)
        .eq('seminar_level', 'SCHOOL_SEMINAR')
        .eq('status', 'PENDING');

      // Filter by school in JS
      const filtered = (data || []).filter((b: any) => b.student?.programme?.department?.school_id === deptData.school_id);
      setQueue(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Queue Synchronization Error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (booking: any, status: 'APPROVED' | 'REJECTED', studentName: string) => {
    try {
      // 1. Update Seminar Booking Status
      // @ts-ignore
      const { error: bErr } = await supabase
        .from('seminar_bookings')
        .update({ status })
        .eq('id', booking.id);
      
      if (bErr) throw bErr;

      // 2. Update Student Stage if Approved
      if (status === 'APPROVED') {
        // @ts-ignore
        const { error: sErr } = await supabase
          .from('students')
          .update({ current_stage: 'THESIS_READINESS_CHECK' })
          .eq('id', booking.student_id);
        
        if (sErr) throw sErr;
      }

      toast.success(status === 'APPROVED' ? "Endorsed for 3rd Thursday" : "Returned to Dept", {
        description: `${studentName} has been processed in the institutional queue.`
      });
      fetchSchoolQueue();
    } catch (err) {
      toast.error("Administrative Sync Failed");
    }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <Users size={140} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-foreground flex items-center gap-3">
            <Users className="text-primary" size={24} />
            School Seminar Workflow Console
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">
            Candidates cleared by Department: <strong className="text-secondary uppercase">{schoolInfo?.name || "Architectural Unit"}</strong>
          </p>
        </div>
        <div className="relative w-full md:w-80 z-10">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
           <Input 
             placeholder="Search by student or reg no..." 
             className="pl-9 h-11 text-sm rounded-xl bg-background border-border/50 focus:ring-primary/20"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-md">
         <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Filter size={14} /> Eligibility Gateway Queue
            </h3>
            <Badge variant="outline" className="font-bold text-[9px] uppercase bg-secondary/10 text-secondary border-secondary/20">
               {queue.length} Active Candidates
            </Badge>
         </div>
         
         <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Candidate/Dept</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Status & Integrity</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Submission v.</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Requested Slot</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Command</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
              {queue
                .filter(b => {
                   const name = `${b.student?.user?.first_name} ${b.student?.user?.last_name}`.toLowerCase();
                   return name.includes(searchTerm.toLowerCase()) || b.student?.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((req) => (
                <TableRow key={req.id} className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
                  <TableCell className="py-4 px-6">
                     <div>
                        <span className="block font-black text-foreground">
                           {req.student?.user?.first_name} {req.student?.user?.last_name}
                        </span>
                        <p className="text-[10px] font-mono text-muted-foreground">{req.student?.registration_number}</p>
                        <Badge variant="outline" className="text-[8px] uppercase tracking-widest mt-1.5 bg-background font-black opacity-70">
                           {req.student?.programme?.department?.name}
                        </Badge>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-success uppercase tracking-tighter">
                           <CheckCircle2 size={12} /> DEPT ENDORSED
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-70">
                           <CheckCircle2 size={12} className="text-secondary" /> SURP. VERIFIED
                        </span>
                     </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2 group/file cursor-pointer">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover/file:bg-primary transition-colors">
                           <BookOpen size={14} className="text-primary group-hover/file:text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest underline decoration-border underline-offset-4 group-hover/file:text-primary transition-colors leading-tight truncate max-w-[120px]">
                           VERSION_7_FINAL.PDF
                        </span>
                     </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] py-1 px-3 rounded-lg uppercase tracking-tight">
                        {new Date(req.requested_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                     <div className="flex justify-end gap-2 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-all rounded-xl">
                               Return
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl border-border shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black">Return Candidate to Department</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                               <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                  Inform the departmental coordinator that this candidate is not architecturally ready for the school-level presentation.
                               </p>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reason for Return</label>
                                  <Textarea 
                                     placeholder="Specify missing requirements or formatting issues..." 
                                     className="min-h-[120px] bg-muted/20 border-border/50 rounded-xl resize-none p-4"
                                  />
                               </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" className="rounded-xl font-bold">Discard</Button>
                              <Button 
                                 variant="destructive" 
                                 className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-11"
                                 onClick={() => handleAction(req, "REJECTED", `${req.student?.user?.first_name} ${req.student?.user?.last_name}`)}
                              >
                                 Execute Return
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                           size="sm" 
                           className="h-9 px-6 bg-success hover:bg-success/90 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-success/20 rounded-xl transition-all active:scale-[0.98]" 
                           onClick={() => handleAction(req, "APPROVED", `${req.student?.user?.first_name} ${req.student?.user?.last_name}`)}
                        >
                           Endorse for 3rd Thursday
                        </Button>
                     </div>
                  </TableCell>
                </TableRow>
                ))
              }
              </AnimatePresence>
              {queue.length === 0 && (
                <TableRow>
                   <TableCell colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                         <div className="p-4 bg-muted/30 rounded-full">
                            <Clock size={32} className="text-muted-foreground/40" />
                         </div>
                         <div>
                            <p className="font-black text-sm text-foreground uppercase tracking-widest">Inbox Zero</p>
                            <p className="text-xs text-muted-foreground mt-1">No candidates are currently cleared for school-level presentation.</p>
                         </div>
                      </div>
                   </TableCell>
                </TableRow>
              )}
            </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
