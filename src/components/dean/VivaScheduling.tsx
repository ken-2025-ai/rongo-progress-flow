import { motion } from "framer-motion";
import { CalendarDays, Clock, Loader2, Search, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function VivaScheduling() {
  const { user } = useRole();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [scheduleData, setScheduleData] = useState({ date: "", time: "", venue: "" });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          user:user_id(first_name, last_name, email),
          programme:programme_id(name, department:department_id(name)),
          seminar_bookings(id, requested_date, status, seminar_level)
        `)
        .eq('current_stage', 'VIVA_SCHEDULED')
        .order('updated_at', { ascending: true });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load viva scheduling queue.");
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleViva = async (candidate: any) => {
    if (!scheduleData.date || !scheduleData.venue) {
      toast.error("Please fill in date and venue.");
      return;
    }
    setScheduling(true);
    try {
      // Create a viva booking in seminar_bookings
      // @ts-ignore
      const { error: bookErr } = await supabase.from('seminar_bookings').insert({
        student_id: candidate.id,
        seminar_level: 'VIVA',
        requested_date: scheduleData.date,
        approved_date: scheduleData.date,
        status: 'APPROVED',
        approved_by: user?.id
      });
      if (bookErr) throw bookErr;

      toast.success("Viva-Voce Scheduled", {
        description: `${candidate.user?.first_name}'s defense is set for ${new Date(scheduleData.date).toLocaleDateString()} at ${scheduleData.venue}.`
      });
      setScheduleData({ date: "", time: "", venue: "" });
      fetchCandidates();
    } catch (err: any) {
      toast.error("Scheduling Failed", { description: err.message });
    } finally {
      setScheduling(false);
    }
  };

  const filtered = candidates.filter(c =>
    `${c.user?.first_name} ${c.user?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-80 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <CalendarDays className="text-secondary" /> Viva-Voce Scheduling
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Schedule oral defense sessions for approved examination candidates.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search candidate..." className="pl-9 h-10 text-sm rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Awaiting Schedule", count: candidates.length, color: "text-primary", bg: "bg-primary/10" },
          { label: "Vivas This Month", count: 0, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Completed Defenses", count: 0, color: "text-success", bg: "bg-success/10" },
        ].map(stat => (
          <div key={stat.label} className={`p-4 rounded-xl border border-border ${stat.bg} flex items-center gap-4`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
              <p className={`text-3xl font-black mt-0.5 ${stat.color}`}>{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5">
        {filtered.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl text-muted-foreground opacity-50">
            <CalendarDays size={48} className="mb-4" />
            <p className="font-black text-xs uppercase tracking-widest">No candidates pending viva scheduling</p>
          </div>
        ) : (
          filtered.map(candidate => (
            <motion.div key={candidate.id} variants={itemVariants} className="bg-card rounded-2xl border border-border/60 shadow-md p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-black">{candidate.user?.first_name} {candidate.user?.last_name}</h3>
                    <Badge variant="outline" className="text-[9px] uppercase">{candidate.programme?.department?.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{candidate.research_title || 'Thesis title pending'}"</p>
                  <p className="text-xs font-mono text-muted-foreground">{candidate.registration_number} • {candidate.programme?.name}</p>
                </div>

                <div className="shrink-0 w-full lg:w-56">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full h-12 bg-secondary text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg">
                        <CalendarDays size={16} className="mr-2" /> Schedule Viva
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-black text-xl">Schedule Viva-Voce</DialogTitle>
                        <p className="text-xs text-muted-foreground">Candidate: <strong>{candidate.user?.first_name} {candidate.user?.last_name}</strong></p>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-muted-foreground">Defense Date</label>
                          <input
                            type="date"
                            value={scheduleData.date}
                            onChange={e => setScheduleData(p => ({ ...p, date: e.target.value }))}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-muted-foreground">Start Time</label>
                          <input
                            type="time"
                            value={scheduleData.time}
                            onChange={e => setScheduleData(p => ({ ...p, time: e.target.value }))}
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-muted-foreground">Venue</label>
                          <Input
                            placeholder="e.g. PG Boardroom, Block A"
                            value={scheduleData.venue}
                            onChange={e => setScheduleData(p => ({ ...p, venue: e.target.value }))}
                            className="h-11 rounded-xl"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          className="bg-secondary text-white font-black text-[10px] uppercase tracking-widest h-11 px-8 rounded-xl"
                          disabled={scheduling}
                          onClick={() => handleScheduleViva(candidate)}
                        >
                          {scheduling ? <Loader2 size={16} className="animate-spin" /> : "Confirm & Notify"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
