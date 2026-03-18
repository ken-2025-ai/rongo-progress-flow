import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRole, UserRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ShieldCheck, UserCircle, Briefcase, LayoutDashboard, Fingerprint, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const ROLE_ICONS: Record<UserRole, any> = {
  student: GraduationCap,
  supervisor: UserCircle,
  panel: Briefcase,
  admin: ShieldCheck,
  dean: LayoutDashboard,
};

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useRole();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a premium login experience
    setTimeout(() => {
      login(selectedRole);
      toast.success(`Logged in as ${ROLE_LABELS[selectedRole]}`, {
        description: "Welcome back to Rongo Progress Flow.",
      });
      navigate("/");
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-6">
      {/* Dynamic Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale-[0.2] contrast-[1.1]"
        style={{ 
          backgroundImage: 'url("/rongo_university_campus_abstract_1773834339638.png")',
          filter: "brightness(0.35) saturate(0.8)"
        }}
      />
      
      {/* Animated Mesh Gradients */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/15 blur-[100px] pointer-events-none"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-primary/20 backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <div className="text-primary-foreground font-bold text-3xl">R</div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            Progress Flow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 mt-2 font-medium"
          >
            Rongo University Postgraduate Portal
          </motion.p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-white/50">
              Select your role and enter your credentials
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-6 pt-6">
              {/* Role Selection Tabs */}
              <div className="grid grid-cols-5 gap-2 pb-2">
                {(Object.keys(ROLE_ICONS) as UserRole[]).map((role) => {
                  const Icon = ROLE_ICONS[role];
                  const isSelected = selectedRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
                        isSelected 
                        ? "bg-primary text-white shadow-lg ring-1 ring-white/20" 
                        : "bg-white/5 text-white/40 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-[10px] uppercase font-bold tracking-wider truncate w-full text-center">
                        {role}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="space-y-2 relative group">
                  <Label htmlFor="email" className="text-white/80 font-medium ml-1">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@rongo.ac.ke" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-primary/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-white/80 font-medium">Password</Label>
                    <button type="button" className="text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-primary/40"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-full h-[1px] bg-white/10" />
                <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest px-2 whitespace-nowrap">Secure Access</span>
                <div className="w-full h-[1px] bg-white/10" />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                <Fingerprint className="text-primary animate-pulse" size={20} />
                <div className="text-[11px] text-white/60">
                  <span className="text-primary font-bold">Biometric available</span> - Touch ID or Face ID for {ROLE_LABELS[selectedRole]} account.
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <span>Sign In as {ROLE_LABELS[selectedRole]}</span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-white/40 text-sm">
            Don't have an account? <button className="text-primary font-bold hover:underline">Contact Registrar</button>
          </p>
          <p className="text-white/20 text-[10px] uppercase font-medium tracking-[0.2em] mt-8">
            © 2024 Rongo University | Excellence with Integrity
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
