import { motion } from "framer-motion";
import { User, Shield, Bell, Key, Camera, Loader2, Save, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { containerVariants, itemVariants } from "@/lib/animations";

export function AccountSettings() {
  const { user, currentRole } = useRole();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings Synchronized", {
        description: "Your institutional profile and security preferences have been updated."
      });
    }, 1200);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8 pb-12">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <motion.div variants={itemVariants} className="space-y-2 lg:col-span-1">
            <div className="mb-6 px-4">
               <h2 className="text-xl font-black text-foreground tracking-tight">Account Board</h2>
               <p className="text-xs text-muted-foreground font-medium">Manage your identity.</p>
            </div>
            {[
              { label: "Public Profile", icon: User, active: true },
              { label: "Security & Access", icon: Shield, active: false },
              { label: "Notification Desk", icon: Bell, active: false },
              { label: "API Credentials", icon: Key, active: false },
            ].map((item, i) => (
              <Button 
                key={i} 
                variant={item.active ? "secondary" : "ghost"} 
                className={`w-full justify-start gap-3 h-11 font-bold ${item.active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground'}`}
              >
                <item.icon size={18} />
                {item.label}
              </Button>
            ))}
        </motion.div>

        {/* Content Area */}
        <motion.div variants={itemVariants} className="lg:col-span-3 space-y-8">
          
          {/* Section 1: Professional Identity */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20">
               <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <User size={14}/> Professional Identity & Avatar
               </h3>
            </div>
            
            <div className="p-8 space-y-10">
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="h-28 w-28 bg-primary/20 rounded-full flex items-center justify-center text-5xl font-black text-primary border-4 border-background shadow-2xl overflow-hidden">
                      {user.name.charAt(0)}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform border-4 border-background">
                      <Camera size={16} />
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="font-bold text-xl text-foreground">Institutional Avatar</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mt-1">This photo will be used on your digital ID and seminar attendance sheets. JPG or PNG, max 2MB.</p>
                    <div className="flex justify-center md:justify-start gap-3 mt-4">
                       <Button size="sm" variant="outline" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest">Remove</Button>
                       <Button size="sm" className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground">Upload New Photo</Button>
                    </div>
                  </div>
               </div>

               <Separator className="bg-border/50" />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <User size={12}/> Legal Display Name
                     </label>
                     <Input defaultValue={user.name} className="h-12 bg-background font-medium focus:ring-primary/20" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <Mail size={12}/> System Email
                     </label>
                     <Input defaultValue={user.email} disabled className="h-12 bg-muted/40 font-medium cursor-not-allowed opacity-70" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <Lock size={12}/> Research Focus Synopsis
                     </label>
                     <Input placeholder="E.g. Optimization of machine learning algorithms for agricultural yield prediction..." className="h-12 bg-background font-medium transition-all" />
                  </div>
               </div>
            </div>
          </div>

          {/* Section 2: Global Preferences */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20">
               <h3 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Bell size={14}/> Communication & Alerts
               </h3>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid gap-4">
                  {[
                    { label: "Review Feedback Alerts", desc: "Push & Email when a supervisor or coordinator reviews your work.", default: true },
                    { label: "Deadline Reminders", desc: "Institutional reminders for quarterly progress report windows.", default: true },
                    { label: "System Service Status", desc: "Alerts regarding planned maintenance and portal upgrades.", default: false },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5 hover:bg-muted/10 transition-colors">
                       <div className="space-y-0.5">
                          <p className="text-sm font-bold text-foreground">{pref.label}</p>
                          <p className="text-[11px] text-muted-foreground font-medium">{pref.desc}</p>
                       </div>
                       <Switch defaultChecked={pref.default} />
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Action Dock */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/20 p-6 rounded-2xl border border-border/50">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Last synchronized: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </p>
             <div className="flex gap-4 w-full sm:w-auto">
                <Button variant="ghost" className="font-bold text-muted-foreground uppercase tracking-widest text-[10px] h-12 px-6">Discard</Button>
                <Button 
                   onClick={handleSave} 
                   disabled={isSaving}
                   className="flex-1 sm:flex-initial bg-primary text-primary-foreground font-bold px-10 h-12 shadow-xl shadow-primary/20 gap-3 uppercase tracking-widest text-[11px]"
                >
                   {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                   {isSaving ? "Synchronizing..." : "Save Settings"}
                </Button>
             </div>
          </motion.div>

        </motion.div>
      </div>

    </motion.div>
  );
}
