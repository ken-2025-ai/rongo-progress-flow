import { motion } from "framer-motion";
import {
  Sparkles, Search, Loader2, GraduationCap, CheckCircle2,
  Trophy, Download, Calendar, Star
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

export function FinalClearance() {
  const { user } = useRole();
  const [graduates, setGraduates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchGraduates(); }, []);

  const fetchGraduates = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, code, department:department_id(name, school:school_id(name))),
          evaluations(id, recommendation, evaluation_type, created_at)
        `)
        .in('current_stage', ['CORRECTIONS', 'COMPLETED'])
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setGraduates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load graduation pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const handleGraduationClearance = async (candidate: any) => {
    setProcessing(true);
    try {
      // Mark as fully COMPLETED with graduation clearance
      // @ts-ignore
      const { error: stageErr } = await supabase
        .from('students')
        .update({ current_stage: 'COMPLETED' })
        .eq('id', candidate.id);
      if (stageErr) throw stageErr;

      // Record the final clearance evaluation
      // @ts-ignore
      await supabase.from('evaluations').insert({
        student_id: candidate.id,
        evaluator_id: user?.id,
        evaluation_type: 'VIVA',
        recommendation: 'PASS',
        comments: `Final graduation clearance granted by PG Dean on ${new Date().toLocaleDateString()}.`
      });

      toast.success("🎓 Graduation Clearance Granted!", {
        description: `${candidate.user?.first_name} ${candidate.user?.last_name} has been officially cleared for graduation.`,
        duration: 6000
      });
      fetchGraduates();
    } catch (err: any) {
      toast.error("Clearance Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadCertificate = (candidate: any) => {
    toast.info("Generating Transcript...", {
      description: `Clearance certificate for ${candidate.user?.first_name} is being prepared.`
    });
  };

  const filtered = graduates.filter(g =>
    `${g.user?.first_name} ${g.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.programme?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const completedCount = graduates.filter(g => g.current_stage === 'COMPLETED').length;
  const correctionsCount = graduates.filter(g => g.current_stage === 'CORRECTIONS').length;

  if (loading) return (
    <div className="h-80 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="absolute -top-8 -right-8 opacity-[0.04]">
          <GraduationCap size={180} />
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
              <Sparkles className="text-secondary" size={24} /> Final Clearance & Graduation
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium max-w-lg">
              Grant official graduation clearances to candidates who have completed the full postgraduate pipeline.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input placeholder="Search graduate..." className="pl-9 h-10 text-sm rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "In Corrections", count: correctionsCount, color: "text-status-warning", bg: "bg-status-warning/10 border-status-warning/20", icon: Star },
          { label: "Cleared for Graduation", count: completedCount, color: "text-success", bg: "bg-success/10 border-success/20", icon: CheckCircle2 },
          { label: "Total in Pipeline", count: graduates.length, color: "text-primary", bg: "bg-primary/10 border-primary/20", icon: GraduationCap },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants} className={`p-5 rounded-2xl border ${stat.bg} flex items-center gap-5`}>
            <div className={`h-12 w-12 rounded-xl bg-background border border-border/30 flex items-center justify-center`}>
              <stat.icon size={22} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
              <p className={`text-3xl font-black mt-0.5 ${stat.color}`}>{stat.count}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Graduate Roster */}
      <div className="grid gap-5">
        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground opacity-50">
            <Trophy size={48} className="mb-4" />
            <p className="font-black text-xs uppercase tracking-widest">No candidates in graduation pipeline yet</p>
          </div>
        ) : (
          filtered.map(candidate => {
            const isCompleted = candidate.current_stage === 'COMPLETED';
            const vivaEval = candidate.evaluations?.find((e: any) => e.evaluation_type === 'VIVA' && e.recommendation === 'PASS');

            return (
              <motion.div
                key={candidate.id}
                variants={itemVariants}
                className={`bg-card rounded-2xl border shadow-md overflow-hidden transition-all hover:shadow-xl ${isCompleted ? 'border-success/30' : 'border-border/60'}`}
              >
                {isCompleted && <div className="h-1 bg-gradient-to-r from-success via-secondary to-primary" />}
                <div className="p-6 flex flex-col xl:flex-row justify-between gap-6">
                  {/* Candidate Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-black">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                      <Badge
                        className={`text-[9px] font-black uppercase ${isCompleted ? 'bg-success/10 text-success border-success/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'}`}
                      >
                        {isCompleted ? "✓ Graduated" : "In Corrections"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/10 p-4 rounded-xl border border-border/40">
                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-2">Academic Details</p>
                        <p className="text-sm font-bold">{candidate.programme?.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.programme?.department?.name} • {candidate.programme?.department?.school?.name}</p>
                        <p className="text-xs font-mono text-muted-foreground mt-1">{candidate.registration_number}</p>
                      </div>
                      <div className="bg-muted/10 p-4 rounded-xl border border-border/40">
                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 mb-2">Thesis Title</p>
                        <p className="text-sm font-bold leading-snug italic">"{candidate.research_title || 'Title not set'}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="w-full xl:w-56 flex flex-col gap-3 justify-center">
                    {isCompleted ? (
                      <>
                        <div className="flex items-center gap-2 justify-center text-success font-black text-xs uppercase tracking-widest">
                          <CheckCircle2 size={18} /> Graduation Cleared
                        </div>
                        <Button
                          variant="outline"
                          className="w-full h-11 border-success/30 text-success hover:bg-success/5 font-black uppercase text-[10px] tracking-widest rounded-xl"
                          onClick={() => handleDownloadCertificate(candidate)}
                        >
                          <Download size={16} className="mr-2" /> Download Cert
                        </Button>
                      </>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full h-12 bg-gradient-to-r from-secondary to-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg">
                            <Sparkles size={16} className="mr-2" /> Grant Clearance
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md">
                          <DialogHeader>
                            <DialogTitle className="font-black text-2xl flex items-center gap-3">
                              <GraduationCap className="text-secondary" size={28} /> Confirm Graduation Clearance
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-6 space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              You are officially granting graduation clearance to{" "}
                              <strong className="text-foreground">{candidate.user?.first_name} {candidate.user?.last_name}</strong>.
                              This is the final administrative action in the postgraduate academic pipeline.
                            </p>
                            <div className="bg-success/10 p-4 rounded-xl border border-success/20 text-xs font-bold text-success flex items-start gap-2">
                              <Trophy size={16} className="shrink-0 mt-0.5" />
                              The student's academic status will be updated to COMPLETED and a clearance record will be created.
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              className="bg-gradient-to-r from-secondary to-primary text-white font-black text-[10px] uppercase h-11 px-10 rounded-xl shadow-lg"
                              disabled={processing}
                              onClick={() => handleGraduationClearance(candidate)}
                            >
                              {processing ? <Loader2 size={16} className="animate-spin" /> : "🎓 Confirm & Clear"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
