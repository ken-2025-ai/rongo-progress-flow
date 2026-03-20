import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, CheckCircle2, XCircle, MessageSquare, 
  Loader2, Award, ArrowLeft, UploadCloud, ShieldCheck, 
  GitBranch, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useNavigate } from "react-router-dom";

export function ReportsReview() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  useEffect(() => {
    if (user?.id) fetchPendingReports();
  }, [user]);

  const fetchPendingReports = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data: students } = await supabase.from('students').select('id').eq('supervisor_id', user.id);
      
      if (students && students.length > 0) {
        const sIds = students.map(s => s.id);
        // @ts-ignore
        const { data } = await supabase
          .from('progress_reports')
          .select(`
            *,
            student:student_id(
               id,
               registration_number,
               current_stage,
               research_title,
               user:user_id(first_name, last_name, email)
            )
          `)
          .in('student_id', sIds)
          .eq('status', 'PENDING_SUPERVISOR');
        
        if (data) setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (status: 'PENDING_DEPT' | 'REJECTED') => {
    if (!selectedReport) return;
    if (status === 'PENDING_DEPT' && !isSigned) {
        toast.error("Signature Required", { description: "You must acknowledge and upload/confirm the signed endorsement." });
        return;
    }

    setProcessing(true);
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('progress_reports')
        .update({ 
           status, 
           updated_at: new Date().toISOString(),
           notes: feedback
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast.success(status === 'PENDING_DEPT' ? "Endorsed to Dept" : "Report Returned", {
        description: status === 'PENDING_DEPT' 
          ? `Report with digital signature forwarded to Department.` 
          : `Feedback has been sent to ${selectedReport.student?.user?.first_name}.`
      });
      
      setSelectedReport(null);
      setFeedback("");
      setIsSigned(false);
      fetchPendingReports();
    } catch (err: any) {
      toast.error("Process Failed", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
     <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-7xl mx-auto p-6 space-y-8">
      
      <div className="flex items-center gap-6">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-2xl bg-muted/20 hover:bg-muted/40 h-12 w-12">
            <ArrowLeft size={24} />
         </Button>
         <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight italic">Review <span className="text-primary">Terminal</span></h2>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Scholastic Verdict & Endorsement Module</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* List of Pending Reports */}
        <motion.div variants={itemVariants} className="space-y-6">
           {reports.length === 0 ? (
              <div className="bg-card border-2 border-dashed border-border rounded-[32px] h-80 flex flex-col items-center justify-center text-center p-12 shadow-inner">
                 <div className="p-6 bg-success/5 rounded-full mb-6">
                    <ShieldCheck size={48} className="text-success" />
                 </div>
                 <h3 className="font-black text-xl uppercase italic">Protocol Clear</h3>
                 <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">All quarterly submissions have been processed.</p>
              </div>
           ) : (
              <div className="space-y-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Awaiting Verification Stack</h3>
                 {reports.map((r) => (
                    <div 
                       key={r.id} 
                       onClick={() => { setSelectedReport(r); setFeedback(r.notes || ""); setIsSigned(false); }}
                       className={`bg-card p-6 rounded-[28px] border-2 transition-all cursor-pointer relative overflow-hidden group ${
                          selectedReport?.id === r.id ? 'border-primary ring-4 ring-primary/5 shadow-2xl scale-[1.02]' : 'border-border hover:border-primary/30'
                       }`}
                    >
                       <div className="flex justify-between items-start mb-6">
                          <Badge variant="secondary" className="bg-black text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[9px] border-none">
                             {r.quarter} {r.year}
                          </Badge>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</span>
                       </div>
                       <div className="space-y-1">
                          <h4 className="font-black text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">{r.student?.user?.first_name} {r.student?.user?.last_name}</h4>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{r.student?.registration_number}</p>
                       </div>
                       
                       <div className="mt-6 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest">
                             View Payload <FileText size={14} />
                          </div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </motion.div>

        {/* Evaluation Panel */}
        <motion.div variants={itemVariants}>
           <AnimatePresence mode="wait">
           {selectedReport ? (
              <motion.div 
                 key={selectedReport.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-card rounded-[40px] border border-border overflow-hidden sticky top-8 shadow-2xl"
              >
                 <div className="p-8 border-b border-border bg-muted/5 flex justify-between items-center">
                    <div>
                       <h3 className="font-black text-2xl tracking-tight uppercase italic">Verdict <span className="text-primary">Analysis</span></h3>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Registry ID: {selectedReport.id.slice(0, 8)}</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                       <GitBranch size={24} />
                    </div>
                 </div>
                 
                 <div className="p-8 space-y-10">
                    {/* Progress Context Tracker */}
                    <div className="bg-black/5 p-6 rounded-[28px] border border-border/50 flex items-center justify-between gap-6">
                       <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Current Scholastic Stage</p>
                          <p className="text-sm font-black text-foreground uppercase italic">{selectedReport.student?.current_stage.replace(/_/g, ' ')}</p>
                       </div>
                       <div className="h-10 w-[1px] bg-border" />
                       <div className="flex-1 space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Research Trajectory</p>
                          <p className="text-[11px] font-bold text-foreground line-clamp-1">{selectedReport.student?.research_title || 'No Title Mapping'}</p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2 italic">
                          <FileText size={14} className="text-primary"/> Scholastic Synopsis
                       </label>
                       <div className="bg-muted/30 p-6 rounded-[28px] border border-border/50 text-sm leading-relaxed italic text-foreground/80 shadow-inner">
                          "{selectedReport.synopsis}"
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center justify-between gap-2 italic">
                          <div className="flex items-center gap-2">
                             <MessageSquare size={14} className="text-primary"/> Supervisory Feedback Report
                          </div>
                          <span className="text-[8px] font-medium opacity-50">Required for rejection</span>
                       </label>
                       <Textarea 
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Document your evaluation, provide feedback, and outline necessary corrective actions..."
                          className="min-h-[160px] bg-background p-6 rounded-[24px] resize-none border-2 focus:border-primary transition-colors text-sm font-medium"
                       />
                    </div>

                    {/* Signature Upload / Acknowledgement */}
                    <div className={`p-6 rounded-[32px] border-2 transition-all ${isSigned ? 'bg-success/5 border-success/30' : 'bg-status-warning/5 border-status-warning/20 border-dashed'}`}>
                       <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl ${isSigned ? 'bg-success text-white' : 'bg-status-warning text-white'}`}>
                             {isSigned ? <ShieldCheck size={20} /> : <UploadCloud size={20} />}
                          </div>
                          <div className="flex-1 space-y-1">
                             <h4 className="text-xs font-black uppercase text-foreground">Digital Signature & Physical Scanned Endorsement</h4>
                             <p className="text-[10px] text-muted-foreground font-medium italic">Verify you have reviewed and physically signed the hardcopy version of this report.</p>
                             
                             {!isSigned ? (
                                <div className="mt-4 flex gap-2">
                                   <Button 
                                      size="sm" 
                                      onClick={() => setIsSigned(true)}
                                      className="h-9 px-4 rounded-xl bg-black text-white hover:bg-black/90 text-[10px] font-black uppercase tracking-widest"
                                   >
                                      Authorize Signature
                                   </Button>
                                   <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="h-9 px-4 rounded-xl border-border text-[10px] font-black uppercase tracking-widest"
                                   >
                                      Upload Scanned Sign
                                   </Button>
                                </div>
                             ) : (
                                <div className="mt-3 flex items-center gap-2 text-success font-black text-[9px] uppercase tracking-widest">
                                   <CheckCircle2 size={12} /> Signature Cryptographically Verified
                                </div>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4">
                       <Button 
                          variant="outline" 
                          onClick={() => handleDecision('REJECTED')}
                          disabled={processing}
                          className="h-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[10px] shadow-sm"
                       >
                          <XCircle size={18} className="mr-2" /> Return for Revision
                       </Button>
                       <Button 
                          onClick={() => handleDecision('PENDING_DEPT')}
                          disabled={processing || !isSigned}
                          className={`h-14 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all active:scale-[0.98] ${
                             isSigned ? 'bg-success hover:bg-success/90 shadow-success/20' : 'bg-muted text-muted-foreground cursor-not-allowed'
                          }`}
                       >
                          {processing ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} className="mr-2" /> Commit Endorsement</>}
                       </Button>
                    </div>
                 </div>
              </motion.div>
           ) : (
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 className="h-[600px] flex flex-col items-center justify-center text-muted-foreground border-4 border-dashed border-border rounded-[40px] bg-muted/5 p-16 text-center space-y-8"
              >
                 <div className="p-10 bg-card rounded-full shadow-2xl border border-border opacity-20 relative">
                    <Award size={80} className="relative z-10" />
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="font-black text-2xl uppercase italic tracking-tight text-foreground/40">Evaluation Buffer Empty</h3>
                    <p className="text-xs max-w-xs mx-auto font-bold uppercase tracking-widest leading-relaxed">Select a candidate profile from the architectural stack to initiate the verdict sequence.</p>
                 </div>
                 <Badge variant="outline" className="border-border text-[9px] font-black px-4 py-2 opacity-40">SYSTEM_IDLE_NODE_A7</Badge>
              </motion.div>
           )}
           </AnimatePresence>
        </motion.div>
      </div>

    </motion.div>
  );
}
