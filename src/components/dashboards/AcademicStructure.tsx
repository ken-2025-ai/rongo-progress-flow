import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, School, Plus, Trash2, GraduationCap, Building2, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function AcademicStructure() {
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [newProgName, setNewProgName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // @ts-ignore
    const { data: dData } = await supabase.from('departments').select('*, schools(name)').order('name');
    // @ts-ignore
    const { data: pData } = await supabase.from('programmes').select('*, department:department_id(name, schools(name))').order('name');
    
    if (dData) setDepartments(dData);
    if (pData) setProgrammes(pData);
  };

  const handleAddProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName || !selectedDeptId) {
      toast.error("Constraint Violation", { description: "Academic title and Department mapping are mandatory." });
      return;
    }

    setIsLoading(true);
    try {
      // @ts-ignore
      const { error } = await supabase.from('programmes').insert({ 
        name: newProgName, 
        department_id: selectedDeptId 
      });
      if (error) throw error;
      
      toast.success("Academic Pillar Established", { description: `${newProgName} has been appended to the curriculum.` });
      setNewProgName("");
      fetchData();
    } catch (err: any) {
      toast.error("Deployment Error", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProgramme = async (id: string, name: string) => {
    if (!confirm(`Are you certain you wish to decommission ${name}? This action is destructive.`)) return;
    
    try {
      // @ts-ignore
      const { error } = await supabase.from('programmes').delete().eq('id', id);
      if (error) throw error;
      toast.success("Node Decommissioned", { description: "Programme removed from infrastructure." });
      fetchData();
    } catch (err: any) {
      toast.error("Operation Denied", { description: "Unable to delete: Active students may be linked to this programme." });
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-6xl mx-auto">
      
      <div className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <GraduationCap className="text-primary" size={28} />
              Academic Degree Registry
           </h2>
           <p className="text-sm text-muted-foreground">Define and map postgraduate degrees to institutional departments.</p>
        </div>
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px]">
           {programmes.length} Active Programmes
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
           <div className="card-shadow rounded-3xl bg-card border border-border overflow-hidden border-t-4 border-t-primary shadow-xl">
              <div className="p-5 border-b border-border/50 bg-muted/10">
                 <h3 className="font-bold text-foreground text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    <Plus size={14} className="text-primary"/> Propose New Programme
                 </h3>
              </div>
              <form onSubmit={handleAddProgramme} className="p-6 space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Degree Title</label>
                    <Input 
                      placeholder="e.g. PhD in Computer Science" 
                      value={newProgName} 
                      onChange={(e) => setNewProgName(e.target.value)} 
                      className="h-12 bg-background font-medium focus:ring-primary/40 border-border/60"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Host Department</label>
                    <select 
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">Select Target Branch</option>
                      {departments.map(d => (
                         <option key={d.id} value={d.id}>{d.name} ({d.schools?.name})</option>
                      ))}
                    </select>
                 </div>
                 <Button 
                   type="submit" 
                   disabled={isLoading || !newProgName || !selectedDeptId} 
                   className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all mt-2"
                 >
                   {isLoading ? "Provisioning..." : "Establish Programme"}
                 </Button>
              </form>
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
           <div className="card-shadow rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
              <div className="p-5 border-b border-border/50 bg-muted/10 flex justify-between items-center">
                 <h3 className="font-bold text-foreground text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                    <ListTree size={16} className="text-muted-foreground"/> Current Curriculum Map
                 </h3>
              </div>
              <div className="p-0">
                 <table className="w-full">
                    <thead>
                       <tr className="bg-muted/30 border-b border-border/40 text-[9px] uppercase font-black text-muted-foreground tracking-widest">
                          <td className="p-4 pl-6">Academic Programme</td>
                          <td className="p-4">Department / School</td>
                          <td className="p-4 text-center">Status</td>
                          <td className="p-4 text-right pr-6">Management</td>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                       {programmes.map((prog) => (
                          <tr key={prog.id} className="group hover:bg-muted/20 transition-all border-l-4 border-l-transparent hover:border-l-primary">
                             <td className="p-4 pl-6 font-bold text-foreground text-sm">{prog.name}</td>
                             <td className="p-4">
                                <div className="flex flex-col">
                                   <span className="text-xs font-semibold text-foreground">{prog.department?.name || "Orphaned"}</span>
                                   <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{prog.department?.schools?.name}</span>
                                </div>
                             </td>
                             <td className="p-4 text-center">
                                <Badge className="bg-success/10 text-success border-none text-[8px] uppercase tracking-tighter">Active</Badge>
                             </td>
                             <td className="p-4 text-right pr-6">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteProgramme(prog.id, prog.name)}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                   <Trash2 size={16} />
                                </Button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
