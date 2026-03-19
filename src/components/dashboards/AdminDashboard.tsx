import { useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CalendarDays, FileBarChart, Clock, LayoutDashboard, Building2 } from "lucide-react";
import { InstitutionalSetup } from "./InstitutionalSetup";
import { Button } from "@/components/ui/button";

const STUDENTS_DATA = [
  { name: "Omondi Okech", reg: "PG/CS/001/2024", stage: "First Draft", days: 18, status: "warning", supervisor: "Dr. Amina Wanjiku" },
  { name: "Kevin Odhiambo", reg: "PG/CS/003/2024", stage: "Data Collection", days: 32, status: "overdue", supervisor: "Dr. Amina Wanjiku" },
  { name: "Faith Nyambura", reg: "PG/IT/005/2024", stage: "Ethics", days: 5, status: "on-track", supervisor: "Prof. Kibet Langat" },
  { name: "Mercy Chebet", reg: "PG/EE/007/2024", stage: "Final Submission", days: 8, status: "on-track", supervisor: "Dr. Silas Nyabuto" },
  { name: "Brian Mutua", reg: "PG/CS/009/2024", stage: "First Draft", days: 25, status: "warning", supervisor: "Dr. Amina Wanjiku" },
  { name: "Grace Atieno", reg: "PG/IS/011/2024", stage: "Proposal", days: 3, status: "on-track", supervisor: "Prof. Kibet Langat" },
];

const BOOKING_QUEUE = [
  { student: "Omondi Okech", type: "Progress Seminar", requested: "March 10", preferred: "March 28" },
  { student: "Faith Nyambura", type: "Proposal Defense", requested: "March 14", preferred: "April 5" },
];

import { containerVariants as container, itemVariants as item } from "@/lib/animations";

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  "on-track": { label: "On Track", classes: "bg-primary/10 text-primary" },
  "warning": { label: "Warning", classes: "bg-status-warning/10 text-status-warning" },
  "overdue": { label: "Overdue", classes: "bg-destructive/10 text-destructive" },
};

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'students' | 'setup'>('students');

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-card/40 backdrop-blur-sm rounded-xl border border-border w-fit shadow-sm">
        <Button 
          variant={activeTab === 'students' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('students')}
          className={`rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground'}`}
        >
          <LayoutDashboard size={14} className="mr-2" /> Students Overview
        </Button>
        <Button 
          variant={activeTab === 'setup' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('setup')}
          className={`rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'setup' ? 'bg-secondary text-white shadow-md' : 'text-muted-foreground'}`}
        >
          <Building2 size={14} className="mr-2" /> Institutional Setup
        </Button>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: "47", icon: Users, color: "bg-primary/10 text-primary" },
              { label: "Students Overdue", value: "6", icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
              { label: "Pending Bookings", value: "8", icon: CalendarDays, color: "bg-status-warning/10 text-status-warning" },
              { label: "Pending Reports", value: "12", icon: FileBarChart, color: "bg-secondary/20 text-accent-foreground" },
            ].map((kpi, i) => (
              <motion.div key={i} variants={item} className="card-shadow rounded-2xl bg-card p-5 border border-border shadow-sm flex items-start gap-4 hover:border-border/80 transition-all">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color} shadow-inner`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-black text-foreground mt-1 tabular-nums">{kpi.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Students Table */}
             <motion.div variants={item} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-muted/10">
                   <h3 className="font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2">
                      <Users size={16} className="text-primary"/> Scholastic Records
                   </h3>
                   <div className="flex gap-2">
                      <select className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                         <option>All Stages</option>
                         <option>Proposal</option>
                         <option>First Draft</option>
                         <option>Final Submission</option>
                      </select>
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                      <thead>
                         <tr className="bg-muted/30 border-b border-border/40 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                            <th className="px-5 py-3 text-left">Student</th>
                            <th className="px-5 py-3 text-left">Reg No</th>
                            <th className="px-5 py-3 text-left">Supervisor</th>
                            <th className="px-5 py-3 text-right">Stage</th>
                            <th className="px-5 py-3 text-center">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                         {STUDENTS_DATA.map((s, i) => {
                            const st = STATUS_MAP[s.status];
                            return (
                               <tr key={i} className="group hover:bg-muted/30 transition-colors cursor-pointer">
                                  <td className="px-5 py-3.5 font-bold text-foreground">{s.name}</td>
                                  <td className="px-5 py-3.5 text-muted-foreground font-mono">{s.reg}</td>
                                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{s.supervisor}</td>
                                  <td className="px-5 py-3.5 text-right font-medium text-foreground">{s.stage}</td>
                                  <td className="px-5 py-3.5 text-center">
                                     <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${st.classes} shadow-sm`}>
                                        {st.label}
                                     </span>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
             </motion.div>

             {/* Booking Queue */}
             <motion.div variants={item} className="card-shadow rounded-2xl bg-card border border-border shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest pb-3 border-b border-border/50 flex items-center gap-2">
                   <CalendarDays size={16} className="text-secondary"/> Request Queue
                </h3>
                <div className="space-y-4">
                   {BOOKING_QUEUE.map((b, i) => (
                      <div key={i} className="group relative rounded-xl border border-border/60 hover:border-secondary/40 p-4 transition-all hover:bg-muted/10">
                         <div className="flex flex-col gap-1 mb-3">
                            <p className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors underline decoration-secondary/30 underline-offset-4">{b.student}</p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{b.type}</p>
                         </div>
                         <p className="text-[11px] text-muted-foreground mb-4 font-medium flex items-center gap-2">
                            <Clock size={12}/> Preferred: {b.preferred}
                         </p>
                         <div className="flex gap-2">
                            <button className="flex-1 rounded-lg bg-secondary py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-secondary/20 hover:bg-secondary/90 transition-all active:scale-[0.98]">Confirm</button>
                            <button className="rounded-lg border border-border px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-colors">Shift</button>
                         </div>
                      </div>
                   ))}
                </div>
             </motion.div>
          </div>
        </>
      ) : (
        <InstitutionalSetup />
      )}
    </motion.div>
  );
}
