import { motion } from "framer-motion";
import { ClipboardCheck, Search, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

const OUTCOMES = [
  { value: "PASS", label: "Pass (No Corrections)", icon: CheckCircle2, color: "text-success", bg: "bg-success/10 border-success/20" },
  { value: "MINOR_CORRECTIONS", label: "Minor Corrections", icon: AlertTriangle, color: "text-status-warning", bg: "bg-status-warning/10 border-status-warning/20" },
  { value: "MAJOR_CORRECTIONS", label: "Major Corrections", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  { value: "FAIL", label: "Fail", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
];

export function ExaminationDecisions() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          evaluations(id, recommendation, evaluation_type, created_at, comments)
        `)
        .in('current_stage', ['VIVA_SCHEDULED', 'PG_EXAMINATION']);

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load examination decisions.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (candidate: any) => {
    if (!selectedOutcome) {
      toast.error("Select an outcome before saving.");
      return;
    }
    setSaving(true);
    try {
      // 1. Record viva evaluation
      // @ts-ignore
      const { error: evalErr } = await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: selectedOutcome,
        comments: notes
      });
      if (evalErr) throw evalErr;

      // 2. Advance student stage
      const nextStage = selectedOutcome === 'PASS' ? 'COMPLETED' : 'CORRECTIONS';
      // @ts-ignore
      const { error: stageErr } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', candidate.id);
      if (stageErr) throw stageErr;

      toast.success("Viva Decision Recorded", {
        description: `${candidate.user?.first_name} ${candidate.user?.last_name} — ${selectedOutcome.replace(/_/g, ' ')}. Stage updated.`
      });
      setSelectedOutcome("");
      setNotes("");
      fetchCandidates();
    } catch (err: any) {
      toast.error("Decision Failed", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const filtered = candidates.filter(c =>
    `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-80 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <ClipboardCheck className="text-primary" /> Examination Decisions
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Record final Viva-Voce outcomes and advance candidates through the pipeline.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search candidate..." className="pl-9 h-10 text-sm rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground opacity-50">
          <ClipboardCheck size={48} className="mb-4" />
          <p className="font-black text-xs uppercase tracking-widest">No candidates in active viva queue</p>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/10 flex justify-between">
            <h3 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Active Viva Queue</h3>
            <Badge className="bg-primary/10 text-primary border-primary/20">{filtered.length} pending</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-black">Candidate</TableHead>
                <TableHead className="font-black">Thesis</TableHead>
                <TableHead className="font-black">Previous Evaluations</TableHead>
                <TableHead className="text-right font-black">Final Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(candidate => {
                const vivaEvals = (candidate.evaluations || []).filter((e: any) => e.evaluation_type === 'VIVA');
                return (
                  <TableRow key={candidate.id} className="hover:bg-muted/5">
                    <TableCell className="align-top pt-5">
                      <span className="block font-black text-base">{candidate.user?.first_name} {candidate.user?.last_name}</span>
                      <Badge variant="outline" className="text-[9px] uppercase mt-1.5">{candidate.programme?.department?.name}</Badge>
                    </TableCell>
                    <TableCell className="align-top pt-5 max-w-xs">
                      <p className="font-semibold text-sm truncate">{candidate.research_title || 'Title pending'}</p>
                      <p className="text-xs text-muted-foreground">{candidate.programme?.name}</p>
                    </TableCell>
                    <TableCell className="align-top pt-5">
                      <div className="space-y-1">
                        {vivaEvals.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">No viva records yet</span>
                        ) : (
                          vivaEvals.slice(-2).map((ev: any) => (
                            <Badge key={ev.id} variant="outline" className="text-[9px] block w-fit">
                              {ev.recommendation?.replace(/_/g, ' ')}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right align-top pt-5">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" className="h-8 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                            Record Viva Decision
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-black text-xl">Final Viva Decision</DialogTitle>
                            <p className="text-xs text-muted-foreground">For: <strong>{candidate.user?.first_name} {candidate.user?.last_name}</strong></p>
                          </DialogHeader>
                          <div className="space-y-5 py-4">
                            <div className="grid grid-cols-2 gap-3">
                              {OUTCOMES.map(o => (
                                <button
                                  key={o.value}
                                  type="button"
                                  onClick={() => setSelectedOutcome(o.value)}
                                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${selectedOutcome === o.value ? `${o.bg} border-opacity-100` : 'border-border hover:border-primary/30 bg-muted/5'}`}
                                >
                                  <o.icon size={16} className={selectedOutcome === o.value ? o.color : 'text-muted-foreground'} />
                                  <span className={`text-[10px] font-black uppercase tracking-wider leading-tight ${selectedOutcome === o.value ? o.color : 'text-muted-foreground'}`}>{o.label}</span>
                                </button>
                              ))}
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase text-muted-foreground">Panel Notes</label>
                              <Textarea
                                placeholder="Summarize the panel's findings, corrections required, or commendations..."
                                className="min-h-[100px] rounded-xl"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              className="bg-primary text-white font-black text-[10px] uppercase h-11 px-8 rounded-xl"
                              disabled={saving || !selectedOutcome}
                              onClick={() => handleDecision(candidate)}
                            >
                              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save & Advance Pipeline"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </motion.div>
  );
}
