import { motion } from "framer-motion";
import { User, Lock, Mail, Building2, Bell, Shield, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { containerVariants, itemVariants } from "@/lib/animations";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export function AccountSettings() {
  const { user, currentRole } = useRole();

  const handleSave = () => {
    toast.success("Settings Saved", {
      description: "Your academic account profile has been successfully updated.",
    });
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <User className="text-primary" />
            Account Management Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Manage your personal profile, security credentials, and email notification preferences for the Rongo University Progress Tracking System.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            
            {/* Personal Info */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
               <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground flex items-center gap-2">
                     <Building2 size={16}/> Identity & Affiliation
                  </h3>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                        <Input defaultValue={user.name} className="h-12 bg-background font-medium" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                           Institutional Email
                           <span className="text-success lowercase tracking-normal flex items-center gap-1"><Shield size={10}/> Verified</span>
                        </label>
                        <Input defaultValue={user.email} disabled className="h-12 bg-muted/50 font-medium text-muted-foreground opacity-70" />
                     </div>
                  </div>
                  
                  {currentRole === 'student' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registration Number</label>
                           <Input defaultValue="MSC/HI/024/2026" disabled className="h-12 bg-muted/50 font-mono tracking-wider opacity-70" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contact Phone</label>
                           <Input defaultValue="+254 712 345 678" className="h-12 bg-background font-medium" />
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Security */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
               <div className="p-4 border-b border-border/50 bg-muted/20">
                  <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground flex items-center gap-2">
                     <Lock size={16}/> Password & Security
                  </h3>
               </div>
               
               <div className="p-6 space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Password</label>
                     <Input type="password" placeholder="••••••••" className="h-12 bg-background font-medium max-w-md" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border/50 pt-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Password</label>
                        <Input type="password" placeholder="Enter new password" className="h-12 bg-background font-medium" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm New Password</label>
                        <Input type="password" placeholder="Re-type new password" className="h-12 bg-background font-medium" />
                     </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex gap-1 items-start mt-2 border-l-2 border-primary pl-2 uppercase font-medium">
                     <Shield size={12} className="shrink-0 mt-0.5" /> Password must be at least 8 characters long and contain a number.
                  </p>
               </div>
            </div>
            
            <Button onClick={handleSave} className="w-full md:w-auto h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20 uppercase tracking-widest text-[11px] transition-transform active:scale-[0.98]">
               <Save size={16} className="mr-2" /> Save Account Settings
            </Button>
         </motion.div>

         {/* Side Nav/Toggles */}
         <motion.div variants={itemVariants} className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 border-b border-border pb-2 text-muted-foreground">
               <Bell size={16}/> Notification Preferences
            </h3>
            
            <div className="bg-card p-5 rounded-xl border border-border shadow-sm space-y-5">
               <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                     <label className="text-sm font-bold text-foreground block cursor-pointer">Email Notifications</label>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Crucial Updates</p>
                  </div>
                  <div className="h-6 w-11 bg-primary rounded-full relative cursor-pointer shadow-inner">
                     <div className="h-4 w-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                  </div>
               </div>
               
               <div className="flex items-center justify-between pt-4 border-t border-border/50 opacity-60">
                  <div className="space-y-0.5">
                     <label className="text-sm font-bold text-foreground block cursor-pointer">SMS Alerts</label>
                     <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Seminar Reminders</p>
                  </div>
                  <div className="h-6 w-11 bg-muted border border-border rounded-full relative cursor-not-allowed">
                     <div className="h-4 w-4 bg-muted-foreground rounded-full absolute left-1 top-[3px]" />
                  </div>
               </div>
               <p className="text-[9px] uppercase font-bold tracking-widest text-status-warning text-center mt-4">SMS Gateway currently under maintenance.</p>
            </div>
         </motion.div>
      </div>

    </motion.div>
  );
}
