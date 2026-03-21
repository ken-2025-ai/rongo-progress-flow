import { motion } from "framer-motion";
import { Upload, FileText, History, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function SubmitThesis() {
  const { user, isLoading: authLoading } = useRole();
  const [student, setStudent] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [submissionLevel, setSubmissionLevel] = useState("DEPARTMENTAL");

  useEffect(() => {
    if (!authLoading) {
      if (user?.id) fetchStudentAndSubmissions();
      else setLoading(false);
    }
  }, [user, authLoading]);

  const fetchStudentAndSubmissions = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data: sData } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle();
      if (sData) {
        setStudent(sData);
        // @ts-ignore
        const { data: subData } = await supabase
          .from('thesis_submissions')
          .select('*')
          .eq('student_id', sData.id)
          .order('created_at', { ascending: false });
        setSubmissions(subData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    if (file.type !== 'application/pdf') {
      toast.error("Format Error", { description: "Institutional standard requires PDF format." });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `${student.id}/${Date.now()}_${file.name}`;
      // @ts-ignore
      const { data, error: uploadError } = await supabase.storage
        .from('thesis_payloads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const versionNumber = (submissions.length || 0) + 1;
      const { data: urlData } = supabase.storage.from('thesis_payloads').getPublicUrl(data.path);
      const fileUrl = urlData?.publicUrl ?? '';

      // @ts-ignore
      const { error: dbError } = await supabase.from('thesis_submissions').insert({
        student_id: student.id,
        version_number: versionNumber,
        file_url: fileUrl,
        submitted_by: user?.id ?? undefined,
      });

      if (dbError) throw dbError;

      toast.success("Thesis Payload Synchronized", {
        description: "Your submission has been logged for supervisor audit."
      });
      fetchStudentAndSubmissions();
    } catch (err: any) {
      toast.error("Audit Failure", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
       <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div variants={itemVariants} className="card-shadow rounded-[32px] bg-card p-8 border border-border overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none hover:scale-110 transition-transform">
             <Upload size={120} />
          </div>
          
          <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-3 uppercase tracking-tight italic">
            <Upload className="text-primary" size={24} />
            Submission <span className="text-primary">Console</span>
          </h3>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Academic Clearance Level</label>
                <select
                   aria-label="Academic clearance level"
                   value={submissionLevel}
                   onChange={(e) => setSubmissionLevel(e.target.value)}
                   className="w-full bg-muted/20 border-border rounded-xl h-11 px-4 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                >
                   <option value="DEPARTMENTAL">Departmental Board Review</option>
                   <option value="SCHOOL">School Examination Board</option>
                   <option value="FINAL">Final Convocation Submission</option>
                </select>
             </div>

             <div className="relative group">
                <input 
                   type="file" 
                   id="thesis-upload" 
                   className="hidden" 
                   accept=".pdf"
                   onChange={handleFileUpload}
                   disabled={isUploading || !student}
                />
                <label 
                   htmlFor="thesis-upload"
                   className={`border-4 border-dashed border-muted-foreground/10 rounded-[32px] p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-500 hover:border-primary/40 group-hover:bg-muted/5 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 transition-all duration-500 ${isUploading ? 'bg-primary/20 animate-pulse' : 'bg-primary/10 group-hover:scale-110 group-hover:bg-primary/20 shadow-inner'}`}>
                    {isUploading ? <Loader2 className="text-primary animate-spin" size={28} /> : <Upload className="text-primary" size={28} />}
                  </div>
                  <p className="font-black text-foreground uppercase tracking-tight text-sm">{isUploading ? 'Synchronizing Payload...' : 'Drop Thesis Draft'}</p>
                  <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-widest">Digital PDF Only • Maximum 50.0 MB Limit</p>
                </label>
             </div>
          </div>
          
          <div className="mt-8 flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
             <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center text-success">
                <ShieldCheck size={18} />
             </div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Authenticated Student: <span className="text-foreground">{student?.registration_number || 'IDENT-PENDING'}</span></p>
          </div>
        </motion.div>

        {/* Chronological History Section */}
        <motion.div variants={itemVariants} className="card-shadow rounded-[32px] bg-card p-8 border border-border flex flex-col">
          <h3 className="text-xl font-black text-foreground mb-6 flex items-center gap-3 uppercase tracking-tight italic">
            <History className="text-secondary" size={24} />
            Scholastic <span className="text-secondary">Audit Trail</span>
          </h3>
          
          <div className="space-y-4 overflow-y-auto pr-2 max-h-[500px] flex-1 custom-scrollbar">
            {submissions.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20 grayscale">
                  <FileText size={48} className="mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No versions recorded in local ledger</p>
               </div>
            ) : (
                submissions.map((sub, i) => (
                  <div key={sub.id} className="p-6 rounded-[28px] bg-background border border-border/60 hover:border-secondary/40 transition-all group/sub">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary group-hover/sub:scale-110 transition-transform">
                            <FileText size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-foreground antialiased">v{sub.version_number ?? sub.version_label ?? '-'}</p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(sub.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <Badge className="text-[9px] font-black uppercase border-none px-3 py-1 rounded-full bg-muted text-muted-foreground">
                        {sub.locked_for_exam ? "Locked" : "Submitted"}
                      </Badge>
                    </div>
                    
                    {sub.file_url && (
                      <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="block">
                        <Button variant="outline" className="w-full rounded-xl border-border bg-transparent text-[10px] font-black uppercase tracking-widest h-10 hover:bg-secondary hover:text-white transition-all">
                          Download Audit Piece
                        </Button>
                      </a>
                    )}
                  </div>
                ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
