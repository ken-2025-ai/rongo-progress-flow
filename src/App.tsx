import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import Dashboard from "./pages/Dashboard.tsx";
import Login from "./pages/Index.tsx";
import SuperAdminLogin from "./pages/SuperAdminLogin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-white/60 text-sm tracking-widest uppercase font-bold animate-pulse">
               Validating Session...
            </p>
         </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/system-admin" element={<SuperAdminLogin />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/profile" element={<Dashboard />} />
      <Route path="/journey" element={<Dashboard />} />
      <Route path="/booking" element={<Dashboard />} />
      <Route path="/feedback" element={<Dashboard />} />
      <Route path="/corrections" element={<Dashboard />} />
      <Route path="/reports" element={<Dashboard />} />
      <Route path="/submit-thesis" element={<Dashboard />} />
      <Route path="/examination-status" element={<Dashboard />} />
      <Route path="/updates" element={<Dashboard />} />
      <Route path="/settings" element={<Dashboard />} />
      
      {/* Supervisor specific routes */}
      <Route path="/students" element={<Dashboard />} />
      <Route path="/readiness" element={<Dashboard />} />
      <Route path="/verification" element={<Dashboard />} />
      <Route path="/reports-review" element={<Dashboard />} />
      <Route path="/thesis-exams" element={<Dashboard />} />

      {/* Admin specific routes */}
      <Route path="/booking-requests" element={<Dashboard />} />
      <Route path="/sessions" element={<Dashboard />} />
      <Route path="/progress-control" element={<Dashboard />} />
      <Route path="/decisions" element={<Dashboard />} />

      {/* School Admin specific routes */}
      <Route path="/school-queue" element={<Dashboard />} />
      <Route path="/school-sessions" element={<Dashboard />} />
      <Route path="/school-decisions" element={<Dashboard />} />
      <Route path="/thesis-clearance" element={<Dashboard />} />

      {/* Dean specific routes */}
      <Route path="/dean-queue" element={<Dashboard />} />
      <Route path="/examiner-assignment" element={<Dashboard />} />
      <Route path="/viva-scheduling" element={<Dashboard />} />
      <Route path="/viva-decisions" element={<Dashboard />} />
      <Route path="/final-clearance" element={<Dashboard />} />

      {/* Panel specific routes */}
      <Route path="/evaluations" element={<Dashboard />} />
      <Route path="/panel-schedule" element={<Dashboard />} />
      <Route path="/submitted-evaluations" element={<Dashboard />} />

      {/* Super Admin specific routes */}
      <Route path="/student-registry" element={<Dashboard />} />
      <Route path="/staff-registry" element={<Dashboard />} />
      <Route path="/academic-structure" element={<Dashboard />} />
      <Route path="/role-assignment" element={<Dashboard />} />
      <Route path="/workflow-monitor" element={<Dashboard />} />
      <Route path="/system-logs" element={<Dashboard />} />

      {/* Fallback */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RoleProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </RoleProvider>
  </QueryClientProvider>
);

export default App;
