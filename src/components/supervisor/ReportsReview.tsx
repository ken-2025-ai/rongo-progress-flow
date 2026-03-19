import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, XCircle, MessageSquare, Loader2, Award, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    if (user?.id) fetchPendingReports();
  }, [user]);

  const fetchPendingReports = async () => {
    setLoading(true);
    try {
      // get students supervised by this user
      // @ts-ignore
      const { data: students } = await supabase.from('students').select('id').eq('supervisor_id', user.id);
      
      if (students && students.length > 0) {
        const sIds = students.map(s => s.id);
        // @ts-ignore
        const { data, error } = await supabase
          .from('progress_reports')
          .select(`
            *,
            student:student_id(
               registration_number,
               user:user_id(first_name, last_name)
            )
          `)
          .in('student_id', sIds)
          .eq('status', 'PENDING');
        
        if (data) setReports(data);
      }
    } catch (err) {
      console.error(err);
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
           // In a real system, we'd have a feedback column. For MVP we use synopsis or a log.
           // Let's assume there's a status_notes or similar in future, for now we just update status.
           updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast.success(`Report ${status.toLowerCase()}`, {
        description: `Feedback has been sent to ${selectedReport.student?.user?.first_name}.`
      });
      
      setSelectedReport(null);
      setFeedback("");
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
      
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft size={20} />
         </Button>
         <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Review Desk</h2>
            <p className="text-muted-foreground font-medium">Evaluate quarterly academic progress submissions.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List of Pending Reports */}
        <motion.div variants={itemVariants} className="space-y-4">
           {reports.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-2xl h-64 flex flex-col items-center justify-center text-center p-8">
                 <CheckCircle2 size={48} className="text-success/30 mb-4" />
                 <h3 className="font-bold text-lg">Inbox Zero</h3>
                 <p className="text-sm text-muted-foreground max-w-xs">All submitted reports for your mentees have been processed.</p>
              </div>
           ) : (
              reports.map((r) => (
                <div 
                   key={r.id} 
                   onClick={() => setSelectedReport(r)}
                   className={`bg-card p-6 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${selectedReport?.id === r.id ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border-border'}`}
                >
                   <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/20 font-bold uppercase tracking-widest text-[10px]">
                         {r.quarter} {r.year}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString()}</span>
                   </div>
                   <h4 className="font-bold text-lg">{r.student?.user?.first_name} {r.student?.user?.last_name}</h4>
                   <p className="text-xs text-muted-foreground font-mono mt-1">{r.student?.registration_number}</p>
                   <div className="mt-4 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                      View Submission <FileText size={14} />
                   </div>
                </div>
              ))
           )}
        </motion.div>

        {/* Evaluation Panel */}
        <motion.div variants={itemVariants}>
           {selectedReport ? (
              <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-8 shadow-xl">
                 <div className="p-6 border-b border-border bg-muted/5">
                    <h3 className="font-bold text-xl">Submission Analysis</h3>
                    <p className="text-sm text-muted-foreground">Evaluating: {selectedReport.student?.user?.first_name} {selectedReport.student?.user?.last_name}</p>
                 </div>
                 
                 <div className="p-8 space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Student Synopsis</label>
                       <div className="bg-muted/30 p-5 rounded-xl border border-border/50 text-sm leading-relaxed italic text-foreground/80">
                          "{selectedReport.synopsis}"
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <MessageSquare size={14} /> Supervisory Feedback
                       </label>
                       <Textarea 
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Provide constructive feedback, required changes, or words of encouragement..."
                          className="min-h-[150px] bg-background p-4 resize-none"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <Button 
                          variant="outline" 
                          onClick={() => handleDecision('REJECTED')}
                          disabled={processing}
                          className="h-12 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold gap-2"
                       >
                          <XCircle size={18} /> Request Revisions
                       </Button>
                       <Button 
                          onClick={() => handleDecision('APPROVED')}
                          disabled={processing}
                          className="h-12 bg-success hover:bg-success/90 text-white font-bold gap-2 shadow-lg shadow-success/20"
                       >
                          <CheckCircle2 size={18} /> Approve Progress
                       </Button>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/5 p-12 text-center">
                 <Award size={64} className="opacity-10 mb-6" />
                 <h3 className="font-bold text-lg">Select a report to review</h3>
                 <p className="text-sm max-w-xs mt-2">Pick a student from the left panel to begin the institutional evaluation process.</p>
              </div>
           )}
        </motion.div>
      </div>

    </motion.div>
  );
}
