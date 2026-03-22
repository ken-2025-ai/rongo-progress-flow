import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Activity, Terminal, ShieldAlert, Cpu, HardDrive, Clock, Search, ChevronRight, CornerDownRight, Database, History, DatabaseBackup } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function SystemLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Infrastructure' | 'Governance' | 'Academic'>('Infrastructure');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // 1. Fetch User creations (surrogate for Account Audit)
      // @ts-ignore
      const { data: userData } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(20);
      
      // 2. Fetch Evaluations (surrogate for Decision Audit)
      // @ts-ignore
      const { data: evalData } = await supabase.from('evaluations').select('*, students(registration_number), evaluator:evaluator_id(first_name, last_name)').order('created_at', { ascending: false }).limit(20);
      
      const combined = [
         ...(userData || []).map(u => ({
            id: u.id,
            timestamp: u.created_at,
            cat: 'Infrastructure',
            source: 'Auth-Node-Provisioner',
            event: 'System Node Initialized',
            desc: `User ${u.first_name} ${u.last_name} (${u.role}) provisioned at core server.`,
            meta: u.email
         })),
         ...(evalData || []).map(e => ({
            id: e.id,
            timestamp: e.created_at,
            cat: 'Governance',
            source: 'Logic-Engine-Decision',
            event: 'Verdict Recorded',
            desc: `Board verdict [${e.recommendation}] issued for ${e.students?.registration_number} by ${e.evaluator?.first_name} ${e.evaluator?.last_name}.`,
            meta: e.comments ? `${e.comments.substring(0, 50)}...` : "No remarks"
         }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(combined);
    } catch (err: any) {
      toast.error("Telemetry Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = activeTab === 'Full StreamDump'
    ? logs
    : logs.filter(l => l.cat === activeTab);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      
      {/* Infrastructure Core Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-1">
         {[
           { label: "Hardware Memory", val: "Global Shared Cluster", icon: Cpu, color: "text-primary" },
           { label: "Data Integrity", val: "Synchronized", icon: DatabaseBackup, color: "text-success" },
           { label: "Audit Protocol", val: "AES-256 Logs", icon: ShieldAlert, color: "text-status-warning" },
           { label: "Traffic Node", val: "Cloud-Native", icon: HardDrive, color: "text-secondary" },
         ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-black border border-white/5 p-6 rounded-[32px] flex items-center gap-4 hover:border-white/10 transition-colors">
               <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                  <stat.icon size={20} />
               </div>
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{stat.val}</p>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 min-h-[600px] px-1 pb-20">
         
         {/* Internal Terminal Menu */}
         <div className="w-full xl:w-72 space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6 pl-4">Audit Categories</h3>
            {['Infrastructure', 'Governance', 'Academic', 'Full StreamDump'].map(tab => (
               <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-105 active:scale-95 text-left font-bold text-xs uppercase tracking-widest ${
                     activeTab === tab ? "bg-white text-black border-white shadow-xl" : "bg-white/5 text-white/30 border-white/5 hover:text-white"
                  }`}
               >
                  <span className="flex items-center gap-3">
                     <Terminal size={14} /> {tab}
                  </span>
                  {activeTab === tab && <ChevronRight size={14} />}
               </button>
            ))}
            
            <div className="p-6 bg-[#0a0505] border border-red-500/10 rounded-2xl mt-12">
               <ShieldAlert className="text-red-500 mb-3" size={24} />
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Global Audit Notice</h4>
               <p className="text-[10px] text-red-100/30 mt-2 leading-relaxed italic">
                  All administrative actions including role modifications, stage overrides, and academic verdict recordings are permanently appended to the governance chain.
               </p>
            </div>
         </div>

         {/* Terminal Feed View */}
         <div className="flex-1 bg-[#050505] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            
            {/* Terminal Top Bar */}
            <div className="p-5 bg-white/5 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                     <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                     <div className="h-2.5 w-2.5 rounded-full bg-orange-500/50" />
                     <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white/20 tracking-widest uppercase ml-4">System://Infrastructure-Audit_Log_Daemon</span>
               </div>
               <div className="relative group w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={14} />
                  <Input 
                     placeholder="Filter by source or event ID..." 
                     className="h-10 bg-black/60 border-white/10 rounded-xl pl-10 text-[10px] font-mono text-white/50 tracking-wider focus:border-primary/50 transition-all font-bold placeholder:italic"
                  />
               </div>
            </div>

            {/* Scrollable Feed Container */}
            <div className="flex-1 overflow-y-auto p-8 font-mono scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent h-[600px]">
               <AnimatePresence mode="popLayout">
                  {filteredLogs.map((log, i) => (
                     <motion.div 
                        key={log.id + i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="mb-8 relative group/log"
                     >
                        {/* Time Connector Line */}
                        <div className="absolute -left-4 top-2 bottom-0 w-[1px] bg-white/5 group-hover/log:bg-primary/30 transition-colors" />
                        
                        <div className="flex flex-col gap-2">
                           <div className="flex flex-wrap items-center gap-3">
                              <span className="text-white/20 flex items-center gap-1.5 text-[9px] font-bold">
                                 <Clock size={12} className="text-primary/40"/> {new Date(log.timestamp).toLocaleString()}
                              </span>
                              <Badge className={`bg-white/5 hover:bg-white/10 border-white/5 text-[8px] uppercase font-black uppercase tracking-widest transition-all rounded px-2 hover:scale-110 cursor-alias ${
                                 log.cat === 'Infrastructure' ? "text-cyan-400" : "text-purple-400"
                              }`}>
                                 {log.cat}
                              </Badge>
                              <span className="text-white/30 text-[9px] uppercase font-black">@ {log.source}</span>
                           </div>
                           
                           <div className="flex items-start gap-4 mt-1">
                              <div className="shrink-0 mt-1">
                                 <CornerDownRight className="text-primary/40" size={16} />
                              </div>
                              <div className="space-y-1.5">
                                 <p className="text-xs font-bold text-white tracking-wide">{log.event}</p>
                                 <p className="text-[11px] text-white/40 leading-relaxed max-w-2xl font-medium">{log.desc}</p>
                                 <div className="flex items-center gap-2 mt-2">
                                    <span className="h-1 w-1 rounded-full bg-primary/40" />
                                    <span className="text-[9px] font-bold text-white/10 hover:text-white/40 cursor-default transition-colors">META: {log.meta}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  ))}
               </AnimatePresence>
               
               {filteredLogs.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center gap-6 opacity-30 italic">
                     <Database size={64} className="text-white/20 animate-pulse" />
                     <p className="text-sm font-bold tracking-[0.2em] uppercase text-white">No cached data packets in current stream filter</p>
                  </div>
               )}
               
               {filteredLogs.length > 0 && (
                  <div className="flex items-center gap-4 py-8 mt-8 border-t border-white/5 opacity-50">
                     <History className="text-primary" size={16} />
                     <span className="text-[9px] font-black uppercase text-white/30">End of Telemetry Trace - Initializing Continuous Pull-request Protocol</span>
                  </div>
               )}
            </div>

            {/* Terminal Status Bar */}
            <div className="p-4 bg-muted/10 border-t border-white/5 flex justify-between items-center z-10">
               <div className="flex gap-6">
                  <span className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase">
                     <Activity size={10} className="text-success animate-pulse" /> Status: Operational
                  </span>
                  <span className="flex items-center gap-2 text-[8px] font-black text-white/20 uppercase">
                     <Server size={10} className="text-primary" /> Kernel_Sync: ACTIVE
                  </span>
               </div>
               <div className="flex items-center gap-4">
                  <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Trace_ID: Ru_Syslog_#2026_x64</span>
                  <Button variant="ghost" className="h-8 text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary hover:bg-primary/5">
                     Flush Logs
                  </Button>
               </div>
            </div>
         </div>

      </div>

    </motion.div>
  );
}
