import { motion } from "framer-motion";
import { 
  Users, AlertTriangle, Clock, CheckCircle2, 
  ArrowRight, Search, FileText, ChevronRight, BarChart, Loader2 
} from "lucide-react";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/integrations/supabase/client";

export function SupervisorDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
       fetchSupervisionData();
    }
  }, [user]);

  const fetchSupervisionData = async () => {
    try {
       // @ts-ignore
       const { data: studentsData } = await supabase
         .from('students')
         .select(`
            *,
            user:user_id(first_name, last_name, email)
         `)
         .eq('supervisor_id', user.id);

       if (studentsData) {
          setStudents(studentsData);
          const sIds = studentsData.map(s => s.id);
          if (sIds.length > 0) {
             // @ts-ignore
             const { data: reportsData } = await supabase
               .from('progress_reports')
               .select(`
                 *,
                 student:student_id(
                    user:user_id(first_name, last_name)
                 )
               `)
               .in('student_id', sIds)
               .eq('status', 'PENDING_SUPERVISOR');
             
             setPendingReports(reportsData || []);
          }
       }
    } catch (err) {
       console.error(err);
    } finally {
       setLoading(false);
    }
  };

  const kpis = [
    { label: "Assigned Students", value: students.length.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending Reviews", value: pendingReports.length.toString(), icon: Clock, color: "text-status-warning", bg: "bg-status-warning/10" },
    { label: "Critical Stalls", value: students.filter(s => s.current_stage === 'CORRECTIONS').length.toString(), icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Clearances", value: students.filter(s => s.current_stage === 'COMPLETED').length.toString(), icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  ];

  if (loading) return (
     <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
     </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      
      {/* KPI Command Center */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={itemVariants} className="card-shadow rounded-2xl bg-card p-6 border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-border/80 transition-all">
            <div className={`absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity ${kpi.color}`}>
               <kpi.icon size={80} />
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${kpi.bg} shadow-inner`}>
              <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
              <p className="text-3xl font-black text-foreground mt-1 tabular-nums">{kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Tracking Board */}
         <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/50 bg-muted/10">
               <div>
                  <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                     <BarChart className="text-primary"/> Active Supervision Board
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Track all mentees and identify bottlenecks proactively.</p>
               </div>
               <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input 
                     placeholder="Search student or topic..." 
                     className="pl-9 h-9 text-xs rounded-lg bg-background"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
            </div>

            <div className="flex-1 overflow-x-auto">
               <Table>
                 <TableHeader className="bg-muted/30">
                   <TableRow>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Candidate & Topic</TableHead>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Current Phase</TableHead>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-right text-muted-foreground">Registration No</TableHead>
                     <TableHead className="font-bold text-xs uppercase tracking-wider text-center text-muted-foreground">Status</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {students
                     .filter(s => {
                        const fullName = `${s.user?.first_name || ""} ${s.user?.last_name || ""}`.toLowerCase();
                        const topic = (s.research_title || "").toLowerCase();
                        const search = searchTerm.toLowerCase();
                        return fullName.includes(search) || topic.includes(search);
                     })
                     .map((s) => (
                        <TableRow key={s.id} className="cursor-pointer hover:bg-muted/20 transition-colors group">
                          <TableCell className="py-4">
                             <span className="block font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                {s.user?.first_name} {s.user?.last_name}
                             </span>
                             <span className="block text-xs text-muted-foreground mt-1 line-clamp-1 max-w-[250px]">
                                {s.research_title || "Topic Unassigned"}
                             </span>
                          </TableCell>
                          <TableCell>
                             <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-1 rounded inline-flex items-center gap-1.5 whitespace-nowrap border border-secondary/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-secondary"/>
                                {s.current_stage?.replace(/_/g, ' ')}
                             </span>
                          </TableCell>
                          <TableCell className="text-right">
                             <span className="text-xs font-bold font-mono text-muted-foreground">
                                {s.registration_number}
                             </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-success/20 text-success bg-success/5">
                              {s.current_stage === 'COMPLETED' ? 'Finished' : 'Active'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                     ))}
                 </TableBody>
               </Table>
            </div>
         </motion.div>

         {/* Action Sidebar */}
         <motion.div variants={itemVariants} className="space-y-6">
            <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-5 border-b border-border/50 bg-status-warning/5">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                     <FileText className="text-status-warning"/> Pending Document Reviews
                  </h3>
               </div>
               
               <div className="p-4 space-y-3 flex-1">
                 {pendingReports.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground">
                       <CheckCircle2 size={32} className="mb-2 text-success/50"/>
                       <p className="text-xs font-bold uppercase">All caught up</p>
                    </div>
                 ) : (
                    pendingReports.map((r) => (
                      <div key={r.id} className="rounded-xl border border-border p-4 bg-background shadow-sm hover:shadow transition-shadow group cursor-pointer" onClick={() => navigate("/reports-review")}>
                        <div className="flex justify-between items-start mb-2">
                           <Badge variant="outline" className="bg-muted text-[9px] font-bold tracking-widest uppercase border-transparent">
                              {r.quarter} {r.year}
                           </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                           {r.student?.user?.first_name} {r.student?.user?.last_name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1 tracking-wider line-clamp-2">
                           {r.synopsis}
                        </p>
                        
                        <div className="mt-4 flex items-center gap-2">
                           <Button size="sm" className="h-7 text-[10px] font-bold uppercase bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                              Review
                           </Button>
                           <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase text-muted-foreground hover:text-foreground">
                              Dismiss
                           </Button>
                        </div>
                      </div>
                    ))
                 )}
               </div>
               
               <div className="p-4 border-t border-border/50 bg-muted/10">
                  <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary justify-between group" onClick={() => navigate("/reports-review")}>
                     Go to Review Desk <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </div>
         </motion.div>
      </div>
    </motion.div>
  );
}
