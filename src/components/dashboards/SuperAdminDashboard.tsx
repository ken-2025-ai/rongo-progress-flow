import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, Users, Server, Building2, LayoutDashboard, Key, GitBranch, Activity, Settings2, School
} from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionalSetup } from "./InstitutionalSetup";

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
          <Building2 size={14} className="mr-2" /> Institutional Setup
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
             <motion.div variants={itemVariants} className="lg:col-span-2 card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border/50 bg-muted/10">
                   <div>
                      <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                         <Activity className="text-primary"/> Global Network Health
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Real-time surveillance of institutional workflow traffic.</p>
                   </div>
                   <Badge variant="outline" className="border-success/30 text-success bg-success/10 text-[10px] uppercase font-bold tracking-widest px-3 py-1">
                      100% Uptime
                   </Badge>
                </div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-70">
                   <Server size={64} className="text-muted-foreground mb-4 opacity-50"/>
                   <h4 className="font-bold text-lg text-foreground mb-2">Systems Operational</h4>
                   <p className="text-sm text-muted-foreground max-w-sm">
                      The infrastructure is handling 30+ concurrent document evaluations across the postgraduate network with zero latency spikes.
                   </p>
                </div>
             </motion.div>

             {/* Action Sidebar */}
             <motion.div variants={itemVariants} className="space-y-6">
                <div className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col h-full">
                   <div className="p-5 border-b border-border/50 bg-primary/5">
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                         <Key className="text-primary"/> Quick Authority Triggers
                      </h3>
                   </div>
                   <div className="p-4 space-y-3 flex-1">
                      <div className="p-3 border border-border/60 hover:border-primary/50 bg-background rounded-xl flex gap-3 cursor-pointer group transition-colors">
                         <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors text-primary group-hover:text-white">
                            <Users size={16} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Run Bulk Import Script</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">Students & Staff</p>
                         </div>
                      </div>
                      <div className="p-3 border border-border/60 hover:border-status-warning/50 bg-background rounded-xl flex gap-3 cursor-pointer group transition-colors">
                         <div className="p-2 bg-status-warning/10 rounded-lg group-hover:bg-status-warning transition-colors text-status-warning group-hover:text-status-warning-foreground">
                            <GitBranch size={16} />
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-foreground group-hover:text-status-warning transition-colors">Reassign Deadlocked Roles</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider font-bold">Fix orphaned submissions</p>
                         </div>
                      </div>
                   </div>
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
