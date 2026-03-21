import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useRole, UserRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Fingerprint, Mail, Lock, User, UserPlus, LogIn, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useRole();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error("Configuration Required", {
        description: "Supabase environment variables are not set. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      });
      return;
    }
    if (isResetMode) {
      handleForgotPassword();
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!firstName || !lastName || !loginIdentifier || !password) {
          throw new Error("All fields are required for registration.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: loginIdentifier,
          password,
          options: {
            data: { first_name: firstName, last_name: lastName },
          },
        });

        if (error) throw error;
        
        if (data.user) {
          // handle_new_user trigger inserts into users; no manual insert needed
          toast.success("Account created successfully!", {
            description: "You have been registered. You can now login.",
          });
          setIsSignUp(false); 
        }
      } else {
        let targetEmail = loginIdentifier;

        if (!loginIdentifier.includes('@')) {
           const { data: staffData } = await supabase.from('users').select('email').eq('staff_id', loginIdentifier).maybeSingle();
           if (staffData?.email) {
              targetEmail = staffData.email;
           } else {
              const { data: studentData } = await supabase.from('students').select('user_id').eq('registration_number', loginIdentifier).maybeSingle();
              if (studentData?.user_id) {
                 const { data: userData } = await supabase.from('users').select('email').eq('id', studentData.user_id).maybeSingle();
                 if (userData?.email) targetEmail = userData.email;
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
        
        setTimeout(() => navigate("/"), 500);
      }
    } catch (err: any) {
      toast.error(isSignUp ? "Registration Failed" : "Authentication Failed", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!loginIdentifier.includes('@')) {
      toast.error("Email Required", { description: "Please enter your registered email address." });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginIdentifier, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Recovery Email Sent");
    } catch (err: any) {
      toast.error("Recovery Failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const currentTitle = isResetMode ? "Recover Identity" : (isSignUp ? "Create Account" : "Welcome Back");
  const currentDescription = isResetMode ? "Provision a localized recovery link" : (isSignUp ? "Register a new student node" : "Authenticate to access your workspace");

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 md:p-6 bg-slate-950 font-sans">
      
      {/* BACKGROUND ELEMENTS */}
      <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2 }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center grayscale-[0.2] brightness-[0.4]" style={{ backgroundImage: 'url("/Gemini_Generated_Image_ug1yo5ug1yo5ug1y.png")' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-[#BF8C2C]/20 border border-white/10 backdrop-blur-md">
            <span className="text-3xl font-black text-[#BF8C2C]">R</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            <span className="text-[#14b5d9]">Progress</span> Flow
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Rongo University Postgraduate Portal</p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-white tracking-tight">{currentTitle}</CardTitle>
            <CardDescription className="text-white/50 text-xs">
              {currentDescription}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4 pt-4">
              {resetSent ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto border border-success/20">
                    <Mail className="text-success" size={24} />
                  </div>
                  <p className="text-white font-bold text-sm">Check Your Inbox</p>
                  <p className="text-white/40 text-[10px] leading-relaxed">A secure recovery node has been dispatched.</p>
                  <Button variant="ghost" className="text-[10px] text-white/60 hover:text-white" onClick={() => { setIsResetMode(false); setResetSent(false); }}>
                    <ArrowLeft size={14} className="mr-2" /> Back to Login
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {isSignUp && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-white/40 ml-1">First Name</Label>
                        <Input placeholder="E.g. John" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-white/5 border-white/10 text-white h-10 rounded-xl" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] uppercase font-bold text-white/40 ml-1">Last Name</Label>
                        <Input placeholder="E.g. Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-white/5 border-white/10 text-white h-10 rounded-xl" required />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-white/40 ml-1">{isResetMode ? "Registered Email" : "Admission No / Staff ID / Email"}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                      <Input placeholder={isResetMode ? "your@email.com" : "E.g. RU/PG/1001"} value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl" required />
                    </div>
                  </div>

                  {!isResetMode && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-[10px] uppercase font-bold text-white/40">Password</Label>
                        {!isSignUp && (
                          <button type="button" onClick={() => setIsResetMode(true)} className="text-[9px] font-black text-[#14b5d9] hover:underline uppercase tracking-widest">
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                        <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl" required minLength={6} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            {!resetSent && (
              <CardFooter className="flex flex-col gap-4 pb-8">
                <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl bg-[#14b5d9] hover:bg-[#14b5d9]/80 text-black font-black uppercase text-xs tracking-widest shadow-lg shadow-[#14b5d9]/20 transition-all active:scale-[0.98]">
                  {isLoading ? "Processing..." : (isResetMode ? "Send Recovery Link" : (isSignUp ? "Register Node" : "Secure Sign In"))}
                </Button>
                
                <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                   {isResetMode ? (
                      <button type="button" onClick={() => setIsResetMode(false)} className="text-white/40 hover:text-white flex items-center gap-2">
                        <ArrowLeft size={12} /> Back to Sign In
                      </button>
                   ) : (
                      <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-white/40 hover:text-white">
                        {isSignUp ? "Already have a node? Sign In" : "Request New Node? Create Account"}
                      </button>
                   )}
                </div>
              </CardFooter>
            )}
          </form>
        </Card>

        {/* SIMULATION PORTAL */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[8px] font-black uppercase text-white/20 tracking-[0.4em]">Simulation Deck</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['student', 'supervisor', 'admin'].map((role) => (
              <Button key={role} variant="outline" className="h-9 px-2 rounded-lg border-white/5 bg-white/5 text-[9px] font-black uppercase text-white/40 hover:bg-white/10 hover:text-white transition-all" onClick={() => { login(role as UserRole); navigate("/"); }}>
                {role}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
