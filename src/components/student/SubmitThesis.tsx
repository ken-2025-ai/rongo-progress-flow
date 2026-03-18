import { motion } from "framer-motion";
import { Upload, FileText, History, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";

export function SubmitThesis() {
  const versions = [
    { name: "Final_Thesis_Draft_v2.pdf", date: "Oct 12, 2025", status: "Rejected", comments: "Methodology needs more detail" },
    { name: "Draft_v1_Complete.pdf", date: "Aug 05, 2025", status: "Approved", comments: "Proceed to school level" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <motion.div variants={itemVariants} className="card-shadow rounded-xl bg-card p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Upload className="text-primary" size={20} />
            Upload New Version
          </h3>
          <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-primary" size={24} />
            </div>
            <p className="font-semibold text-foreground">Click or drag thesis file to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PDF format only (Max 50MB)</p>
          </div>
          
          <div className="mt-6 flex flex-col gap-3">
            <label className="text-sm font-medium text-muted-foreground">Submission Level</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option>Departmental Review</option>
              <option>School Review</option>
              <option>Final Examination Submission</option>
            </select>
          </div>

          <Button className="w-full mt-6 bg-primary text-white hover:bg-primary/90">
            Submit for Review
          </Button>
        </motion.div>

        {/* History Section */}
        <motion.div variants={itemVariants} className="card-shadow rounded-xl bg-card p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <History className="text-secondary" size={20} />
            Version History
          </h3>
          <div className="space-y-4">
            {versions.map((v, i) => (
              <div key={i} className="p-4 rounded-lg bg-background border border-border flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary/60" />
                    <span className="text-sm font-bold">{v.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    v.status === "Approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>
                    {v.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Submitted on {v.date}</p>
                <div className="mt-2 p-2 rounded bg-muted/30 text-[11px] text-muted-foreground border-l-2 border-primary/30 italic">
                  "{v.comments}"
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Guidelines */}
      <motion.div variants={itemVariants} className="card-shadow rounded-xl bg-status-info/5 p-4 border border-status-info/20 flex gap-4">
        <AlertCircle className="text-status-info shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-status-info text-sm">Submission Guidelines</h4>
          <p className="text-xs text-status-info/80 mt-1 leading-relaxed">
            Ensure your thesis follows the Rongo University formatting guide. All citations must be updated to the latest APA style. Final submissions must include the Turnitin similarity report (less than 15%).
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
