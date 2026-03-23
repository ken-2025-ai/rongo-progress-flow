import { motion } from "framer-motion";
import {
  FileBarChart, Search, CheckCircle2,
  AlertTriangle, Shield, Loader2, Download, SlidersHorizontal, X, Building
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

const recommendation_color = (rec: string) => {
  const r = (rec || "").toLowerCase();
  if (r.includes("pass") || r.includes("clear")) return "bg-success/10 text-success border-success/20";
  if (r.includes("minor")) return "bg-status-warning/10 text-status-warning border-status-warning/20";
  if (r.includes("major") || r.includes("fail") || r.includes("repeat")) return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-muted text-muted-foreground border-border";
};

const recommendation_icon = (rec: string) => {
  const r = (rec || "").toLowerCase();
  if (r.includes("pass") || r.includes("clear")) return CheckCircle2;
  return AlertTriangle;
};

export function SchoolDecisions() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);

  useEffect(() => {
    if (user?.department_id) fetchSchoolContextAndLogs();
  }, [user]);

  const fetchSchoolContextAndLogs = async () => {
    setLoading(true);
    try {
      // 1. Get school info and all depts in this school
      // @ts-ignore
      const { data: deptData } = await supabase
        .from('departments')
        .select('school_id, schools(name)')
        .eq('id', user.department_id)
        .single();
      
      if (!deptData) return;
      setSchoolInfo(deptData.schools);

      // @ts-ignore
      const { data: allDepts } = await supabase
        .from('departments')
        .select('id, name')
        .eq('school_id', deptData.school_id);
      
      setDepartments(allDepts || []);

      // 2. Fetch all evaluations
      // @ts-ignore
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          student:student_id(
            registration_number,
            programme:programme_id(name, department_id, department:department_id(name, id, school_id)),
            user:user_id(first_name, last_name)
          ),
          evaluator:evaluator_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 3. Filter by school
      let filtered = (data || []).filter((l: any) =>
        l.student?.programme?.department?.school_id === deptData.school_id
      );

      setLogs(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Audit Log Cache Failure");
    } finally {
      setLoading(false);
    }
  };

  const displayedLogs = logs.filter(log => {
    const fullName = `${log.student?.user?.first_name} ${log.student?.user?.last_name}`.toLowerCase();
    const matchName = fullName.includes(searchTerm.toLowerCase()) ||
      (log.student?.registration_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "ALL" || log.evaluation_type === typeFilter;
    const matchDept = deptFilter === "ALL" || log.student?.programme?.department?.id === deptFilter;
    return matchName && matchType && matchDept;
  });

  const handleExport = () => {
    const rows = [
      ["Date", "Student", "Registration No.", "Department", "Type", "Verdict", "Evaluator"],
      ...displayedLogs.map(log => [
        new Date(log.created_at).toLocaleDateString(),
        `${log.student?.user?.first_name} ${log.student?.user?.last_name}`,
        log.student?.registration_number,
        log.student?.programme?.department?.name,
        log.evaluation_type?.replace(/_/g, ' '),
        log.recommendation,
        log.evaluator ? `${log.evaluator.first_name} ${log.evaluator.last_name}` : 'Institutional'
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school_decisions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("School Audit Log Exported", { description: "CSV file synchronized to your local disk." });
  };

  const hasFilters = typeFilter !== "ALL" || deptFilter !== "ALL" || searchTerm !== "";

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-card p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none rotate-12">
           <Building size={160} />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-foreground flex items-center gap-4 tracking-tight">
            <Shield className="text-primary" size={32} /> Institutional Audit Vault
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium italic opacity-70">
            Official decision history for <span className="text-secondary font-black uppercase not-italic">{schoolInfo?.name || "The School"}</span> candidates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 justify-end relative z-10">
          <div className="relative w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={18} />
            <Input
              placeholder="Filter by candidate..."
              className="pl-12 h-14 text-sm rounded-2xl bg-background border-border/60 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-14 w-48 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-background border-border/60">
              <SlidersHorizontal size={14} className="mr-2 text-primary" />
              <SelectValue placeholder="Protocol Type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="ALL">All Protocols</SelectItem>
              <SelectItem value="DEPT_SEMINAR">Dept Seminar</SelectItem>
              <SelectItem value="SCHOOL_SEMINAR">School Seminar</SelectItem>
              <SelectItem value="THESIS_REVIEW">Institutional Clearance</SelectItem>
              <SelectItem value="VIVA">Final Viva</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="h-14 w-48 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-background border-border/60">
              <Building size={14} className="mr-2 text-secondary" />
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="ALL">All Departments</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-14 text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 rounded-2xl px-6"
              onClick={() => { setSearchTerm(""); setTypeFilter("ALL"); setDeptFilter("ALL"); }}
            >
              <X size={16} className="mr-2" /> Reset
            </Button>
          )}
          <Button
            className="h-14 gap-2 text-[10px] font-black uppercase tracking-widest rounded-2xl px-8 bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleExport}
            disabled={displayedLogs.length === 0}
          >
            <Download size={18} /> Sync Export
          </Button>
        </div>
      </div>

      {/* Metric Pipeline Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Vault Records", count: logs.length, color: "text-foreground", icon: Building },
          { label: "Institutional Passes", count: logs.filter(l => (l.recommendation || "").toLowerCase().includes("pass")).length, color: "text-success", icon: CheckCircle2 },
          { label: "Refinement Orders", count: logs.filter(l => (l.recommendation || "").toLowerCase().includes("correction")).length, color: "text-status-warning", icon: AlertTriangle },
          { label: "Terminal Rejections", count: logs.filter(l => (l.recommendation || "").toLowerCase().includes("fail") || (l.recommendation || "").toLowerCase().includes("repeat")).length, color: "text-destructive", icon: X },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants} className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-lg shadow-black/10 group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
               <div className={`p-1.5 rounded-lg bg-gradient-to-br from-current/20 to-current/10 ${stat.color} opacity-10`} />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</p>
            </div>
            <div className="flex items-end justify-between">
               <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.count}</p>
               <stat.icon className={`${stat.color} opacity-20`} size={32} />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-[2.5rem] overflow-hidden border border-border shadow-2xl">
        <div className="p-8 border-b border-border/50 bg-muted/5 flex justify-between items-center">
          <h3 className="font-black text-[11px] uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
            <Building size={16} className="text-primary" /> Multi-Departmental Decision Feed
          </h3>
          <Badge className="font-black text-[10px] uppercase bg-secondary/10 text-secondary border-secondary/20 px-4 py-2">
            ID: {schoolInfo?.name?.toUpperCase() || "INSTITUTIONAL"}
          </Badge>
        </div>

        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-6 px-10">Timestamp</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-6">Identity & Origin</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-6">Protocol Level</TableHead>
              <TableHead className="font-black text-[10px) uppercase tracking-widest text-muted-foreground py-6 text-center">Consensus Verdict</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-6 px-10">Validating Authority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLogs.map((log) => {
              const Icon = recommendation_icon(log.recommendation);
              const authName = log.evaluator 
                ? `${log.evaluator.first_name} ${log.evaluator.last_name}`
                : 'System Audit';
                
              return (
                <TableRow 
                  key={log.id} 
                  className="hover:bg-muted/10 transition-colors border-b border-border/30 last:border-0"
                >
                  <TableCell className="py-6 px-10 text-xs text-muted-foreground/60 font-mono uppercase tracking-widest font-black">
                    {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <span className="block text-[8px] opacity-40 mt-1">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </TableCell>
                  <TableCell className="py-6">
                    <div>
                      <span className="block font-black text-foreground text-lg tracking-tight">
                        {log.student?.user?.first_name} {log.student?.user?.last_name}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-[0.2em] font-black bg-muted/40 border-border/60 px-3 py-1">
                          {log.student?.programme?.department?.name}
                        </Badge>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground/50 italic">{log.student?.registration_number}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] font-black uppercase tracking-widest text-primary/80">
                    {log.evaluation_type?.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-center py-6">
                    <span className={`text-[10px] font-black px-4 py-2 rounded-2xl uppercase tracking-[0.1em] inline-flex items-center gap-2 border shadow-sm ${recommendation_color(log.recommendation)}`}>
                      <Icon size={14} />
                      {log.recommendation?.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-6 px-10">
                    <div className="flex flex-col items-end">
                       <span className="text-[11px] font-black text-foreground flex items-center gap-2 uppercase tracking-widest">
                         <Shield size={14} className="text-primary/60" />
                         {authName}
                       </span>
                       <span className="text-[9px] font-bold text-muted-foreground/50 uppercase italic mt-1">Institutional Verifier</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-30">
                     <FileBarChart size={48} />
                     <p className="font-black text-sm uppercase tracking-[0.3em]">No Audit Trails Match Queries</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
