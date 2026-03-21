import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  History,
  Loader2,
  ShieldCheck,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

const ACCEPTED_TYPE = "application/pdf";
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

interface ThesisSubmission {
  id: string;
  student_id: string;
  version_number: number;
  file_url: string;
  file_checksum?: string | null;
  submitted_by?: string | null;
  locked_for_exam?: boolean;
  created_at: string;
}

interface Student {
  id: string;
  user_id: string;
  registration_number: string;
}

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.type !== ACCEPTED_TYPE) {
    return { valid: false, error: "Only PDF format is accepted." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "File exceeds 50 MB limit." };
  }
  return { valid: true };
}

export function SubmitThesis() {
  const { user, isLoading: authLoading } = useRole();
  const [student, setStudent] = useState<Student | null>(null);
  const [submissions, setSubmissions] = useState<ThesisSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [submissionLevel, setSubmissionLevel] = useState("DEPARTMENTAL");
  const [isDragging, setIsDragging] = useState(false);
  const [dragRejectReason, setDragRejectReason] = useState<string | null>(null);
  const dragCounterRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStudentAndSubmissions = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: sData } = await supabase
        .from("students")
        .select("id, user_id, registration_number")
        .eq("user_id", user.id)
        .maybeSingle();

      if (sData) {
        setStudent(sData as Student);
        const { data: subData } = await supabase
          .from("thesis_submissions")
          .select("*")
          .eq("student_id", sData.id)
          .order("created_at", { ascending: false });
        setSubmissions((subData as ThesisSubmission[]) || []);
      } else {
        setStudent(null);
        setSubmissions([]);
      }
    } catch (err) {
      console.error("Failed to fetch student/submissions:", err);
      toast.error("Failed to load submission data.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && user?.id) {
      fetchStudentAndSubmissions();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user?.id, fetchStudentAndSubmissions]);

  const processFile = useCallback(
    async (file: File) => {
      if (!student || !user?.id) {
        toast.error("Not eligible to upload", {
          description: "Your student profile could not be found. Sign in with a registered student account.",
        });
        return;
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error("Invalid file", { description: validation.error });
        return;
      }

      setIsUploading(true);
      try {
        const fileName = `${student.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("thesis_payloads")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          const msg = uploadError.message || String(uploadError);
          if (msg.includes("Bucket not found") || msg.includes("not found")) {
            throw new Error(
              "Storage bucket 'thesis_payloads' is not set up. Ask your admin to run the database migrations."
            );
          }
          if (msg.includes("policy") || msg.includes("denied") || msg.includes("403")) {
            throw new Error(
              "Permission denied. Ensure your account is linked to a student record."
            );
          }
          throw uploadError;
        }
        if (!uploadData?.path) throw new Error("Upload succeeded but no path returned.");

        const { data: urlData } = supabase.storage
          .from("thesis_payloads")
          .getPublicUrl(uploadData.path);
        const fileUrl = urlData?.publicUrl ?? "";

        const versionNumber = submissions.length + 1;
        const { error: dbError } = await supabase.from("thesis_submissions").insert({
          student_id: student.id,
          version_number: versionNumber,
          file_url: fileUrl,
          submitted_by: user.id,
        });

        if (dbError) {
          const dbMsg = dbError.message || String(dbError);
          if (dbMsg.includes("duplicate") || dbMsg.includes("unique")) {
            throw new Error("A submission with this version already exists. Refresh and try again.");
          }
          if (dbMsg.includes("policy") || dbMsg.includes("RLS")) {
            throw new Error("Database permission denied. Contact your admin.");
          }
          throw dbError;
        }

        toast.success("Thesis submitted successfully", {
          description: `Version ${versionNumber} has been logged for supervisor review.`,
        });
        await fetchStudentAndSubmissions();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed. Check the console for details.";
        console.error("[SubmitThesis] Upload error:", err);
        toast.error("Submission failed", { description: message });
      } finally {
        setIsUploading(false);
      }
    },
    [student, user?.id, submissions.length, fetchStudentAndSubmissions]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current += 1;

      if (e.dataTransfer.items?.length && e.dataTransfer.items[0].kind === "file") {
        const file = e.dataTransfer.items[0].getAsFile();
        if (file) {
          const validation = validateFile(file);
          if (validation.valid) {
            setIsDragging(true);
            setDragRejectReason(null);
          } else {
            setDragRejectReason(validation.error ?? "Invalid file");
          }
        }
      }
    },
    []
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
      setDragRejectReason(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragRejectReason(null);
      dragCounterRef.current = 0;

      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleZoneClick = useCallback(() => {
    if (!isUploading && student) fileInputRef.current?.click();
  }, [isUploading, student]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  if (!student) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center justify-center py-24 text-center px-4"
      >
        <FileWarning className="text-amber-500 mb-4" size={48} />
        <h3 className="text-lg font-bold text-foreground">Student profile required</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Thesis submission is only available for registered students. Your account is not linked
          to a student record—sign in with your student credentials or ask your department to
          complete your registration.
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Demo/simulation logins do not have student records.
        </p>
      </motion.div>
    );
  }

  const canUpload = Boolean(student) && !isUploading;
  const zoneState = isDragging
    ? dragRejectReason
      ? "reject"
      : "accept"
    : "idle";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Upload Section */}
        <motion.div
          variants={itemVariants}
          className="card-shadow relative overflow-hidden rounded-[32px] border border-border bg-card p-8"
        >
          <div className="pointer-events-none absolute right-0 top-0 p-8 opacity-[0.03] transition-transform hover:scale-110">
            <Upload size={120} />
          </div>

          <h3 className="mb-6 flex items-center gap-3 text-xl font-black uppercase italic tracking-tight text-foreground">
            <Upload className="text-primary" size={24} />
            Submission <span className="text-primary">Console</span>
          </h3>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Academic Clearance Level
              </label>
              <select
                aria-label="Academic clearance level"
                value={submissionLevel}
                onChange={(e) => setSubmissionLevel(e.target.value)}
                className="w-full rounded-xl border-border bg-muted/20 px-4 h-11 text-xs font-bold text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
              >
                <option value="DEPARTMENTAL">Departmental Board Review</option>
                <option value="SCHOOL">School Examination Board</option>
                <option value="FINAL">Final Convocation Submission</option>
              </select>
            </div>

            {/* Drag & Drop Zone */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPE}
                onChange={handleInputChange}
                disabled={!canUpload}
                className="sr-only"
                aria-label="Upload thesis PDF"
              />
              <div
                role="button"
                tabIndex={canUpload ? 0 : -1}
                onClick={handleZoneClick}
                onKeyDown={(e) => {
                  if (canUpload && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleZoneClick();
                  }
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                aria-label="Drop thesis PDF or click to browse"
                className={`
                  flex cursor-pointer flex-col items-center justify-center rounded-[32px] border-4 border-dashed p-12 text-center transition-all duration-300
                  ${!canUpload ? "cursor-not-allowed opacity-60" : ""}
                  ${
                    zoneState === "accept"
                      ? "border-primary bg-primary/10 scale-[1.01]"
                      : zoneState === "reject"
                        ? "border-destructive/60 bg-destructive/5"
                        : "border-muted-foreground/10 hover:border-primary/40 hover:bg-muted/5"
                  }
                `}
              >
                <div
                  className={`
                    mb-4 flex h-16 w-16 items-center justify-center rounded-3xl shadow-inner transition-all duration-300
                    ${zoneState === "accept" ? "scale-110 bg-primary/30" : zoneState === "reject" ? "bg-destructive/20" : "bg-primary/10 group-hover:bg-primary/20"}
                  `}
                >
                  {isUploading ? (
                    <Loader2 className="text-primary animate-spin" size={28} />
                  ) : zoneState === "reject" ? (
                    <FileWarning className="text-destructive" size={28} />
                  ) : (
                    <Upload className="text-primary" size={28} />
                  )}
                </div>
                <p className="font-black uppercase tracking-tight text-sm text-foreground">
                  {isUploading
                    ? "Uploading…"
                    : zoneState === "reject"
                      ? dragRejectReason
                      : "Drop PDF here or click to browse"}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  PDF only • Max 50 MB
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <ShieldCheck size={18} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
              Authenticated:{" "}
              <span className="text-foreground">
                {student?.registration_number ?? "—"}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Submission History */}
        <motion.div
          variants={itemVariants}
          className="card-shadow flex flex-col rounded-[32px] border border-border bg-card p-8"
        >
          <h3 className="mb-6 flex items-center gap-3 text-xl font-black uppercase italic tracking-tight text-foreground">
            <History className="text-secondary" size={24} />
            Scholastic <span className="text-secondary">Audit Trail</span>
          </h3>

          <div className="custom-scrollbar max-h-[500px] flex-1 space-y-4 overflow-y-auto pr-2">
            {submissions.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-20 text-center grayscale opacity-30">
                <FileText size={48} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                  No submissions yet
                </p>
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="group/sub rounded-[28px] border border-border/60 bg-background p-6 transition-all hover:border-secondary/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-transform group-hover/sub:scale-110">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black antialiased text-foreground">
                          v{sub.version_number}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          {new Date(sub.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className="rounded-full border-none px-3 py-1 text-[9px] font-black uppercase bg-muted text-muted-foreground">
                      {sub.locked_for_exam ? "Locked" : "Submitted"}
                    </Badge>
                  </div>

                  {sub.file_url && (
                    <a
                      href={sub.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="h-10 w-full rounded-xl border-border bg-transparent text-[10px] font-black uppercase tracking-widest transition-all hover:bg-secondary hover:text-white"
                      >
                        Download
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
