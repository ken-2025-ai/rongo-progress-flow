import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays, Search, CheckCircle2,
  XCircle, Clock, Filter, ChevronRight, Loader2, SlidersHorizontal
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
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export function SeminarBookingRequests() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [rejectNote, setRejectNote] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [processing, setProcessing] = useState(false);

  // Calendar slot stats (live)
  const [calendarStats, setCalendarStats] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Fetch all PENDING bookings (coordinator sees their dept's students)
      // @ts-ignore
      let query = supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            id,
            registration_number,
            current_stage,
            user:user_id(first_name, last_name, email),
            programme:programme_id(name, department:department_id(name, id))
          )
        `)
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      // Filter by coordinator's department (client-side since nested filtering is complex)
      let filtered = data || [];
      if (user?.department_id) {
        filtered = filtered.filter((r: any) =>
          r.student?.programme?.department?.id === user.department_id
        );
      }

      setRequests(filtered);

      // Build calendar stats from approved bookings
      // @ts-ignore
      const { data: approved } = await supabase
        .from('seminar_bookings')
        .select('approved_date')
        .eq('status', 'APPROVED')
        .not('approved_date', 'is', null);

      const statsMap: Record<string, number> = {};
      (approved || []).forEach((b: any) => {
        if (b.approved_date) {
          const d = b.approved_date.slice(0, 10);
          statsMap[d] = (statsMap[d] || 0) + 1;
        }
      });
      setCalendarStats(
        Object.entries(statsMap)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .slice(0, 4)
          .map(([date, count]) => ({ date, count }))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load booking requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (booking: any) => {
    if (!proposedDate) {
      toast.error("Select an approved date before confirming.");
      return;
    }
    setProcessing(true);
    try {
      const studentName = `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}`;

      // 1. Update booking to APPROVED with set date
      // @ts-ignore
      const { error: bErr } = await supabase
        .from('seminar_bookings')
        .update({
          status: 'APPROVED',
          approved_date: proposedDate,
          approved_by: user?.id
        })
        .eq('id', booking.id);
      if (bErr) throw bErr;

      // 2. Advance student stage to _BOOKED variant
      const nextStage =
        booking.seminar_level === 'DEPT_SEMINAR'
          ? 'DEPT_SEMINAR_BOOKED'
          : 'SCHOOL_SEMINAR_BOOKED';
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', booking.student_id);
      if (sErr) throw sErr;

      toast.success("Booking Approved", {
        description: `${studentName} is scheduled for ${new Date(proposedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}.`
      });
      setProposedDate("");
      fetchRequests();
    } catch (err: any) {
      toast.error("Approval Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (booking: any) => {
    if (!rejectNote.trim()) {
      toast.error("Provide a reason before rejecting.");
      return;
    }
    setProcessing(true);
    try {
      const studentName = `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}`;

      // @ts-ignore
      const { error } = await supabase
        .from('seminar_bookings')
        .update({ status: 'REJECTED', notes: rejectNote })
        .eq('id', booking.id);
      if (error) throw error;

      // Record a corrections evaluation note
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: booking.student_id,
        evaluator_id: user?.id,
        evaluation_type: booking.seminar_level,
        recommendation: 'MAJOR_CORRECTIONS',
        comments: rejectNote
      });

      toast.error("Booking Rejected", {
        description: `${studentName}'s request has been returned with notes.`
      });
      setRejectNote("");
      fetchRequests();
    } catch (err: any) {
      toast.error("Rejection Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = requests.filter(r => {
    const name = `${r.student?.user?.first_name} ${r.student?.user?.last_name}`.toLowerCase();
    const matchName = name.includes(searchTerm.toLowerCase()) ||
      (r.student?.registration_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = levelFilter === "ALL" || r.seminar_level === levelFilter;
    return matchName && matchLevel;
  });

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <CalendarDays className="text-primary" size={24} /> Seminar Booking Requests
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Review and approve or reject student seminar booking requests for your department.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
            <Input
              placeholder="Search student..."
              className="pl-9 h-11 text-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="h-11 w-48 rounded-xl font-bold text-xs">
              <SlidersHorizontal size={14} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="DEPT_SEMINAR">Dept Seminar</SelectItem>
              <SelectItem value="SCHOOL_SEMINAR">School Seminar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Requests Table */}
        <motion.div variants={itemVariants} className="xl:col-span-3 card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-md">
          <div className="p-5 border-b border-border bg-muted/10 flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
              Pending Approvals
            </h3>
            <Badge variant="outline" className="font-bold text-[9px] uppercase bg-primary/10 text-primary border-primary/20">
              {filtered.length} requests
            </Badge>
          </div>

          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Student</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Level</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Requested Date</TableHead>
                <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Dept</TableHead>
                <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((req) => (
                  <TableRow key={req.id} className="group hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0">
                    <TableCell className="py-4 px-6">
                      <p className="font-black text-sm text-foreground">
                        {req.student?.user?.first_name} {req.student?.user?.last_name}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">{req.student?.registration_number}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[9px] font-black uppercase ${req.seminar_level?.includes('SCHOOL') ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                        {req.seminar_level?.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[11px] font-bold text-foreground font-mono">
                      {new Date(req.requested_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] text-muted-foreground font-bold">
                        {req.student?.programme?.department?.name || '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-4 px-6">
                      <div className="flex justify-end gap-2">
                        {/* REJECT DIALOG */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-4 text-[9px] font-black uppercase border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl"
                            >
                              <XCircle size={14} className="mr-1" /> Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-black text-xl">Reject Booking Request</DialogTitle>
                              <p className="text-xs text-muted-foreground">
                                For: <strong>{req.student?.user?.first_name} {req.student?.user?.last_name}</strong>
                              </p>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                Provide a clear reason. This note will be recorded and visible to the student and supervisor.
                              </p>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rejection Reason</label>
                                <Textarea
                                  placeholder="e.g. Schedule at capacity, supervisor approval pending, insufficient research progress..."
                                  className="min-h-[120px] rounded-xl resize-none"
                                  value={rejectNote}
                                  onChange={e => setRejectNote(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setRejectNote("")}>Cancel</Button>
                              <Button
                                variant="destructive"
                                className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-11"
                                disabled={processing || !rejectNote.trim()}
                                onClick={() => handleReject(req)}
                              >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : "Confirm Rejection"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* APPROVE DIALOG */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="h-9 px-5 bg-success hover:bg-success/90 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md"
                            >
                              <CheckCircle2 size={14} className="mr-1" /> Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-black text-xl">Approve & Schedule</DialogTitle>
                              <p className="text-xs text-muted-foreground">
                                For: <strong>{req.student?.user?.first_name} {req.student?.user?.last_name}</strong>
                              </p>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-sm text-muted-foreground">
                                Confirm the seminar date. This will lock the student's slot and advance their pipeline stage.
                              </p>
                              <div className="bg-muted/10 p-3 rounded-xl border border-border/40 text-xs space-y-1">
                                <p><span className="font-black text-muted-foreground uppercase tracking-widest">Requested:</span> {new Date(req.requested_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p><span className="font-black text-muted-foreground uppercase tracking-widest">Level:</span> {req.seminar_level?.replace(/_/g, ' ')}</p>
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Approved Session Date
                                </label>
                                <input
                                  type="date"
                                  value={proposedDate}
                                  onChange={e => setProposedDate(e.target.value)}
                                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setProposedDate("")}>Cancel</Button>
                              <Button
                                className="bg-success hover:bg-success/90 text-white rounded-xl font-black uppercase tracking-widest text-[10px] px-6 h-11 shadow-lg"
                                disabled={processing || !proposedDate}
                                onClick={() => handleApprove(req)}
                              >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : "Lock Schedule"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Clock size={40} />
                      <p className="font-black text-xs uppercase tracking-widest">No pending requests</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Live Slot Calendar */}
        <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl border border-border overflow-hidden shadow-md flex flex-col">
          <div className="p-5 border-b border-border bg-muted/10 text-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Slot Load Overview</h3>
            <p className="text-sm font-black text-foreground mt-1">Approved Sessions</p>
          </div>

          <div className="p-5 flex-1 space-y-4">
            {calendarStats.length === 0 ? (
              <div className="text-center text-xs text-muted-foreground opacity-50 font-bold uppercase tracking-widest py-8">
                No scheduled sessions yet
              </div>
            ) : (
              calendarStats.map((slot, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {new Date(slot.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">
                      {slot.count} booked
                    </Badge>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((slot.count / 5) * 100, 100)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border/30 bg-muted/5">
            <Button
              variant="ghost"
              className="w-full text-[10px] font-black uppercase tracking-widest gap-2 h-10 hover:bg-background"
              onClick={fetchRequests}
            >
              Refresh Slots <ChevronRight size={14} />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
