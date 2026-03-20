import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, CheckCircle2,
  Clock, Filter, BookOpen, Loader2, XCircle, ChevronRight, FileCheck
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
  const [rejectNote, setRejectNote] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user?.department_id) fetchSchoolQueue();
  }, [user]);

  const fetchSchoolQueue = async () => {
    setLoading(true);
    try {
      // 1. Get school info for the current school coordinator
      // @ts-ignore
      const { data: deptData } = await supabase
        .from('departments')
        .select('school_id, schools(name)')
        .eq('id', user.department_id)
        .single();
      
      if (!deptData) return;
      setSchoolInfo(deptData.schools);

      // 2. Fetch all school seminar bookings which are PENDING
      // @ts-ignore
      const { data, error } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            id,
            registration_number,
            current_stage,
            user:user_id(first_name, last_name, email),
            programme:programme_id(name, department:department_id(name, id, school_id))
          )
        `)
        .eq('seminar_level', 'SCHOOL_SEMINAR')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // 3. Filter by school coordinator's school
      const schoolFiltered = (data || []).filter((b: any) => 
        b.student?.programme?.department?.school_id === deptData.school_id
      );

      setQueue(schoolFiltered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load school seminar queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (booking: any, status: 'APPROVED' | 'REJECTED') => {
    const studentName = `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}`;
    
    if (status === 'REJECTED' && !rejectNote.trim()) {
      toast.error("Please provide a reason for return.");
      return;
    }

    setProcessing(true);
    try {
      // 1. Update Booking Status
      // @ts-ignore
      const { error: bErr } = await supabase
        .from('seminar_bookings')
        .update({ 
          status, 
          notes: status === 'REJECTED' ? rejectNote : null,
          approved_by: user?.id
        })
        .eq('id', booking.id);
      
      if (bErr) throw bErr;

      // 2. Update Student Stage or Create Evaluation
      if (status === 'APPROVED') {
        // Just advance internal stage, the 3rd Thursday scheduler will see it
        // @ts-ignore
        await supabase
          .from('students')
          .update({ current_stage: 'SCHOOL_SEMINAR_BOOKED' })
          .eq('id', booking.student_id);
          
        toast.success("Candidate Endorsed", {
          description: `${studentName} is now cleared for the School Third Thursday Seminar.`
        });
      } else {
        // Rejection: return to department
        // @ts-ignore
        await supabase
          .from('students')
          .update({ current_stage: 'SCHOOL_SEMINAR_PENDING' })
          .eq('id', booking.student_id);

        // Audit Record
        // @ts-ignore
        await supabase.from('evaluations').insert({
          student_id: booking.student_id,
          evaluator_id: user?.id,
          evaluation_type: 'SCHOOL_SEMINAR',
          recommendation: 'MAJOR_CORRECTIONS',
          comments: `Returned from School Level: ${rejectNote}`
        });

        toast.error("Returned to Department", {
          description: `${studentName}'s request has been sent back for refinement.`
        });
      }

      setRejectNote("");
      fetchSchoolQueue();
    } catch (err: any) {
      console.error(err);
      toast.error("Process Failure", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-[0.03]">
          <FileCheck size={280} />
        </div>
        <div className="relative z-10">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase tracking-[0.2em] mb-3">
            Institutional Gateway
          </Badge>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            School Seminar Workflow Console
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xl italic">
            Reviewing candidates from all departments in <span className="text-primary font-black uppercase not-italic">{schoolInfo?.name || "the School"}</span> candidates for institutional endorsement.
          </p>
        </div>
        <div className="relative w-full md:w-80 z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
          <Input 
            placeholder="Search by student identity..." 
            className="pl-12 h-14 text-sm rounded-2xl bg-background shadow-inner border-border/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-3xl overflow-hidden border border-border shadow-xl">
        <div className="p-6 border-b border-border bg-muted/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-secondary/10 rounded-lg">
                <Filter size={18} className="text-secondary" />
             </div>
             <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
                School Endorsement Queue
             </h3>
          </div>
          <Badge variant="outline" className="font-black text-[10px] uppercase bg-secondary/10 text-secondary border-secondary/20 px-4 py-1.5 h-auto">
             {queue.length} Awaiting Authorization
          </Badge>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 px-8">Candidate Profile</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5">Verification Status</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5">Proposed Slot</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 px-8">Decision Directives</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {queue
                .filter(b => {
                  const name = `${b.student?.user?.first_name} ${b.student?.user?.last_name}`.toLowerCase();
                  return name.includes(searchTerm.toLowerCase()) || 
                         (b.student?.registration_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (b.student?.programme?.department?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((req) => (
                  <TableRow key={req.id} className="group hover:bg-muted/10 transition-colors border-b border-border/30 last:border-0">
                    <TableCell className="py-6 px-8">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-sm font-black shadow-inner">
                            {req.student?.user?.first_name?.[0]}{req.student?.user?.last_name?.[0]}
                         </div>
                         <div>
                            <span className="block font-black text-foreground text-lg tracking-tight">
                               {req.student?.user?.first_name} {req.student?.user?.last_name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded italic whitespace-nowrap">
                                  {req.student?.registration_number}
                               </span>
                               <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 truncate max-w-[150px]">
                                  {req.student?.programme?.department?.name}
                               </span>
                            </div>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-success uppercase tracking-widest bg-success/5 border border-success/10 px-2 py-1 rounded w-fit">
                            <CheckCircle2 size={12} /> DEPT APPROVED
                         </span>
                         <span className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/10 px-2 py-1 rounded w-fit italic opacity-80">
                            <CheckCircle2 size={12} className="text-primary" /> SUPV. VERIFIED
                         </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                         <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 font-black text-[10px] py-1 px-3 rounded-lg uppercase tracking-tight w-fit">
                            {new Date(req.requested_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}
                         </Badge>
                         <span className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-[0.1em] pl-1">Requested Slot</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-6 px-8">
                      <div className="flex justify-end gap-3 shrink-0">
                        {/* Return Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-11 px-5 text-[10px] font-black uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40 transition-all rounded-xl"
                            >
                               <XCircle size={16} className="mr-2" /> Return
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-border shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black tracking-tight">Return Candidate for Refinement</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-5 py-6">
                               <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                  You are returning <strong className="text-foreground">{req.student?.user?.first_name} {req.student?.user?.last_name}</strong> to their department. Please state the structural deficiencies.
                               </p>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                     <Clock size={14} className="text-destructive" /> Rejection Reasoning
                                  </label>
                                  <Textarea 
                                     placeholder="e.g. Missing departmental defense minutes, incomplete data analysis section..." 
                                     className="min-h-[140px] bg-muted/20 border-border/50 rounded-2xl p-5 text-sm resize-none focus:bg-background transition-all"
                                     value={rejectNote}
                                     onChange={(e) => setRejectNote(e.target.value)}
                                  />
                               </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <Button variant="ghost" className="rounded-xl font-black uppercase text-[10px]" onClick={() => setRejectNote("")}>Discard</Button>
                              <Button 
                                 variant="destructive" 
                                 className="rounded-xl font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-lg shadow-destructive/20"
                                 onClick={() => handleAction(req, "REJECTED")}
                                 disabled={processing || !rejectNote.trim()}
                               >
                                 {processing ? <Loader2 className="animate-spin" /> : "Confirm Return"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Endorse Button */}
                        <Button 
                           size="sm" 
                           className="h-11 px-8 bg-success hover:bg-success/90 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-success/20 rounded-xl transition-all active:scale-[0.98] group/btn" 
                           onClick={() => handleAction(req, "APPROVED")}
                           disabled={processing}
                        >
                           {processing ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 size={16} className="mr-2" />}
                           Endorse for 3rd Thursday <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              }
              </AnimatePresence>
              {queue.length === 0 && (
                <TableRow>
                   <TableCell colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-50">
                         <div className="p-6 bg-muted/20 rounded-full border border-border/40">
                            <Clock size={40} className="text-muted-foreground/30" />
                         </div>
                         <div>
                            <p className="font-black text-lg text-foreground uppercase tracking-widest">Inbox Zero</p>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">The institutional queue is currently empty.</p>
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
