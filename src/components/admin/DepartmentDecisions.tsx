import { motion } from "framer-motion";
import { 
  FileBarChart, Search, Filter, CheckCircle2, 
  AlertTriangle, PlayCircle, Shield, Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function DepartmentDecisions() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      let query = supabase
        .from('evaluations')
        .select(`
          *,
          student:student_id(
             registration_number,
             user:user_id(first_name, last_name),
             programme:programme_id(department_id, name)
          )
        `)
        .order('created_at', { ascending: false });

      // If dept coordinator, maybe filter by their dept
      if (user?.role === 'admin' && user?.department_id) {
         // Standard Supabase filter on nested is tricky, we filter in JS or use complex query
      }

      const { data, error } = await query;
      if (error) throw error;
      
      let filtered = data || [];
      if (user?.role === 'admin' && user?.department_id) {
         filtered = filtered.filter((l: any) => l.student?.programme?.department_id === user.department_id);
      }

      setLogs(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Audit Log Synch Error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
     <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card/40 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-3">
            <FileBarChart className="text-primary" size={24} />
            Decision History Log
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">Immutable audit trail of all recorded seminar and presentation decisions.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
           <Input 
             placeholder="Search by student name..." 
             className="pl-10 h-11 text-sm rounded-xl bg-background border-border/60"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border/60 shadow-lg">
         <div className="p-5 border-b border-border/50 bg-muted/10 flex justify-between items-center">
            <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Historical Records ({logs.length})</h3>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl">
               <Filter size={14} /> Filter Log
            </Button>
         </div>
         
         <Table>
           <TableHeader className="bg-muted/5">
             <TableRow className="border-b border-border/40">
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Date Recorded</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Student Identity</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Seminar Level</TableHead>
               <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 text-center">Final Consensus</TableHead>
               <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 pr-6">Recorded By</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {logs
               .filter(s => {
                  const fullName = `${s.student?.user?.first_name} ${s.student?.user?.last_name}`.toLowerCase();
                  return fullName.includes(searchTerm.toLowerCase());
               })
               .map((log) => (
                <TableRow key={log.id} className="group hover:bg-muted/30 transition-colors border-b border-border/30 last:border-0 font-medium">
                  <TableCell className="py-4 text-xs text-muted-foreground uppercase tabular-nums">
                     {new Date(log.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4">
                     <div className="flex flex-col">
                        <span className="font-black text-foreground">
                           {log.student?.user?.first_name} {log.student?.user?.last_name}
                        </span>
                        <Badge variant="outline" className="text-[8px] uppercase tracking-[0.1em] w-fit mt-1.5 font-black bg-background/50 border-border/60">
                           {log.student?.programme?.name}
                        </Badge>
                     </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-black uppercase tracking-widest">
                     {log.evaluation_type?.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-center py-4">
                     <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 border shadow-sm ${
                        log.recommendation?.toLowerCase().includes("pass") || log.recommendation?.toLowerCase().includes("clear") 
                        ? "bg-success/10 text-success border-success/20" : 
                        log.recommendation?.toLowerCase().includes("minor") ? "bg-status-warning/10 text-status-warning border-status-warning/20" : 
                        log.recommendation?.toLowerCase().includes("major") || log.recommendation?.toLowerCase().includes("fail") ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-muted text-foreground border-border"
                     }`}>
                        {(log.recommendation?.toLowerCase().includes("pass") || log.recommendation?.toLowerCase().includes("clear")) && <CheckCircle2 size={12} />}
                        {log.recommendation?.toLowerCase().includes("minor") && <AlertTriangle size={12} />}
                        {(log.recommendation?.toLowerCase().includes("major") || log.recommendation?.toLowerCase().includes("fail")) && <AlertTriangle size={12} />}
                        {log.recommendation }
                     </span>
                  </TableCell>
                  <TableCell className="text-right py-4 pr-6">
                     <span className="text-[11px] font-bold text-muted-foreground flex items-center justify-end gap-2 italic">
                        <Shield size={14} className="text-primary/30" /> Official Record
                     </span>
                  </TableCell>
                </TableRow>
             ))}
             {logs.length === 0 && (
                <TableRow>
                   <TableCell colSpan={5} className="py-20 text-center italic text-muted-foreground text-xs uppercase tracking-widest opacity-60">
                      No decision records found in the architectural vault.
                   </TableCell>
                </TableRow>
             )}
           </TableBody>
         </Table>
      </motion.div>
    </motion.div>
  );
}
