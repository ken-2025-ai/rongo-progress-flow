import { motion } from "framer-motion";
import { 
  FileBarChart, UploadCloud, FileText, CheckCircle2, 
  AlertCircle, Clock, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { containerVariants, itemVariants } from "@/lib/animations";

export function ProgressReportsSubmission() {
  const pastReports = [
    { quarter: "Q1 2026", status: "Approved", date: "Jan 15, 2026", comments: "Good progress on literature review." },
    { quarter: "Q4 2025", status: "Approved", date: "Oct 12, 2025", comments: "Methodology approved. Proceed to data collection." },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8">
      
      {/* Header Info */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 p-6 bg-card border border-border shadow-sm rounded-2xl items-start md:items-center justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <FileBarChart size={120} />
         </div>
         <div className="z-10 relative space-y-2">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
               <FileBarChart className="text-primary"/> Quarterly Progress Reports
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
               Maintain your academic standing by submitting required progress updates to your supervisor. Failure to submit triggers an administrative hold.
            </p>
         </div>
         <div className="z-10 bg-status-warning/10 border border-status-warning/20 p-4 rounded-xl flex items-center gap-4 shrink-0 shadow-inner">
            <div className="p-3 bg-status-warning/20 rounded-full animate-pulse">
               <AlertCircle size={20} className="text-status-warning"/>
            </div>
            <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next Deadline</p>
               <p className="text-lg font-black text-status-warning text-shadow-sm">May 31, 2026</p>
            </div>
         </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Submission Form */}
         <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
               <div className="p-6 border-b border-border/50 bg-muted/20">
                  <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground flex items-center gap-2">
                     <UploadCloud size={16}/> New Report Submission
                  </h3>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Academic Quarter</label>
                        <Select>
                           <SelectTrigger className="w-full h-12 bg-background font-medium">
                              <SelectValue placeholder="Select Quarter" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="q1">Quarter 1 (Jan - Mar)</SelectItem>
                              <SelectItem value="q2">Quarter 2 (Apr - Jun)</SelectItem>
                              <SelectItem value="q3">Quarter 3 (Jul - Sep)</SelectItem>
                              <SelectItem value="q4">Quarter 4 (Oct - Dec)</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Academic Year</label>
                        <Select defaultValue="2026">
                           <SelectTrigger className="w-full h-12 bg-background font-medium">
                              <SelectValue placeholder="Year" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="2026">2026</SelectItem>
                              <SelectItem value="2025">2025</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                        Brief Synopsis
                        <span className="text-[10px] font-medium text-muted-foreground/70 normal-case">Required</span>
                     </label>
                     <Textarea 
                        placeholder="Summarize your progress, challenges, and next physical milestones..."
                        className="min-h-[120px] resize-none bg-background p-4"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-xs font-bold uppercase text-muted-foreground flex justify-between">
                        Official Signed Document
                        <span className="text-[10px] font-medium text-secondary normal-case">PDF only (Max 10MB)</span>
                     </label>
                     <div className="border-2 border-dashed border-border hover:border-primary/50 bg-muted/10 transition-colors rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group">
                        <div className="p-4 bg-background rounded-full group-hover:bg-primary/10 transition-colors mb-4 shadow-sm border border-border">
                           <UploadCloud size={24} className="text-muted-foreground group-hover:text-primary transition-colors"/>
                        </div>
                        <p className="text-sm font-bold text-foreground">Click to upload or drag and drop</p>
                        <p className="text-xs text-muted-foreground mt-2 max-w-xs">
                           Ensure your supervisor has physically or digitally signed the cover page before upload.
                        </p>
                     </div>
                  </div>

                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 uppercase tracking-widest text-xs transition-transform active:scale-[0.98]">
                     Submit Progress Report
                  </Button>
               </div>
            </div>
         </motion.div>

         {/* History Sidebar */}
         <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2 text-muted-foreground">
               <Clock size={16}/> Submission History
            </h3>
            
            <div className="space-y-4">
               {pastReports.map((report, i) => (
                  <div key={i} className="bg-card p-5 rounded-xl border border-border shadow-sm hover:border-primary/30 transition-colors group cursor-pointer relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-success" />
                     
                     <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className="bg-muted text-[10px] font-bold tracking-wider uppercase border-transparent">
                           {report.quarter}
                        </Badge>
                        <span className="text-[10px] uppercase font-bold text-success flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded">
                           <CheckCircle2 size={12}/> {report.status}
                        </span>
                     </div>
                     
                     <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-3">
                        <FileText size={14}/> Submitted: {report.date}
                     </p>
                     
                     <div className="bg-muted/40 p-3 rounded text-[11px] text-muted-foreground italic leading-relaxed border border-border/50">
                        "{report.comments}"
                     </div>
                     
                     <div className="mt-4 flex items-center text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest gap-1">
                        View Full Details <ChevronRight size={14} />
                     </div>
                  </div>
               ))}
               
               <Button variant="outline" className="w-full border-dashed h-12 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  View Older Archives
               </Button>
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
