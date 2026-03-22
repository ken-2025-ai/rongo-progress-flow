import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setHasRecoverySession(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isRecovery = session?.user?.recovery_sent_at != null || window.location.hash.includes("type=recovery");
      setHasRecoverySession(isRecovery || !!session);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("All fields required");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (!isSupabaseConfigured) {
      toast.error("Configuration required");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsSuccess(true);
      toast.success("Password updated");
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      toast.error("Update failed", { description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (hasRecoverySession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (hasRecoverySession === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <Card className="max-w-md border-white/10 bg-black/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white">Invalid or expired link</CardTitle>
            <CardDescription className="text-white/60">
              This reset link is invalid or has expired. Request a new one from the login page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")} variant="outline" className="border-white/20 text-white">
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <Card className="max-w-md border-white/10 bg-black/40 backdrop-blur-xl text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-success" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Password updated</h2>
            <p className="text-white/60 text-sm">Redirecting you to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4 md:p-6 bg-slate-950">
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-[#BF8C2C]/20 border border-white/10 backdrop-blur-md">
            <span className="text-3xl font-black text-[#BF8C2C]">R</span>
          </div>
          <h1 className="text-2xl font-black text-white">
            <span className="text-[#14b5d9]">Reset</span> Password
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Set a new password for your account
          </p>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="text-white">New password</CardTitle>
              <CardDescription className="text-white/50 text-xs">
                Choose a strong password (at least 6 characters).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-white/40">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold text-white/40">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-xl"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#14b5d9] hover:bg-[#14b5d9]/80 text-black font-black uppercase text-xs tracking-widest"
              >
                {isLoading ? "Updating..." : "Update password"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-[10px] text-white/60 hover:text-white"
                onClick={() => navigate("/")}
              >
                <ArrowLeft size={14} className="mr-2" /> Back to Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
