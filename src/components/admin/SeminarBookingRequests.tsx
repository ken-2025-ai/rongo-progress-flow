import { motion, AnimatePresence } from "framer-motion";
import { 
  CalendarDays, Search, CheckCircle2, 
  XCircle, Clock, Filter, AlertTriangle, ArrowRight, Loader2, ChevronRight
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

export function SeminarBookingRequests() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (user?.department_id) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // 1. Get student IDs for this department
      // @ts-ignore
      const { data: deptStudents } = await supabase
        .from('students')
        .select('id')
        .eq('programme!inner(department_id)', user.department_id);
      
      const sIds = (deptStudents || []).map(s => s.id);
      if (sIds.length === 0) {
        setRequests([]);
        return;
      }

      // 2. Fetch Pending Bookings
      // @ts-ignore
      const { data } = await supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            registration_number,
            user:user_id(first_name, last_name),
            programme:programme_id(name)
          )
        `)
        .in('student_id', sIds)
        .eq('status', 'PENDING');

      setRequests(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Resource Synchronization Error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (booking: any, status: 'APPROVED' | 'REJECTED', studentName: string) => {
    try {
      // 1. Update Booking
      // @ts-ignore
      const { error: bErr } = await supabase
        .from('seminar_bookings')
        .update({ status })
        .eq('id', booking.id);
      
      if (bErr) throw bErr;

      // 2. Stage Advance if Approved
      if (status === 'APPROVED') {
        const nextStage = booking.seminar_level === 'DEPT_SEMINAR' ? 'SCHOOL_SEMINAR_PENDING' : 'THESIS_READINESS_CHECK';
        // @ts-ignore
        const { error: sErr } = await supabase
          .from('students')
          .update({ current_stage: nextStage })
          .eq('id', booking.student_id);
        
        if (sErr) throw sErr;
      }

      toast.success(status === 'APPROVED' ? "Architectural Lock Engagement" : "Protocol Reversal", {
        description: `${studentName} has been processed in the department queue.`
      });
      fetchRequests();
    } catch (err) {
      toast.error("Administrative Sync Failure");
    }
  };

  if (loading) return (
     <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none scale-150">
           <CalendarDays size={100} />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <CalendarDays className="text-primary" size={24} />
            Departmental Seminar Queue
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium font-mono uppercase tracking-widest opacity-70 italic shadow-sm bg-background/30 w-fit px-2 py-0.5 rounded">Architectural Command Center</p>
        </div>
        <div className="relative w-full md:w-80 z-10">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
           <Input 
             placeholder="Search active requests..." 
             className="pl-9 h-11 text-sm rounded-xl bg-background/50 border-border/50 focus:ring-primary/20 backdrop-blur-sm"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* The Action Queue */}
        <motion.div variants={itemVariants} className="xl:col-span-3 card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-md">
           <div className="p-5 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Filter size={14} /> Pending Institutional Requests
              </h3>
              <Badge variant="outline" className="font-bold text-[9px] uppercase bg-primary/10 text-primary border-primary/20">
                 {requests.length} Awaiting Action
              </Badge>
           </div>
           
           <Table>
             <TableHeader className="bg-muted/5">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Candidate Identity</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Seminar Protocol</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Temporal Request</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 text-center">Status</TableHead>
                  <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Directives</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
               <AnimatePresence>
               {requests.filter(r => {
                 const name = `${r.student?.user?.first_name} ${r.student?.user?.last_name}`.toLowerCase();
                 return name.includes(searchTerm.toLowerCase()) || r.student?.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
               }).map((req) => (
                 <TableRow key={req.id} className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0">
                   <TableCell className="py-4 px-6 font-medium text-foreground">
                      <p className="font-black text-sm">{(req.student as any)?.user?.first_name} {(req.student as any)?.user?.last_name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-70">{(req.student as any)?.registration_number}</p>
                   </TableCell>
                   <TableCell>
                      <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 ${
                         req.seminar_level.includes("SCHOOL") ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-primary/10 text-primary border-primary/20 shadow-sm"
                      }`}>
                         {req.seminar_level.replace('_', ' ')}
                      </Badge>
                   </TableCell>
                   <TableCell className="text-[11px] font-black text-foreground grayscale group-hover:grayscale-0 transition-all font-mono">
                      {new Date(req.requested_date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                   </TableCell>
                   <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-success/10 text-success px-2 py-0.5 rounded-lg border border-success/20">
                         <CheckCircle2 size={10} /> Supervisor OK
                      </span>
                   </TableCell>
                   <TableCell className="text-right py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 px-4 text-[9px] font-black uppercase tracking-widest border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl transition-all">Reject</Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl border-border shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black">Return Request Protocol</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                               <p className="text-xs text-muted-foreground font-medium leading-relaxed">Please indicate the architectural reasoning for returning this request to the candidate.</p>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Return Justification</label>
                                  <Textarea 
                                     placeholder="e.g. Schedule capacity reached, please re-initiate request for the next academic month..." 
                                     className="min-h-[120px] bg-muted/20 border-border/50 rounded-xl resize-none p-4"
                                  />
                               </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" className="rounded-xl font-bold">Cancel</Button>
                              <Button 
                                variant="destructive" 
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-11 shadow-lg shadow-destructive/20"
                                onClick={() => handleAction(req, "REJECTED", (req.student as any)?.user?.first_name)}
                              >
                                Revoke Request
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                           size="sm" 
                           className="h-9 px-6 bg-success hover:bg-success/90 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-success/20 rounded-xl transition-all active:scale-[0.98]" 
                           onClick={() => handleAction(req, "APPROVED", (req.student as any)?.user?.first_name)}
                        >
                           Lock Schedule
                        </Button>
                      </div>
                   </TableCell>
                 </TableRow>
               ))}
               </AnimatePresence>
               {requests.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="py-20 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-40">
                       <Clock size={40} />
                       <p className="font-black text-xs uppercase tracking-widest">Architectural Silence</p>
                     </div>
                   </TableCell>
                 </TableRow>
               )}
             </TableBody>
           </Table>
        </motion.div>

        {/* Visual Calendar Panel */}
        <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-md">
           <div className="p-6 bg-muted/20 border-b border-border text-center">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Architectural Calendar</h3>
              <p className="text-2xl font-black text-foreground mt-1 tabular-nums">APRIL 2026</p>
           </div>
           
           <div className="p-5 flex-1 space-y-4">
              {[
                { label: "1st Thursday", date: "Apr 2", type: "Dept Sessions", load: 3, max: 5, color: "primary" },
                { label: "2nd Thursday", date: "Apr 9", type: "Dept Sessions", load: 5, max: 5, color: "primary" },
                { label: "3rd Thursday", date: "Apr 16", type: "School Vetting", load: 1, max: 5, color: "secondary" },
              ].map((slot, i) => (
                <div key={i} className={`p-4 rounded-2xl border border-${slot.color}/20 bg-${slot.color}/5 cursor-pointer hover:bg-${slot.color}/10 transition-all group/slot`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-black text-${slot.color} uppercase tracking-widest`}>{slot.label}</span>
                     <Badge variant="secondary" className="text-[9px] px-2 py-0.5 rounded-lg font-black uppercase bg-background border-border shadow-sm">{slot.date}</Badge>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">{slot.type}</p>
                  <div className="mt-3 space-y-1.5">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
                        <span>Load Management</span>
                        <span className={slot.load >= slot.max ? "text-destructive" : "text-foreground"}>{slot.load} / {slot.max} Slots</span>
                     </div>
                     <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden flex gap-0.5">
                        {Array.from({length: slot.max}).map((_, idx) => (
                          <div key={idx} className={`h-full flex-1 transition-all duration-700 delay-[${idx * 100}ms] ${idx < slot.load ? `bg-${slot.color}` : 'bg-muted-foreground/10'}`} />
                        ))}
                     </div>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="p-4 border-t border-border bg-muted/10">
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest gap-2 h-10 hover:bg-background transition-colors group/btn">
                 Calibrate Slots <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Button>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
