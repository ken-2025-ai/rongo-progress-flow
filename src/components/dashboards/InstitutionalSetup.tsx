import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, School, Plus, Trash2, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { containerVariants, itemVariants } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function InstitutionalSetup() {
  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // @ts-ignore
    const { data: sData } = await supabase.from('schools').select('*').order('name');
    // @ts-ignore
    const { data: dData } = await supabase.from('departments').select('*, schools(name)').order('name');
    
    if (sData) setSchools(sData);
    if (dData) setDepartments(dData);
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName) return;

    setIsLoading(true);
    try {
      // @ts-ignore
      const { error } = await supabase.from('schools').insert({ name: newSchoolName });
      if (error) throw error;
      
      toast.success("School Architecture Updated", { description: `${newSchoolName} has been recorded.` });
      setNewSchoolName("");
      fetchData();
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !selectedSchoolId) {
      toast.error("Data Mapping Error", { description: "Department name and School parent are required." });
      return;
    }

    setIsLoading(true);
    try {
      // @ts-ignore
      const { error } = await supabase.from('departments').insert({ 
        name: newDeptName, 
        school_id: selectedSchoolId 
      });
      if (error) throw error;
      
      toast.success("Branch Added", { description: `${newDeptName} successfully linked to school.` });
      setNewDeptName("");
      fetchData();
    } catch (err: any) {
      toast.error("Operation Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* School Factory */}
        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/50 bg-primary/5 flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2 uppercase tracking-widest">
              <Building2 size={16} className="text-primary"/> Institutional Schools
            </h3>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-widest">{schools.length} Active</span>
          </div>
          
          <div className="p-6 space-y-6">
            <form onSubmit={handleAddSchool} className="flex gap-2">
              <Input 
                placeholder="e.g. School of Education" 
                value={newSchoolName} 
                onChange={(e) => setNewSchoolName(e.target.value)} 
                className="h-10 bg-background"
              />
              <Button type="submit" disabled={isLoading || !newSchoolName} size="sm" className="shrink-0 bg-primary hover:bg-primary/90 text-white font-bold h-10 px-4">
                <Plus size={16} className="mr-1"/> Add School
              </Button>
            </form>

            <div className="border border-border/40 rounded-xl overflow-hidden bg-background/30 shadow-inner max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/40 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    <td className="p-3">School Name</td>
                    <td className="p-3 text-right">Action</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {schools.map((school) => (
                    <tr key={school.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{school.name}</td>
                      <td className="p-3 text-right">
                        <button className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {schools.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-10 text-center text-muted-foreground italic opacity-50">No schools recorded in infrastructure.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Department Factory */}
        <motion.div variants={itemVariants} className="card-shadow rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border/50 bg-secondary/5 flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2 uppercase tracking-widest">
              <School size={16} className="text-secondary"/> Academic Departments
            </h3>
            <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded font-bold uppercase tracking-widest">{departments.length} Branches</span>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={handleAddDept} className="space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Department of CIT" 
                  value={newDeptName} 
                  onChange={(e) => setNewDeptName(e.target.value)} 
                  className="h-10 bg-background flex-1"
                />
                <select 
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  required
                >
                  <option value="">Parent School</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <Button type="submit" disabled={isLoading || !newDeptName || !selectedSchoolId} size="sm" className="shrink-0 bg-secondary hover:bg-secondary/90 text-white font-bold h-10 px-4">
                  <Plus size={16} className="mr-1"/> Add Dept
                </Button>
              </div>
            </form>

            <div className="border border-border/40 rounded-xl overflow-hidden bg-background/30 shadow-inner max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border/40 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                    <td className="p-3">Department</td>
                    <td className="p-3">Governance Parent</td>
                    <td className="p-3 text-right">Action</td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{dept.name}</td>
                      <td className="p-3 text-[10px] font-bold text-muted-foreground uppercase">{dept.schools?.name || "Orphaned"}</td>
                      <td className="p-3 text-right">
                        <button className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-lg opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-10 text-center text-muted-foreground italic opacity-50">No academic branches mapped yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
