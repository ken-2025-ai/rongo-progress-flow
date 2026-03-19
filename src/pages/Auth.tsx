import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Eye, EyeOff, BookOpen, Users, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import rongoLogo from "@/assets/rongo-logo.png";

type AuthMode = "login" | "signup";

const FEATURES = [
  { icon: BookOpen, title: "Thesis Tracking", desc: "Monitor your research progress in real-time" },
  { icon: Users, title: "Supervisor Connect", desc: "Seamless communication with your panel" },
  { icon: Award, title: "Milestone Management", desc: "Stay on track with structured milestones" },
];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!", { description: "You've been signed in successfully." });
        navigate("/");
      }
    } catch (error: any) {
      toast.error("Authentication failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Campus Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/campus-bg.jpg")' }}
        />
        {/* Deep blue overlay matching sidebar brand */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(213,55%,18%)] via-[hsl(213,55%,22%)/0.92] to-[hsl(213,55%,28%)/0.85]" />
        
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo + Title */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <img src={rongoLogo} alt="Rongo University" className="w-14 h-14 rounded-2xl shadow-lg" />
              <div>
                <h2 className="text-white font-bold text-xl tracking-tight">Rongo University</h2>
                <p className="text-white/50 text-sm font-medium">School of Postgraduate Studies</p>
              </div>
            </motion.div>
          </div>

          {/* Hero Text */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <h1 className="text-5xl font-bold text-white leading-[1.1] tracking-tight">
                Progress
                <br />
                <span className="text-accent">Flow</span>
              </h1>
              <p className="text-white/60 mt-4 text-lg max-w-md leading-relaxed">
                Your research journey, streamlined. Track milestones, connect with supervisors, and achieve excellence.
              </p>
            </motion.div>

            {/* Feature Cards */}
            <div className="space-y-3">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20 text-accent shrink-0">
                    <feature.icon size={20} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{feature.title}</p>
                    <p className="text-white/40 text-xs">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/20 text-xs font-medium"
          >
            © 2024 Rongo University · Excellence with Integrity
          </motion.p>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background relative overflow-hidden">
        {/* Subtle accent gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={rongoLogo} alt="Rongo University" className="w-12 h-12 rounded-xl" />
            <div>
              <h2 className="text-foreground font-bold text-lg">Progress Flow</h2>
              <p className="text-muted-foreground text-xs">Rongo University</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  {mode === "login" ? "Welcome back" : "Get started"}
                </h1>
                <p className="text-muted-foreground mt-2">
                  {mode === "login"
                    ? "Sign in to your postgraduate portal"
                    : "Create your account to begin"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground font-medium text-sm">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11 h-12 rounded-[var(--radius)] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@rongo.ac.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-[var(--radius)] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-foreground font-medium text-sm">
                  Password
                </Label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11 h-12 rounded-[var(--radius)] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus:bg-background focus:border-primary transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-[var(--radius)] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/15 transition-all active:scale-[0.98] group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>{mode === "login" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground/50 text-xs font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-primary font-semibold hover:underline underline-offset-4 transition-all"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Mobile footer */}
          <p className="lg:hidden text-center text-muted-foreground/40 text-[10px] uppercase tracking-[0.15em] mt-10">
            © 2024 Rongo University · Excellence with Integrity
          </p>
        </motion.div>
      </div>
    </div>
  );
}
