import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "login" | "signup";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email", {
          description: "We've sent you a verification link to confirm your account.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!", {
          description: "You've been signed in successfully.",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast.error("Authentication failed", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-6">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/rongo_university_campus_abstract_1773834339638.png")',
          filter: "brightness(0.35) saturate(0.8)",
        }}
      />

      {/* Animated gradients */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3], x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-accent/15 blur-[100px] pointer-events-none"
      />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-3xl bg-primary/20 backdrop-blur-md border border-white/20 shadow-2xl"
          >
            <GraduationCap className="text-primary-foreground" size={36} />
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
            <CardTitle className="text-2xl text-white">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-white/50">
              {mode === "login"
                ? "Enter your credentials to sign in"
                : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {mode === "signup" && (
                <div className="space-y-2 relative group">
                  <Label htmlFor="fullName" className="text-white/80 font-medium ml-1">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors" size={18} />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 rounded-xl focus:bg-white/10 transition-all focus:ring-primary/40"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 relative group">
                <Label htmlFor="email" className="text-white/80 font-medium ml-1">
                  Email address
                </Label>
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
                <Label htmlFor="password" className="text-white/80 font-medium ml-1">
                  Password
                </Label>
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
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pb-8">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                  </div>
                ) : (
                  <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-white/50 text-sm hover:text-white/80 transition-colors"
              >
                {mode === "login" ? (
                  <>Don't have an account? <span className="text-primary font-bold">Sign Up</span></>
                ) : (
                  <>Already have an account? <span className="text-primary font-bold">Sign In</span></>
                )}
              </button>
            </CardFooter>
          </form>
        </Card>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/20 text-[10px] uppercase font-medium tracking-[0.2em] mt-8 text-center"
        >
          © 2024 Rongo University | Excellence with Integrity
        </motion.p>
      </motion.div>
    </div>
  );
}
