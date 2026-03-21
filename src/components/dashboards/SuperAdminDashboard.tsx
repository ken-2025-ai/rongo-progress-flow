import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, Users, Server, Building2, LayoutDashboard, Key, GitBranch, Activity, Settings2, School, Database
} from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AcademicStructure } from "./AcademicStructure";
import { toast } from "sonner";

export function SuperAdminDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'infrastructure'>('overview');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto pb-20">
      
      {/* Sub-Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-card/60 backdrop-blur-md rounded-2xl border border-border w-fit shadow-sm">
        <Button 
          variant={activeView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveView('overview')}
          className={`rounded-xl h-10 px-5 text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground'}`}
        >
          <LayoutDashboard size={14} className="mr-2" /> Global Overview
        </Button>
        <Button 
          variant={activeView === 'infrastructure' ? 'default' : 'ghost'}
          onClick={() => setActiveView('infrastructure')}
          className={`rounded-xl h-10 px-5 text-xs font-bold uppercase tracking-widest transition-all ${activeView === 'infrastructure' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-muted-foreground'}`}
        >
          <Building2 size={14} className="mr-2" /> Institutional Architecture
        </Button>
      </div>

      {activeView === 'overview' ? (
        <>
          {/* KPI Command Center */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Active Nodes (Users)", value: "342", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "System Alerts", value: "0", icon: ShieldAlert, color: "text-success", bg: "bg-success/10" },
              { label: "Departments Online", value: "14", icon: Building2, color: "text-primary", bg: "bg-primary/10" },
              { label: "Server Status", value: "Optimal", icon: Server, color: "text-success", bg: "bg-success/10" },
            ].map((kpi, i) => (
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
             <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-[32px] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden flex flex-col min-h-[450px] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                <div className="p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 bg-white/5 backdrop-blur-md relative z-10">
                   <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2 italic">
                         <Activity className="text-secondary animate-pulse" size={20}/> Global Network Health
                      </h3>
                      <p className="text-[10px] text-white/30 mt-0.5 uppercase font-black tracking-widest">Real-time surveillance of institutional workflow traffic.</p>
                   </div>
                   <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[9px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-full border-none">
                      100% Core Uptime
                   </Badge>
                </div>
                
                <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                   <div className="bg-white/5 rounded-[24px] border border-white/5 p-6 flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Database size={18}/></div>
                         <span className="text-[11px] font-black uppercase text-white/40">Data Throughput</span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-3xl font-black text-white tabular-nums">4.2 GB/s</p>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }} className="h-full bg-secondary" />
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-white/5 rounded-[24px] border border-white/5 p-6 flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary"><GitBranch size={18}/></div>
                         <span className="text-[11px] font-black uppercase text-white/40">Workflow Evaluation Nodes</span>
                      </div>
                      <div className="space-y-1">
                         <p className="text-3xl font-black text-white tabular-nums">1.2k req</p>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "45%" }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} className="h-full bg-primary" />
                         </div>
                      </div>
                   </div>

                   <div className="col-span-full bg-white/5 rounded-[24px] border border-white/5 p-8 flex flex-col items-center justify-center text-center">
                      <Server size={48} className="text-white/10 mb-4 animate-bounce"/>
                      <h4 className="font-black text-white text-lg mb-2 uppercase tracking-tight">Institutional Clusters Synchronized</h4>
                      <p className="text-xs text-white/40 max-w-sm font-medium leading-relaxed italic">
                         The infrastructure is currently handling 30+ concurrent document evaluations across the postgraduate network with zero latency spikes detected in the core kernel.
                      </p>
                   </div>
                </div>
             </motion.div>

             {/* Action Sidebar */}
             <motion.div variants={itemVariants} className="space-y-6">
                <div className="card-shadow rounded-[32px] bg-[#0c0c0c] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-full">
                   <div className="p-6 border-b border-white/5 bg-white/5">
                      <h3 className="font-bold text-white text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                         <Key className="text-secondary" size={16}/> Quick Authority Triggers
                      </h3>
                   </div>
                   <div className="p-5 space-y-4 flex-1">
                      <button 
                        onClick={() => {
                           toast.promise(new Promise(r => setTimeout(r, 2000)), {
                              loading: 'Initializing Bulk Import Protocol...',
                              success: '342 Records Injected Successfully',
                              error: 'Import Engine Stalled',
                           });
                        }}
                        className="w-full p-4 border border-white/5 hover:border-secondary/40 bg-white/5 rounded-2xl flex gap-4 text-left group transition-all hover:scale-[1.02] active:scale-95"
                      >
                         <div className="p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary transition-colors text-secondary group-hover:text-black">
                            <Users size={20} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-secondary transition-colors uppercase tracking-tight">Run Bulk Import Script</h4>
                            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-black">Students & Staff Batch</p>
                         </div>
                      </button>

                      <button 
                        onClick={() => {
                           toast.info("Reconciliation Protocol Active", {
                              description: "Searching for orphaned submissions and deadlocked roles...",
                           });
                           setTimeout(() => toast.success("System Nodes Re-synchronized"), 2500);
                        }}
                        className="w-full p-4 border border-white/5 hover:border-primary/40 bg-white/5 rounded-2xl flex gap-4 text-left group transition-all hover:scale-[1.02] active:scale-95"
                      >
                         <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-colors text-primary group-hover:text-white">
                            <GitBranch size={20} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">Resolve Node Deadlocks</h4>
                            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-black">Fix orphaned submissions</p>
                         </div>
                      </button>

                      <div className="mt-8 p-6 bg-secondary/5 border border-secondary/10 rounded-2xl text-center">
                         <ShieldAlert className="text-secondary mx-auto mb-3" size={32} />
                         <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Security Clearance Level 5</p>
                         <p className="text-[10px] text-white/20 mt-2 font-medium">All trigger actions are documented in the infrastructure audit logs.</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          </div>
        </>
      ) : (
        <AcademicStructure />
      )}

    </motion.div>
  );
}
