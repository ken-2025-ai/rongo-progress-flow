import { useRole } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import { StudentDashboard } from "@/components/dashboards/StudentDashboard";
import { SupervisorDashboard } from "@/components/dashboards/SupervisorDashboard";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { DeanDashboard } from "@/components/dashboards/DeanDashboard";
import { PanelDashboard } from "@/components/dashboards/PanelDashboard";

const DASHBOARD_TITLES = {
  student: "Dashboard",
  supervisor: "Supervisor Dashboard",
  panel: "Assessment Panel",
  admin: "Admin Overview",
  dean: "Dean's Command Center",
};

export default function Index() {
  const { currentRole, user } = useRole();

  return (
    <AppLayout>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-foreground">{DASHBOARD_TITLES[currentRole]}</h1>
      </div>

      {/* Section header bar like reference */}
      <div className="section-header mb-5">Basic Information</div>

      {currentRole === "student" && <StudentDashboard />}
      {currentRole === "supervisor" && <SupervisorDashboard />}
      {currentRole === "admin" && <AdminDashboard />}
      {currentRole === "dean" && <DeanDashboard />}
      {currentRole === "panel" && <PanelDashboard />}
    </AppLayout>
  );
}
