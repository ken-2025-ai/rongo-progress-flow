import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle, ClipboardCheck, Users,
  Clock, CalendarPlus, FileText, CheckCircle2, AlertTriangle,
  MessageSquare, Loader2, MapPin, ChevronDown, ChevronUp, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { containerVariants, itemVariants } from "@/lib/animations";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

const DECISIONS = [
  { id: 'PASS', label: 'Pass', colorClass: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  { id: 'MINOR_CORRECTIONS', label: 'Minor Corrections', colorClass: 'bg-status-warning/10 text-status-warning border-status-warning/20', icon: AlertTriangle },
  { id: 'MAJOR_CORRECTIONS', label: 'Major Corrections', colorClass: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
  { id: 'REPEAT_SEMINAR', label: 'Repeat Seminar', colorClass: 'bg-muted text-muted-foreground border-border', icon: PlayCircle },
];

export function SeminarSessions() {
  const { user } = useRole();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [newSessionDate, setNewSessionDate] = useState("");
  const [newSessionVenue, setNewSessionVenue] = useState("");
  const [expandedPresenter, setExpandedPresenter] = useState<string | null>(null);
  const [panelNames, setPanelNames] = useState<Record<string, string>>({});
  const [panelAssignMap, setPanelAssignMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSessions();
    fetchPanelMembers();
  }, [user]);

  const fetchPanelMembers = async () => {
    try {
      // @ts-ignore
      const { data } = await supabase.from('users').select('id, first_name, last_name').eq('role', 'EXAMINER');
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => { map[p.id] = `${p.first_name} ${p.last_name}`; });
      setPanelNames(map);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      let query = supabase
        .from('seminar_bookings')
        .select(`
          *,
          student:student_id(
            id,
            registration_number,
            current_stage,
            research_title,
            user:user_id(first_name, last_name, email),
            programme:programme_id(name, department:department_id(name, id))
          )
        `)
        .eq('status', 'APPROVED')
        .order('approved_date', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      let filtered = data || [];
      if (user?.department_id) {
        filtered = filtered.filter((b: any) =>
          b.student?.programme?.department?.id === user.department_id
        );
      }

      // Group by date
      const grouped = filtered.reduce((acc: any[], curr: any) => {
        const dateKey = curr.approved_date?.slice(0, 10) || curr.requested_date?.slice(0, 10);
        const display = dateKey ? new Date(dateKey).toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD';
        const existing = acc.find(s => s.dateKey === dateKey);
        if (existing) {
          existing.presenters.push(curr);
        } else {
          acc.push({ id: dateKey || curr.id, dateKey, date: display, presenters: [curr] });
        }
        return acc;
      }, []);

      setSessions(grouped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seminar sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = (sessionId: string, date: string) => {
    setActiveSessionId(sessionId);
    toast.success("Session Started", {
      description: `Seminar panel scoring is now unlocked for ${date}.`
    });
  };

  const handleCreateSession = async () => {
    if (!newSessionDate || !newSessionVenue) {
      toast.error("Please select a date and enter a venue.");
      return;
    }
    toast.success("Session Slot Created", {
      description: `A new seminar slot at ${newSessionVenue} has been opened for ${new Date(newSessionDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.`
    });
    setNewSessionDate("");
    setNewSessionVenue("");
  };

  const handleAssignPanel = async (bookingId: string, panelMemberId: string) => {
    if (!panelMemberId) return;
    try {
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: sessions
          .flatMap(s => s.presenters)
          .find((p: any) => p.id === bookingId)?.student_id,
        evaluator_id: panelMemberId,
        evaluation_type: 'DEPT_SEMINAR',
        recommendation: 'PASS',  // placeholder until actual eval
        comments: `Panel member pre-assigned by coordinator.`
      });
      setPanelAssignMap(prev => ({ ...prev, [bookingId]: panelMemberId }));
      toast.success("Panel Member Assigned", {
        description: `${panelNames[panelMemberId]} has been assigned to this presentation.`
      });
    } catch (err: any) {
      toast.error("Assignment Failed", { description: err.message });
    }
  };

  const recordDecision = async (booking: any) => {
    const decision = selectedDecisions[booking.id];
    if (!decision) {
      toast.error("Select a panel verdict before committing.");
      return;
    }
    const feedback = feedbacks[booking.id] || "";
    setProcessing(true);
    try {
      // 1. Create evaluation
      // @ts-ignore
      const { error: evalErr } = await supabase.from('evaluations').insert({
        student_id: booking.student_id,
        evaluator_id: user?.id,
        evaluation_type: booking.seminar_level,
        recommendation: decision,
        comments: feedback
      });
      if (evalErr) throw evalErr;

      // 2. Update booking status to reflect completion
      // @ts-ignore
      await supabase.from('seminar_bookings').update({ status: 'COMPLETED' }).eq('id', booking.id);

      // 3. Advance student stage based on decision
      let nextStage: string;
      if (decision === 'PASS') {
        nextStage = booking.seminar_level === 'DEPT_SEMINAR'
          ? 'DEPT_SEMINAR_COMPLETED'
          : 'SCHOOL_SEMINAR_COMPLETED';
      } else if (decision === 'MINOR_CORRECTIONS') {
        nextStage = booking.seminar_level === 'DEPT_SEMINAR'
          ? 'DEPT_SEMINAR_COMPLETED'
          : 'SCHOOL_SEMINAR_COMPLETED';
      } else {
        // MAJOR_CORRECTIONS or REPEAT_SEMINAR → back to pending
        nextStage = booking.seminar_level === 'DEPT_SEMINAR'
          ? 'DEPT_SEMINAR_PENDING'
          : 'SCHOOL_SEMINAR_PENDING';
      }

      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', booking.student_id);
      if (sErr) throw sErr;

      toast.success(`Decision Recorded — ${decision.replace(/_/g, ' ')}`, {
        description: `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}'s stage has been updated.`
      });
      setSelectedDecisions(prev => { const n = { ...prev }; delete n[booking.id]; return n; });
      setFeedbacks(prev => { const n = { ...prev }; delete n[booking.id]; return n; });
      fetchSessions();
    } catch (err: any) {
      console.error(err);
      toast.error("Decision Failed", { description: err.message });
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <ClipboardCheck className="text-secondary" size={28} /> Seminar Sessions
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Start sessions, assign panel members, and record formal verdicts.
          </p>
        </div>
        {/* Create new slot */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 h-11 text-[10px] font-black uppercase tracking-widest border-border rounded-xl px-6">
              <CalendarPlus size={16} /> New Session Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-xl">Create New Seminar Slot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">Open a new scheduled slot for departmental seminar presentations.</p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Date</label>
                <input
                  type="date"
                  value={newSessionDate}
                  onChange={e => setNewSessionDate(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Venue</label>
                <Input
                  placeholder="e.g. Main Boardroom, Block B"
                  value={newSessionVenue}
                  onChange={e => setNewSessionVenue(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="bg-secondary text-white font-black text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl"
                disabled={!newSessionDate || !newSessionVenue}
                onClick={handleCreateSession}
              >
                Create Slot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-muted/5 opacity-40">
          <Clock size={48} />
          <p className="font-black text-xs uppercase tracking-widest mt-4">No sessions scheduled yet</p>
        </div>
      )}

      {sessions.map(session => {
        const isActive = activeSessionId === session.id;
        return (
          <motion.div key={session.id} variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-md">
            {/* Session Header */}
            <div className="p-5 border-b border-border bg-muted/10 flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">
                    {session.date.split(' ')[0]}
                  </span>
                  <span className="text-2xl font-black text-foreground leading-none">
                    {session.date.split(' ')[1]?.replace(',', '')}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg text-foreground">{session.date}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                      <Users size={12} className="text-primary" /> {session.presenters.length} presenter{session.presenters.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                      <MapPin size={12} className="text-secondary" /> Academic Boardroom
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className={`gap-2 h-11 px-8 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-md transition-all ${
                  isActive
                    ? "bg-status-warning/10 text-status-warning border border-status-warning/30 hover:bg-status-warning/20 shadow-none"
                    : "bg-primary text-white shadow-primary/20"
                }`}
                onClick={() => !isActive && handleStartSession(session.id, session.date)}
              >
                {isActive ? <><Clock size={16} className="animate-pulse" /> In Progress</> : <><PlayCircle size={16} /> Commence Session</>}
              </Button>
            </div>

            {/* Presenters List */}
            <div className="divide-y divide-border/30">
              {session.presenters.map((p: any, i: number) => {
                const isExpanded = expandedPresenter === p.id;
                const chosenDecision = selectedDecisions[p.id];

                return (
                  <div key={p.id} className="p-6 hover:bg-muted/5 transition-colors">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                      {/* Presenter Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[11px] font-black bg-background text-foreground px-3 py-1 rounded-lg border border-border font-mono shadow-sm">
                            {(i + 9).toString()}:00 AM
                          </span>
                          <h4 className="text-xl font-black text-foreground">
                            {p.student?.user?.first_name} {p.student?.user?.last_name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 ${
                              p.seminar_level?.includes('DEPT')
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-secondary/10 text-secondary border-secondary/20'
                            }`}
                          >
                            {p.seminar_level?.replace(/_/g, ' ')}
                          </Badge>
                        </div>

                        {p.student?.research_title && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <BookOpen size={14} className="text-primary shrink-0 mt-0.5" />
                            <p className="italic">"{p.student.research_title}"</p>
                          </div>
                        )}

                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          {p.student?.programme?.name} • {p.student?.registration_number}
                        </p>

                        {/* Action Buttons Row */}
                        <div className="flex items-center gap-4 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto text-[10px] font-black uppercase tracking-widest gap-2 text-secondary hover:bg-transparent hover:text-secondary"
                            onClick={() => toast.info("Thesis document viewer coming soon.")}
                          >
                            <FileText size={16} /> View Thesis Draft
                          </Button>
                          <div className="h-1 w-1 rounded-full bg-border" />
                          {/* Panel Assignment */}
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-muted-foreground" />
                            <select
                              className="text-[10px] font-black uppercase bg-transparent border-none outline-none text-muted-foreground hover:text-foreground cursor-pointer"
                              value={panelAssignMap[p.id] || ""}
                              onChange={e => handleAssignPanel(p.id, e.target.value)}
                            >
                              <option value="">Assign Panel Member...</option>
                              {Object.entries(panelNames).map(([id, name]) => (
                                <option key={id} value={id}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="h-1 w-1 rounded-full bg-border" />
                          <button
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-1"
                            onClick={() => setExpandedPresenter(isExpanded ? null : p.id)}
                          >
                            Notes {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        {/* Expanded feedback area */}
                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pre-session Notes</label>
                            <Textarea
                              placeholder="Record any notes before or during the presentation..."
                              className="min-h-[80px] rounded-xl text-sm"
                              value={feedbacks[p.id] || ""}
                              onChange={e => setFeedbacks(prev => ({ ...prev, [p.id]: e.target.value }))}
                            />
                          </div>
                        )}
                      </div>

                      {/* Record Decision Panel */}
                      <div className="w-full lg:w-72 shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              disabled={!isActive}
                              className="w-full h-12 bg-success hover:bg-success/90 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-success/20 disabled:shadow-none transition-all rounded-xl"
                            >
                              <ClipboardCheck size={16} className="mr-2" /> Record Verdict
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-3 text-xl font-black">
                                <ClipboardCheck className="text-primary" size={24} /> Panel Verdict
                              </DialogTitle>
                              <p className="text-xs text-muted-foreground">
                                For: <strong>{p.student?.user?.first_name} {p.student?.user?.last_name}</strong> — {p.seminar_level?.replace(/_/g, ' ')}
                              </p>
                            </DialogHeader>
                            <div className="space-y-5 py-4">
                              <p className="text-sm text-muted-foreground font-medium">
                                Select the panel's consensus. This is final and will advance or return the student's pipeline stage.
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                {DECISIONS.map((dec) => (
                                  <button
                                    key={dec.id}
                                    type="button"
                                    onClick={() => setSelectedDecisions(prev => ({ ...prev, [p.id]: dec.id }))}
                                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                                      chosenDecision === dec.id
                                        ? dec.colorClass
                                        : 'border-border hover:border-primary/30 bg-muted/5'
                                    }`}
                                  >
                                    <dec.icon size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-wider leading-tight">{dec.label}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                  <MessageSquare size={14} className="text-primary" /> Panel Observations
                                </label>
                                <Textarea
                                  value={feedbacks[p.id] || ""}
                                  onChange={e => setFeedbacks(prev => ({ ...prev, [p.id]: e.target.value }))}
                                  placeholder="Detail required revisions, commendations, or key observations..."
                                  className="min-h-[120px] bg-muted/20 rounded-xl text-sm resize-none"
                                />
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <Button variant="ghost" className="h-11 rounded-xl font-bold uppercase text-[10px]">Discard</Button>
                              <Button
                                className="bg-primary hover:bg-primary/90 text-white font-black h-11 px-8 rounded-xl uppercase text-[10px] tracking-widest shadow-lg"
                                disabled={!chosenDecision || processing}
                                onClick={() => recordDecision(p)}
                              >
                                {processing ? <Loader2 size={16} className="animate-spin" /> : "Commit Decision"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {chosenDecision && (
                          <p className="text-[10px] font-black text-center text-primary mt-2 uppercase tracking-widest">
                            ✓ {chosenDecision.replace(/_/g, ' ')} selected
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
