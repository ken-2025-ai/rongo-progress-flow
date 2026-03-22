import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, XCircle, MessageSquare, Loader2, Award, FileBarChart, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { containerVariants, itemVariants } from "@/lib/animations";

export function ProgressReportsReview() {
  const { user } = useRole();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.department_id) fetchDepartmentalReports();
  }, [user]);

  const fetchDepartmentalReports = async () => {
    setLoading(true);
    try {
      // 1. Get student IDs in this department
      // @ts-ignore
      const { data: deptStudents } = await supabase
        .from('students')
        .select('id')
        .eq('programme!inner(department_id)', user.department_id);
      
      const sIds = (deptStudents || []).map(s => s.id);
      if (sIds.length === 0) {
        setReports([]);
        return;
      }

      // 2. Fetch reports pending departmental review
      // @ts-ignore
      const { data } = await supabase
        .from('progress_reports')
        .select(`
          *,
          student:student_id(
            registration_number,
            user:user_id(first_name, last_name),
            programme:programme_id(name)
          )
        `)
        .in('student_id', sIds)
        .eq('status', 'PENDING_DEPT');
      
      setReports(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Resource Sync Failure");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedReport) return;
    setProcessing(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('progress_reports')
        .update({ 
           status, 
           updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast.success(status === 'APPROVED' ? "Architectural Clearance Granted" : "Report Protocol Reverted", {
        description: `Feedback has been locked for ${selectedReport.student?.user?.first_name}.`
      });
      
      setSelectedReport(null);
      setFeedback("");
      fetchDepartmentalReports();
    } catch (err: any) {
      toast.error("Administrative Sync Failed", { description: err.message });
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
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-6 space-y-8 max-w-7xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card/60 backdrop-blur-md p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none scale-[2]">
           <FileBarChart size={120} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
            <FileBarChart className="text-primary" size={28} />
            Departmental Endorsement Desk
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium max-w-xl">
            Confirming quarterly academic milestones validated by primary supervisors. Final departmental clearance for student progression.
          </p>
        </div>
        <div className="relative w-full md:w-80 z-10">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
           <Input 
             placeholder="Search candidates..." 
             className="pl-9 h-12 text-sm rounded-2xl bg-background border-border shadow-inner"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* List of Pending Reports */}
        <motion.div variants={itemVariants} className="space-y-4">
           {reports.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl h-80 flex flex-col items-center justify-center text-center p-12 shadow-sm">
                 <div className="p-6 bg-success/10 rounded-full mb-6 text-success/40">
                    <CheckCircle2 size={48} />
                 </div>
                 <h3 className="font-black text-xl uppercase tracking-widest">Protocol Clear</h3>
                 <p className="text-sm text-muted-foreground max-w-xs mt-3 leading-relaxed">No pending quarterly reports require departmental endorsement at this time.</p>
              </div>
           ) : (
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">Awaiting Architectural Sanction ({reports.length})</h3>
                 <AnimatePresence>
                 {reports
                   .filter(r => `${r.student?.user?.first_name} ${r.student?.user?.last_name} ${r.student?.registration_number}`.toLowerCase().includes(searchTerm.toLowerCase()))
                   .map((r) => (
                   <motion.div 
                      layout
                      key={r.id} 
                      onClick={() => setSelectedReport(r)}
                      className={`group bg-card p-6 rounded-2xl border transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 ${selectedReport?.id === r.id ? 'border-primary ring-4 ring-primary/10 shadow-2xl bg-primary/[0.02]' : 'border-border/50 shadow-sm'}`}
                   >
                      <div className="flex justify-between items-start mb-4">
                         <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-lg">
                            {r.quarter} {r.year}
                         </Badge>
                         <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest font-mono">{new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h4 className="font-black text-xl text-foreground group-hover:text-primary transition-colors">{r.student?.user?.first_name} {r.student?.user?.last_name}</h4>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-[10px] font-black font-mono text-muted-foreground uppercase opacity-70 tracking-tighter">{r.student?.registration_number}</p>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">{r.student?.programme?.name}</p>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                         <span className="flex items-center gap-1.5 text-[9px] font-black text-success uppercase tracking-widest">
                           <CheckCircle2 size={12} /> SPV Endorsed
                         </span>
                         <span className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                           Open Dossier <FileText size={12} />
                         </span>
                      </div>
                   </motion.div>
                 ))}
                 </AnimatePresence>
              </div>
           )}
        </motion.div>

        {/* Evaluation Panel */}
        <motion.div variants={itemVariants} className="sticky top-8">
           {selectedReport ? (
              <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-2xl">
                 <div className="p-8 border-b border-border bg-muted/10">
                    <div className="flex justify-between items-start mb-4">
                       <Badge className="font-black uppercase tracking-widest text-[9px] bg-status-warning/10 text-status-warning border-status-warning/20 px-3 py-1">Departmental Vetting</Badge>
                       <Button variant="ghost" size="sm" className="h-8 text-[9px] font-black uppercase tracking-widest" onClick={() => setSelectedReport(null)}>Close</Button>
                    </div>
                    <h3 className="font-black text-2xl tracking-tight">Quarterly Dossier Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1 font-medium italic">Architectural Validation for {selectedReport.student?.user?.first_name} {selectedReport.student?.user?.last_name}</p>
                 </div>
                 
                 <div className="p-8 space-y-8">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                             Student Work-Synopsis
                          </label>
                          <Info size={14} className="text-muted-foreground/40" />
                       </div>
                       <div className="bg-muted/30 p-6 rounded-2xl border border-border/40 text-sm leading-relaxed text-foreground/80 font-medium">
                          "{selectedReport.synopsis}"
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                          <MessageSquare size={14} /> Coordinator Review Remarks
                       </label>
                       <Textarea 
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Note any departmental observations or required corrections..."
                          className="min-h-[160px] bg-background p-6 resize-none border-border/60 focus:ring-primary/20 rounded-2xl shadow-inner text-sm font-medium"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <Button 
                          variant="outline" 
                          onClick={() => handleDecision('REJECTED')}
                          disabled={processing}
                          className="h-14 border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                       >
                          <XCircle size={18} className="mr-2" /> Revoke Clearance
                       </Button>
                       <Button 
                          onClick={() => handleDecision('APPROVED')}
                          disabled={processing}
                          className="h-14 bg-success hover:bg-success/90 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-success/20 transition-all active:scale-[0.98]"
                       >
                          <CheckCircle2 size={18} className="mr-2" /> Endorse Progression
                       </Button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-[2.5rem] bg-muted/5 p-16 text-center shadow-inner">
                 <div className="p-8 bg-card rounded-full border border-border/50 shadow-sm mb-8 opacity-40">
                    <Award size={64} className="text-primary" />
                 </div>
                 <h3 className="font-black text-xl uppercase tracking-widest text-foreground/60">Dossier Selection Required</h3>
                 <p className="text-sm max-w-xs mt-4 font-medium leading-relaxed">Please select a candidate submission from the structural queue to begin the departmental endorsement protocol.</p>
              </div>
           )}
        </motion.div>
      </div>
    </motion.div>
  );
}
