import { motion } from "framer-motion";
import {
  FileBarChart, Search, CheckCircle2,
  AlertTriangle, Shield, Loader2, Download, SlidersHorizontal, X
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

export function DepartmentDecisions() {
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => { fetchLogs(); }, [user]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('evaluations')
        .select(`
          *,
          student:student_id(
            registration_number,
            programme:programme_id(name, department_id, department:department_id(name, id)),
            user:user_id(first_name, last_name)
          ),
          evaluator:evaluator_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let filtered = data || [];
      if (user?.department_id) {
        filtered = filtered.filter((l: any) =>
          l.student?.programme?.department?.id === user.department_id ||
          l.student?.programme?.department_id === user.department_id
        );
      }

      setLogs(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load decision history.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const rows = [
      ["Date", "Student", "Registration No.", "Programme", "Seminar Level", "Verdict", "Evaluator"],
      ...displayedLogs.map(log => [
        new Date(log.created_at).toLocaleDateString(),
        `${log.student?.user?.first_name} ${log.student?.user?.last_name}`,
        log.student?.registration_number,
        log.student?.programme?.name,
        log.evaluation_type?.replace(/_/g, ' '),
        log.recommendation,
        log.evaluator ? `${log.evaluator.first_name} ${log.evaluator.last_name}` : 'System'
      ])
    ];
    const csv = rows.map(r => r.map(c => `"${c || ''}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `department_decisions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Decision Log Exported", { description: "CSV file downloaded to your computer." });
  };

  const displayedLogs = logs.filter(log => {
    const fullName = `${log.student?.user?.first_name} ${log.student?.user?.last_name}`.toLowerCase();
    const matchName = fullName.includes(searchTerm.toLowerCase()) ||
      (log.student?.registration_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "ALL" || log.evaluation_type === typeFilter;
    const matchOutcome = outcomeFilter === "ALL" ||
      (outcomeFilter === "PASS" && (log.recommendation || "").toLowerCase().includes("pass")) ||
      (outcomeFilter === "CORRECTIONS" && (log.recommendation || "").toLowerCase().includes("correction")) ||
      (outcomeFilter === "FAIL" && ((log.recommendation || "").toLowerCase().includes("fail") || (log.recommendation || "").toLowerCase().includes("repeat")));
    return matchName && matchType && matchOutcome;
  });

  const hasFilters = typeFilter !== "ALL" || outcomeFilter !== "ALL" || searchTerm !== "";

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-3">
            <FileBarChart className="text-primary" size={24} /> Decision History Log
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium italic">
            Immutable audit trail of all seminar panel decisions in your department.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
            <Input
              placeholder="Search student..."
              className="pl-9 h-10 text-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 w-44 rounded-xl font-bold text-xs">
              <SlidersHorizontal size={14} className="mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="DEPT_SEMINAR">Dept Seminar</SelectItem>
              <SelectItem value="SCHOOL_SEMINAR">School Seminar</SelectItem>
              <SelectItem value="VIVA">Viva</SelectItem>
              <SelectItem value="THESIS_REVIEW">Thesis Review</SelectItem>
            </SelectContent>
          </Select>
          {/* Outcome Filter */}
          <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
            <SelectTrigger className="h-10 w-44 rounded-xl font-bold text-xs">
              <SelectValue placeholder="Filter Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Outcomes</SelectItem>
              <SelectItem value="PASS">Pass</SelectItem>
              <SelectItem value="CORRECTIONS">Corrections</SelectItem>
              <SelectItem value="FAIL">Fail / Repeat</SelectItem>
            </SelectContent>
          </Select>
          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 text-[10px] font-black uppercase text-destructive hover:bg-destructive/10 rounded-xl"
              onClick={() => { setSearchTerm(""); setTypeFilter("ALL"); setOutcomeFilter("ALL"); }}
            >
              <X size={14} className="mr-1" /> Clear
            </Button>
          )}
          {/* Export */}
          <Button
            variant="outline"
            size="sm"
            className="h-10 gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl"
            onClick={handleExport}
            disabled={displayedLogs.length === 0}
          >
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Records", count: logs.length, color: "text-primary" },
          { label: "Passes", count: logs.filter(l => (l.recommendation || "").toLowerCase().includes("pass")).length, color: "text-success" },
          { label: "Corrections", count: logs.filter(l => (l.recommendation || "").toLowerCase().includes("correction")).length, color: "text-status-warning" },
          { label: "Fails / Repeats", count: logs.filter(l => (l.recommendation || "").toLowerCase().includes("fail") || (l.recommendation || "").toLowerCase().includes("repeat")).length, color: "text-destructive" },
        ].map(stat => (
          <motion.div key={stat.label} variants={itemVariants} className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-lg shadow-black/10">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
            <p className={`text-3xl font-black mt-0.5 ${stat.color}`}>{stat.count}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="card-shadow bg-card rounded-2xl overflow-hidden border border-border shadow-md">
        <div className="p-5 border-b border-border bg-muted/10 flex justify-between items-center">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">
            Records ({displayedLogs.length}{hasFilters ? ` of ${logs.length}` : ''})
          </h3>
        </div>

        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Date</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Student</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4">Seminar Level</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 text-center">Verdict</TableHead>
              <TableHead className="text-right font-black text-[10px] uppercase tracking-widest text-muted-foreground py-4 px-6">Evaluator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLogs.map((log) => {
              const Icon = recommendation_icon(log.recommendation);
              const evalName = log.evaluator
                ? `${log.evaluator.first_name} ${log.evaluator.last_name}`
                : 'System';
              return (
                <TableRow
                  key={log.id}
                  className="hover:bg-muted/20 transition-colors border-b border-border/30 last:border-0"
                >
                  <TableCell className="py-4 px-6 text-xs text-muted-foreground font-mono uppercase">
                    {new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="py-4">
                    <div>
                      <span className="block font-black text-foreground">
                        {log.student?.user?.first_name} {log.student?.user?.last_name}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px] uppercase tracking-[0.1em] font-black bg-background/50 border-border/60">
                          {log.student?.programme?.name}
                        </Badge>
                        <span className="text-[9px] font-mono text-muted-foreground">{log.student?.registration_number}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-black uppercase tracking-widest">
                    {log.evaluation_type?.replace(/_/g, ' ')}
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 border shadow-sm ${recommendation_color(log.recommendation)}`}>
                      <Icon size={12} />
                      {log.recommendation?.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center justify-end gap-2">
                      <Shield size={13} className="text-primary/40" />
                      {evalName}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center italic text-muted-foreground text-xs uppercase tracking-widest opacity-50">
                  No decision records match your current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
