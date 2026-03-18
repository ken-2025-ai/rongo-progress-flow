import { motion } from "framer-motion";
import { 
  Bell, Building2, User, ChevronRight, 
  CheckCircle2, AlertCircle, CalendarDays, ClipboardCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useRole } from "@/contexts/RoleContext";

export function AcademicUpdates() {
  const { currentRole } = useRole();

  const updates = [
    {
       id: 1,
       title: "Department Seminar Cleared",
       message: "Your Department Seminar evaluation has been officially approved by the CMJ Coordinator. You are now authorized to book a School Seminar presentation slot.",
       date: "Today, 10:45 AM",
       type: "success",
       icon: CheckCircle2,
       actionRequired: false,
       targetRoles: ["student"]
    },
    {
       id: 2,
       title: "Progress Report Action Required",
       message: "The Q2 2026 Academic Progress Report window is closing in 5 days. Ensure your supervisor signs the cover page before uploading.",
       date: "Yesterday, 02:00 PM",
       type: "warning",
       icon: AlertCircle,
       actionRequired: true,
       actionText: "Upload Report",
       targetRoles: ["student", "supervisor"]
    },
    {
       id: 3,
       title: "New Senate Guidelines Published",
       message: "Postgraduate School has released updated guidelines for Thesis formatting. Please adhere to the new 1.5 spacing requirement for literature review sections.",
       date: "March 15, 2026",
       type: "info",
       icon: Building2,
       actionRequired: false,
       targetRoles: ["student", "supervisor", "panel", "admin", "school_admin", "dean"]
    },
    {
       id: 4,
       title: "Supervisor Assigned",
       message: "Dr. Lwanga has been formally assigned as your primary research supervisor in the School of Computing.",
       date: "March 01, 2026",
       type: "info",
       icon: User,
       actionRequired: false,
       targetRoles: ["student"]
    }
  ];

  const visibleUpdates = updates.filter(u => u.targetRoles.includes(currentRole));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Bell className="text-primary" />
            Official Academic Updates
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Important announcements, workflow progression alerts, and administrative notifications regarding your postgraduate journey.
          </p>
        </div>
        <div className="flex shrink-0">
           <Button variant="outline" className="text-xs font-bold uppercase tracking-widest text-muted-foreground h-9 bg-background shadow-transparent border-dashed">
             Mark all as Read
           </Button>
        </div>
      </div>

      <div className="space-y-4">
         {visibleUpdates.map((update, i) => {
            const Icon = update.icon;
            return (
              <motion.div 
                 key={update.id} 
                 variants={itemVariants} 
                 className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group hover:shadow-md
                    ${update.type === 'success' ? 'bg-success/5 border-success/20 hover:border-success/40' : 
                      update.type === 'warning' ? 'bg-status-warning/5 border-status-warning/20 hover:border-status-warning/40' : 
                      'bg-card border-border hover:border-primary/30'}
                 `}
              >
                 {update.type === 'warning' && <div className="absolute top-0 right-0 w-2 h-full bg-status-warning" />}
                 {update.type === 'success' && <div className="absolute top-0 right-0 w-2 h-full bg-success opacity-50" />}
                 
                 <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className={`p-3 rounded-full shrink-0
                       ${update.type === 'success' ? 'bg-success/20 text-success' : 
                         update.type === 'warning' ? 'bg-status-warning/20 text-status-warning animate-pulse' : 
                         'bg-primary/10 text-primary'}
                    `}>
                       <Icon size={24} />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                       <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-foreground text-base tracking-tight">{update.title}</h3>
                          <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase bg-muted/40 shrink-0">
                             {update.date}
                          </Badge>
                       </div>
                       
                       <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl mt-2">{update.message}</p>
                       
                       {update.actionRequired && (
                          <div className="pt-4 mt-4 border-t border-border/50">
                             <Button size="sm" className="h-9 px-4 text-xs font-bold uppercase tracking-widest bg-status-warning hover:bg-status-warning/90 text-status-warning-foreground shadow-md transition-all active:scale-[0.98]">
                                {update.actionText}
                             </Button>
                          </div>
                       )}
                    </div>
                 </div>
              </motion.div>
            );
         })}
      </div>

    </motion.div>
  );
}
