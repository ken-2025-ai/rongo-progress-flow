import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Search, AlertTriangle,
  ArrowRightCircle, CheckCircle2, Loader2, ChevronRight,
  UserCircle, Eye, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { STAGE_SEQUENCE } from "@/lib/pipeline";

const PIPELINE_STAGES = STAGE_SEQUENCE;

const stageColor = (stage: string) => {
  if (stage === 'COMPLETED') return 'bg-success/10 text-success border-success/20';
  if (stage?.includes('PENDING')) return 'bg-status-warning/10 text-status-warning border-status-warning/20';
  if (stage?.includes('BOOKED')) return 'bg-secondary/10 text-secondary border-secondary/20';
  if (stage?.includes('COMPLETED')) return 'bg-primary/10 text-primary border-primary/20';
  if (stage === 'CORRECTIONS') return 'bg-destructive/10 text-destructive border-destructive/20';
  return 'bg-muted text-muted-foreground border-border';
};

export function StudentProgressControl() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [advancing, setAdvancing] = useState<string | null>(null);
  const [reverting, setReverting] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => { fetchDepartmentRoster(); }, [user]);

  const fetchDepartmentRoster = async () => {
    setLoading(true);
    try {
      // Fetch all students then filter by dept on client side (avoids complex nested query syntax)
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department_id, department:department_id(name, id)),
          evaluations(id, recommendation, evaluation_type, created_at, comments)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      let filtered = data || [];
      if (user?.department_id) {
        filtered = filtered.filter((s: any) =>
          s.programme?.department_id === user.department_id ||
          s.programme?.department?.id === user.department_id
        );
      }

      setStudents(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load department roster.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (student: any) => {
    const currentIndex = PIPELINE_STAGES.indexOf(student.current_stage);
    if (currentIndex === -1 || currentIndex >= PIPELINE_STAGES.length - 1) {
      toast.error("Terminal Stage", { description: "Cannot advance beyond graduation." });
      return;
    }
    const nextStage = PIPELINE_STAGES[currentIndex + 1];
    const name = `${student.user?.first_name} ${student.user?.last_name}`;
    setAdvancing(student.id);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('students')
        .update({ current_stage: nextStage })
        .eq('id', student.id);
      if (error) throw error;

      toast.success("Stage Advanced", {
        description: `${name} → ${nextStage.replace(/_/g, ' ')}.`
      });
      fetchDepartmentRoster();
    } catch (err: any) {
      toast.error("Advance Failed", { description: err.message });
    } finally {
      setAdvancing(null);
    }
  };

  const handleRevert = async (student: any) => {
    const currentIndex = PIPELINE_STAGES.indexOf(student.current_stage);
    if (currentIndex <= 0) {
      toast.error("Already at first stage.");
      return;
    }
    const prevStage = PIPELINE_STAGES[currentIndex - 1];
    const name = `${student.user?.first_name} ${student.user?.last_name}`;
    setReverting(student.id);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('students')
        .update({ current_stage: prevStage })
        .eq('id', student.id);
      if (error) throw error;

      toast.warning("Stage Reverted", {
        description: `${name} reverted to ${prevStage.replace(/_/g, ' ')}.`
      });
      fetchDepartmentRoster();
    } catch (err: any) {
      toast.error("Revert Failed", { description: err.message });
    } finally {
      setReverting(null);
    }
  };

  const filteredStudents = students.filter(s =>
    `${s.user?.first_name} ${s.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.registration_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <GitBranch className="text-primary" size={28} /> Student Progress Control
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Manually control student pipeline stages within your department.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
          <Input
            placeholder="Search by name or reg. number..."
            className="pl-9 h-11 text-sm rounded-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", count: students.length, color: "text-primary", bg: "bg-primary/10" },
          { label: "In Progress", count: students.filter(s => !['COMPLETED', 'CORRECTIONS'].includes(s.current_stage)).length, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "In Corrections", count: students.filter(s => s.current_stage === 'CORRECTIONS').length, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Graduated", count: students.filter(s => s.current_stage === 'COMPLETED').length, color: "text-success", bg: "bg-success/10" },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants} className={`p-4 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg shadow-black/10 flex items-center gap-4 ${stat.bg}`}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
              <p className={`text-3xl font-black mt-0.5 ${stat.color}`}>{stat.count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Roster Table */}
      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-md">
        <div className="p-5 border-b border-border bg-muted/10 flex justify-between items-center">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <UserCircle size={14} /> Department Roster ({filteredStudents.length})
          </h3>
          <Badge variant="outline" className="font-bold text-[9px] uppercase bg-secondary/10 text-secondary border-secondary/20 px-3 py-1">
            {students.length} enrolled
          </Badge>
        </div>

        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Student</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Programme</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Current Stage</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Controls</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {filteredStudents.map((student) => (
                <TableRow key={student.id} className="group hover:bg-muted/20 transition-colors border-b border-border/40 last:border-0">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                        {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                      </div>
                      <div>
                        <span className="block font-black text-[15px] group-hover:text-primary transition-colors">
                          {student.user?.first_name} {student.user?.last_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{student.registration_number}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-background border-border/60">
                      {student.programme?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border inline-flex items-center gap-1.5 ${stageColor(student.current_stage)}`}>
                      <ChevronRight size={10} />
                      {student.current_stage?.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-5 px-6">
                    <div className="flex justify-end items-center gap-2">
                      {/* View Details */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-[10px] font-black uppercase rounded-xl border-border"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Eye size={14} className="mr-1" /> Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="font-black text-xl">
                              {student.user?.first_name} {student.user?.last_name}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="bg-muted/10 p-3 rounded-xl border border-border/40">
                                <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-1">Reg. Number</p>
                                <p className="font-black font-mono">{student.registration_number}</p>
                              </div>
                              <div className="bg-muted/10 p-3 rounded-xl border border-border/40">
                                <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-1">Programme</p>
                                <p className="font-black">{student.programme?.name || '—'}</p>
                              </div>
                              <div className="bg-muted/10 p-3 rounded-xl border border-border/40 col-span-2">
                                <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-1">Current Stage</p>
                                <p className="font-black">{student.current_stage?.replace(/_/g, ' ')}</p>
                              </div>
                              <div className="bg-muted/10 p-3 rounded-xl border border-border/40 col-span-2">
                                <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-1">Email</p>
                                <p className="font-mono text-xs">{student.user?.email || '—'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase text-muted-foreground/60 mb-2">Evaluation History</p>
                              {(student.evaluations || []).length === 0 ? (
                                <p className="text-xs text-muted-foreground italic">No evaluations recorded yet.</p>
                              ) : (
                                student.evaluations.slice(0, 5).map((ev: any) => (
                                  <div key={ev.id} className="text-xs p-2 bg-muted/10 rounded border border-border/30 mb-2">
                                    <span className="font-black">{ev.evaluation_type?.replace(/_/g, ' ')}</span> — {ev.recommendation}
                                    {ev.comments && <p className="text-muted-foreground mt-0.5 italic">"{ev.comments}"</p>}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Revert */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 text-[10px] font-black uppercase rounded-xl border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/30"
                        disabled={reverting === student.id || PIPELINE_STAGES.indexOf(student.current_stage) <= 0}
                        onClick={() => handleRevert(student)}
                      >
                        {reverting === student.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <RotateCcw size={14} />}
                      </Button>

                      {/* Advance */}
                      <Button
                        size="sm"
                        className="h-9 px-5 bg-secondary hover:bg-secondary/90 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md"
                        disabled={advancing === student.id || student.current_stage === 'COMPLETED'}
                        onClick={() => handleAdvance(student)}
                      >
                        {advancing === student.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <><ArrowRightCircle size={14} className="mr-1.5" /> Advance</>}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </AnimatePresence>
            {filteredStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-20 text-center opacity-40">
                  <p className="font-black text-xs uppercase tracking-widest">No students found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
