import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Server, Mail, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useRole();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email !== "kenkendagor3@gmail.com" || password !== "12345679") {
      toast.error("Access Denied", {
        description: "Invalid strictly governed Super Admin credentials.",
      });
      return;
    }

    setIsLoading(true);

    // Simulate encrypted login connection
    setTimeout(() => {
      login("super_admin");
      toast.success("Governance Access Granted", {
        description: "Welcome back, System Architect.",
      });
      navigate("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Cyberpunk/High-Tech Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20"
        style={{ 
          backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Intense Glowing Core */}
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] rounded-full bg-red-600/30 blur-[150px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center w-20 h-20 mb-6 rounded-2xl bg-red-950/30 border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
          >
            <Server className="text-red-500" size={40} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-black text-white tracking-tight uppercase"
          >
            Terminal <span className="text-red-500">Zero</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 mt-3 bg-red-950/40 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest text-red-400 uppercase"
          >
            <ShieldAlert size={12} /> System Administrator Portal
          </motion.div>
        </div>

        <Card className="border-white/5 bg-black/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-red-500 to-red-900" />
          
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-xl text-white font-mono tracking-wider uppercase">Authentication Required</CardTitle>
          </CardHeader>

          <form onSubmit={handleAdminLogin}>
            <CardContent className="space-y-6 pt-6">
              
              <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-lg flex gap-3 text-red-200/80 mb-6">
                 <ShieldAlert className="shrink-0 mt-0.5 text-red-500" size={16} />
                 <p className="text-[11px] font-mono leading-relaxed">
                   RESTRICTED ACCESS. This node acts as the global institutional governance controller. Unauthorized attempts are logged permanently.
                 </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 group">
                  <Label htmlFor="admin-email" className="text-white/60 font-mono text-[10px] uppercase tracking-widest pl-1">Governance Origin (Email)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={16} />
                    <Input 
                      id="admin-email" 
                      type="email" 
                      placeholder="kernel.admin@rongo.ac.ke" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/10 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-red-500/50 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="admin-key" className="text-white/60 font-mono text-[10px] uppercase tracking-widest pl-1">Decryption Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors" size={16} />
                    <Input 
                      id="admin-key" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/10 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-red-500/50 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 mt-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all active:scale-[0.98] border border-red-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-sm animate-spin" />
                    <span>ESTABLISHING SECURE HANDSHAKE...</span>
                  </div>
                ) : (
                  <span>Initialize Override</span>
                )}
              </Button>
            </CardContent>
          </form>
        </Card>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-between items-center px-4"
        >
          <div className="flex gap-2 text-[10px] font-mono font-bold text-white/30 uppercase">
             <CheckCircle2 size={14} className="text-green-500/50" />
             AES-256 ENCRYPTED
          </div>
          <button 
             onClick={() => navigate("/")}
             className="text-[10px] uppercase tracking-widest font-bold font-mono text-white/40 hover:text-white transition-colors"
          >
             Return to Public Portal
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
