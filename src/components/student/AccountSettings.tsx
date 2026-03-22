import { motion } from "framer-motion";
import { User, Shield, Bell, Key, Camera, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { containerVariants, itemVariants } from "@/lib/animations";

export function AccountSettings() {
  const { user } = useRole();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Settings Updated", {
        description: "Your profile changes have been synchronized securely."
      });
    }, 1200);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-foreground tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground font-medium">Manage your institutional identity and security preferences.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <motion.div variants={itemVariants} className="space-y-2">
            {[
              { label: "Public Profile", icon: User, active: true },
              { label: "Security & Login", icon: Shield, active: false },
              { label: "Notifications", icon: Bell, active: false },
              { label: "API Keys", icon: Key, active: false },
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
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Identity */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="h-24 w-24 bg-primary/20 rounded-full flex items-center justify-center text-4xl font-black text-primary border-4 border-background shadow-xl">
                  {user.name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h3 className="font-bold text-lg">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">Upload a professional headshot for your ID card.</p>
                <div className="flex gap-3 mt-3">
                   <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-widest">Remove</Button>
                   <Button size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest">Change Photo</Button>
                </div>
              </div>
            </div>

            <Separator className="bg-border/50" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Full Legal Name</label>
                  <Input defaultValue={user.name} className="h-12 bg-background font-medium" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Institutional Email</label>
                  <Input defaultValue={user.email} disabled className="h-12 bg-muted/30 font-medium cursor-not-allowed" />
               </div>
               <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Personal Bio / Research Blurb</label>
                  <Input placeholder="Share a brief sentence about your research focus..." className="h-12 bg-background font-medium" />
               </div>
            </div>
          </div>

          {/* Section 2: Preferences */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
               <Bell className="text-primary" size={20} /> Notification Preferences
            </h3>
            
            <div className="space-y-4">
               {[
                 { label: "Email alerts for feedback", desc: "Get notified when your supervisor reviews your work.", default: true },
                 { label: "SMS submission deadlines", desc: "Receive reminders 48 hours before quarterly deadlines.", default: false },
                 { label: "Viva schedule updates", desc: "Real-time alerts for examination board decisions.", default: true },
               ].map((pref, i) => (
                 <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/5">
                    <div className="space-y-0.5">
                       <p className="text-sm font-bold text-foreground">{pref.label}</p>
                       <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <Switch defaultChecked={pref.default} />
                 </div>
               ))}
            </div>
          </div>

          {/* Action Dock */}
          <div className="flex justify-end gap-4">
             <Button variant="ghost" className="font-bold text-muted-foreground">Discard Changes</Button>
             <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-primary text-primary-foreground font-bold px-8 h-12 shadow-lg shadow-primary/20 gap-2"
             >
                {isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                {isSaving ? "Saving Profiles..." : "Save Settings"}
             </Button>
          </div>

        </motion.div>
      </div>

    </motion.div>
  );
}
