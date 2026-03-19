import { motion } from "framer-motion";
import { Users, Search, ShieldCheck, FileCheck, Loader2, ArrowUpRight, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function CandidatesReady() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [returnNote, setReturnNote] = useState("");
  const [processing, setProcessing] = useState(false);

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
          evaluations(id, recommendation, evaluation_type, created_at)
        `)
        .eq('current_stage', 'PG_EXAMINATION');

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load examination queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (candidate: any) => {
    setProcessing(true);
    try {
      // @ts-ignore
      const { error: sErr } = await supabase
        .from('students')
        .update({ current_stage: 'VIVA_SCHEDULED' })
        .eq('id', candidate.id);
      if (sErr) throw sErr;

      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: 'PASS',
        comments: 'Approved for external examination by Dean.'
      });

      toast.success(`${candidate.user?.first_name} approved`, {
        description: "Student moved to Viva Scheduling pipeline."
      });
      fetchCandidates();
    } catch (err: any) {
      toast.error("Approval Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleReturn = async (candidate: any) => {
    if (!returnNote.trim()) {
      toast.error("Enter deficiency notes before returning.");
      return;
    }
    setProcessing(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('students')
        .update({ current_stage: 'THESIS_READINESS_CHECK' })
        .eq('id', candidate.id);
      if (error) throw error;

      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: 'MAJOR_CORRECTIONS',
        comments: returnNote
      });

      toast.error(`${candidate.user?.first_name} returned`, {
        description: "Candidate reverted to Thesis Readiness Check."
      });
      setReturnNote("");
      fetchCandidates();
    } catch (err: any) {
      toast.error("Return Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const filtered = candidates.filter(c =>
    `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.programme?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
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
            <ShieldCheck className="text-primary" /> Candidates Ready for Examination
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Students cleared by School level and awaiting Dean approval for external examination.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search candidate or programme..."
            className="pl-9 h-10 text-sm rounded-xl bg-muted/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground opacity-50">
          <ShieldCheck size={48} className="mb-4" />
          <p className="font-black text-xs uppercase tracking-widest">No candidates awaiting examination approval</p>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
          <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground">Examination Gateway</h3>
            <Badge className="bg-primary/10 text-primary border-primary/20">{filtered.length} candidates</Badge>
          </div>
          <Table>
            <TableHeader className="bg-background">
              <TableRow>
                <TableHead className="font-black">Candidate</TableHead>
                <TableHead className="font-black">Programme & Thesis</TableHead>
                <TableHead className="font-black">School Verdict</TableHead>
                <TableHead className="text-right font-black">Dean Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((candidate) => {
                const latestEval = candidate.evaluations?.slice(-1)[0];
                return (
                  <TableRow key={candidate.id} className="hover:bg-muted/5">
                    <TableCell className="font-medium align-top pt-5">
                      <div>
                        <span className="block font-black text-base">{candidate.user?.first_name} {candidate.user?.last_name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider mt-1.5 bg-muted/30">
                          {candidate.programme?.department?.name}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">{candidate.registration_number}</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top pt-5">
                      <div className="flex flex-col gap-1 text-sm max-w-xs">
                        <span className="font-bold text-foreground truncate" title={candidate.research_title}>
                          {candidate.research_title || "Title Not Finalized"}
                        </span>
                        <span className="text-xs text-muted-foreground">{candidate.programme?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="align-top pt-5">
                      <Badge variant="default" className="bg-success/10 text-success border-success/20 gap-1 text-[10px] font-bold">
                        <ShieldCheck size={12} /> {latestEval?.recommendation || "School Cleared"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right align-top pt-5">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase border-destructive/30 text-destructive hover:bg-destructive/10">
                              <XCircle size={14} className="mr-1" /> Return
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-2xl">
                            <DialogHeader>
                              <DialogTitle className="font-black">Return to School Level</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <p className="text-xs text-muted-foreground">Specify PG School deficiencies that must be resolved before examination clearance.</p>
                              <Textarea
                                placeholder="Describe missing documents, formatting issues, or procedural gaps..."
                                value={returnNote}
                                onChange={e => setReturnNote(e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="destructive" disabled={processing} onClick={() => handleReturn(candidate)}>
                                Return to School
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          className="h-8 bg-success hover:bg-success/90 text-white text-[10px] font-black uppercase gap-1 shadow-md"
                          disabled={processing}
                          onClick={() => handleApprove(candidate)}
                        >
                          <ArrowUpRight size={14} /> Approve for Exam
                        </Button>
                      </div>
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
