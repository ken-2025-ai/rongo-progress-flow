import { motion } from "framer-motion";
import {
  UserCheck, Search, Loader2, Plus, Mail, Phone, BookOpen, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function ExaminerAssignment() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [examiners, setExaminers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data: students, error: sErr } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name))
        `)
        .in('current_stage', ['VIVA_SCHEDULED', 'PG_EXAMINATION']);

      if (sErr) throw sErr;

      // Fetch available examiners (EXAMINER role users)
      // @ts-ignore
      const { data: examinerData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'EXAMINER');

      setCandidates(students || []);
      setExaminers(examinerData || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load examiner assignment data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (examinerId: string, examinerName: string) => {
    if (!selectedCandidate) return;
    setAssigning(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('evaluations')
        .insert({
          student_id: selectedCandidate.id,
          evaluator_id: examinerId,
          evaluation_type: 'VIVA',
          recommendation: 'PASS', // placeholder until viva is done
          comments: `Examiner assigned by Dean: ${user?.name}`
        });

      if (error) throw error;

      toast.success("Examiner Assigned", {
        description: `${examinerName} assigned to ${selectedCandidate.user?.first_name}'s thesis.`
      });
      setSelectedCandidate(null);
      fetchData();
    } catch (err: any) {
      toast.error("Assignment Failed", { description: err.message });
    } finally {
      setAssigning(false);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <UserCheck className="text-secondary" /> Examiner Assignment
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Assign qualified external/internal examiners to thesis candidates.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search candidate..."
            className="pl-9 h-10 text-sm rounded-xl"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Pipeline Grid */}
      <div className="grid gap-5">
        {filtered.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground opacity-50">
            <UserCheck size={48} className="mb-4" />
            <p className="font-black text-xs uppercase tracking-widest">No candidates in this pipeline</p>
          </div>
        )}

        {filtered.map(candidate => (
          <motion.div key={candidate.id} variants={itemVariants} className="bg-card rounded-2xl border border-border/60 shadow-md overflow-hidden hover:shadow-lg transition-all">
            <div className="p-6 flex flex-col lg:flex-row justify-between gap-6">
              {/* Candidate Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-black">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                  <Badge variant="outline" className="text-[9px] uppercase tracking-widest">{candidate.programme?.department?.name}</Badge>
                  <Badge className={`text-[9px] font-black uppercase ${candidate.current_stage === 'VIVA_SCHEDULED' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {candidate.current_stage?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen size={14} className="text-primary shrink-0" />
                  <p className="italic truncate max-w-lg">"{candidate.research_title || 'Thesis title pending'}"</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-mono font-bold">{candidate.registration_number}</span>
                  <span>•</span>
                  <span>{candidate.programme?.name}</span>
                </div>
              </div>

              {/* Assign Action */}
              <div className="shrink-0 flex flex-col gap-3 w-full lg:w-48">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="h-12 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <Plus size={16} className="mr-2" /> Assign Examiner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="font-black text-xl">Assign Examiner</DialogTitle>
                      <p className="text-xs text-muted-foreground">
                        Assigning to: <strong>{candidate.user?.first_name} {candidate.user?.last_name}</strong>
                      </p>
                    </DialogHeader>
                    <div className="space-y-3 py-4 max-h-80 overflow-y-auto">
                      {examiners.length === 0 ? (
                        <div className="text-center text-xs text-muted-foreground py-12 opacity-60">
                          No examiners registered in the system yet.
                          <br />Add staff with EXAMINER role via the Super Admin panel.
                        </div>
                      ) : (
                        examiners.map(ex => (
                          <div key={ex.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                            <div>
                              <p className="font-black text-sm">{ex.first_name} {ex.last_name}</p>
                              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{ex.email}</p>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase rounded-lg transition-all"
                              disabled={assigning}
                              onClick={() => handleAssign(ex.id, `${ex.first_name} ${ex.last_name}`)}
                            >
                              Assign
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" className="text-[10px] font-black uppercase">Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
