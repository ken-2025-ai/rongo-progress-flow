import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRole, UserRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, Mail, Lock, User, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useRole();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow (Always requires email for new auth nodes)
        if (!firstName || !lastName || !loginIdentifier || !password) {
          throw new Error("All fields are required for registration.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: loginIdentifier,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          // @ts-ignore
          const { error: dbError } = await supabase.from('users').insert({
             id: data.user.id,
             email: data.user.email,
             first_name: firstName,
             last_name: lastName,
             role: 'STUDENT'
          });

          if (dbError) throw dbError;

          toast.success("Account created successfully!", {
            description: "You have been registered. You can now login.",
          });
          setIsSignUp(false); 
        }
      } else {
        // Log In Flow - Supports Email OR admission_no OR staff_id
        let targetEmail = loginIdentifier;

        // Perform lookup if it's not looking like an email
        if (!loginIdentifier.includes('@')) {
           // 1. Try Staff Registry
           // @ts-ignore
           const { data: staffData } = await supabase.from('users').select('email').eq('staff_id', loginIdentifier).maybeSingle();
           
           // @ts-ignore
           if (staffData?.email) {
              // @ts-ignore
              targetEmail = staffData.email;
           } else {
              // 2. Try Student Registry
              // @ts-ignore
              const { data: studentData } = await supabase.from('students').select('user_id').eq('registration_number', loginIdentifier).maybeSingle();
              
              // @ts-ignore
              if (studentData?.user_id) {
                 // @ts-ignore
                 const { data: userData } = await supabase.from('users').select('email').eq('id', studentData.user_id).maybeSingle();
                 // @ts-ignore
                 if (userData?.email) {
                    // @ts-ignore
                    targetEmail = userData.email;
                 }
              }
           }
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password,
        });

        if (error) throw error;

        toast.success(`Authentication Successful`, {
          description: "Welcome back to Rongo Progress Flow.",
        });
        
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    } catch (err: any) {
      toast.error(isSignUp ? "Registration Failed" : "Authentication Failed", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 md:p-6 bg-slate-950 font-sans">
      
      {/* PROFESSIONAL SCHOLASTIC BACKDROP - LAYER 0 */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat grayscale-[0.2] contrast-[1.1] brightness-[0.4]"
          style={{ 
            backgroundImage: 'url("/rongo_university_campus.jpg")',
          }}
        />
        {/* DESIGNER OVERLAY: Atmospheric Gradient */}
        <div 
          className="absolute inset-0 mix-blend-overlay opacity-60"
          style={{ 
            background: 'radial-gradient(circle at 70% 30%, #BF8C2C 0%, transparent 60%), radial-gradient(circle at 10% 80%, #14b5d9 0%, transparent 50%)' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </motion.div>

      {/* DYNAMIC AMBIENCE - LAYER 1 */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[100%] h-[100%] opacity-20 blur-[150px]"
          style={{ background: 'conic-gradient(from 0deg, #BF8C2C, #14b5d9, #BF8C2C)' }}
        />
      </div>
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          x: [0, -50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-15 blur-[100px] pointer-events-none"
        style={{ backgroundColor: '#BF8C2C' }}
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
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden relative group"
            style={{ backgroundColor: '#BF8C2C33' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#BF8C2C]/20 to-transparent group-hover:scale-110 transition-transform" />
            <div className="relative font-black text-4xl" style={{ color: '#BF8C2C' }}>R</div>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black tracking-tight"
          >
            <span style={{ color: '#14b5d9' }}>Progress</span> <span style={{ color: '#BF8C2C' }}>Flow</span>
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
            <CardTitle className="text-2xl text-white">{isSignUp ? "Create Account" : "Welcome Back"}</CardTitle>
            <CardDescription className="text-white/50">
              {isSignUp ? "Register a new student node" : "Authenticate to access your workspace"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleAuth}>
            <CardContent className="space-y-6 pt-4">
              
              <div className="space-y-4">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 relative group">
                      <Label htmlFor="firstName" className="text-white/80 font-medium ml-1">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                        <Input 
                          id="firstName" 
                          placeholder="John" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-primary/40"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 relative group">
                      <Label htmlFor="lastName" className="text-white/80 font-medium ml-1">Last Name</Label>
                      <div className="relative">
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-4 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-primary/40"
                          required={isSignUp}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 relative group">
                  <Label htmlFor="loginIdentifier" className="text-white/80 font-medium ml-1">Admission No / Staff ID / Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <Input 
                      id="loginIdentifier" 
                      type="text" 
                      placeholder="e.g. RU/PG/1001 or Student ID" 
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-primary/40"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 relative group">
                  <div className="flex justify-between items-center ml-1">
                    <Label htmlFor="password" className="text-white/80 font-medium">Password</Label>
                    {!isSignUp && (
                      <button type="button" className="text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider">
                        Forgot?
                      </button>
                    )}
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
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {!isSignUp && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-full h-[1px] bg-white/10" />
                    <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest px-2 whitespace-nowrap">Secure Access</span>
                    <div className="w-full h-[1px] bg-white/10" />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Fingerprint className="text-primary animate-pulse" size={20} />
                    <div className="text-[11px] text-white/60">
                      <span className="text-primary font-bold">Biometric available</span> - Touch ID or Face ID enabled.
                    </div>
                  </div>
                </>
              )}
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
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? <UserPlus size={18}/> : <LogIn size={18}/>}
                    {isSignUp ? "Register Account" : "Secure Sign In"}
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Quick Access Testing Portal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 w-full max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-white/10" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 whitespace-nowrap px-4 bg-[#BF8C2C]/5 border border-[#BF8C2C]/10 py-2 rounded-full backdrop-blur-sm">
              Scholastic Testing Portal
            </h2>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { role: "Student", id: "student", label: "Scholar", color: "border-white/5 bg-white/5" },
              { role: "Supervisor", id: "supervisor", label: "Supervisor", color: "border-primary/20 bg-primary/5" },
              { role: "Dept Coord", id: "admin", label: "Dept Admin", color: "border-[#BF8C2C]/20 bg-[#BF8C2C]/5" },
              { role: "School Coord", id: "school_admin", label: "School Admin", color: "border-primary/30 bg-primary/10" },
              { role: "PG Dean", id: "dean", label: "Dean", color: "border-success/20 bg-success/5" },
              { role: "System Admin", id: "super_admin", label: "Global Admin", color: "border-destructive/20 bg-destructive/5" },
            ].map((cred) => (
              <button
                key={cred.id}
                type="button"
                onClick={() => {
                  login(cred.id as any);
                  toast.success(`Simulation Active: ${cred.label}`, {
                    description: "Handshake bypassed. Entered scholastic simulation portal."
                  });
                  setTimeout(() => navigate("/"), 500);
                }}
                className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.05] active:scale-[0.95] group hover:border-white/40 ${cred.color} backdrop-blur-sm`}
              >
                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1 group-hover:text-white transition-colors">
                  {cred.role}
                </p>
                <div className="space-y-0.5">
                  <p className="text-[8px] font-mono text-white/30 truncate">Bypass Auth...</p>
                  <p className="text-[8px] font-mono text-white/50">Instant Access</p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic flex items-center justify-center gap-2">
              <LogIn size={10} /> Select a role node to instantly ENTER the scholastic simulation (No Password Required)
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
