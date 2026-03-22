import { useState } from "react";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, GitBranch, CalendarDays, ClipboardCheck,
  Sparkles, FileBarChart, Bell, Shield, Settings, LogOut, User, Users, ChevronLeft, ChevronRight,
  UserPlus, Briefcase, Building2, Key, Activity, Server
} from "lucide-react";
import rongoLogo from "@/assets/rongo-logo.png";

interface NavSection {
  label: string;
  items: { title: string; url: string; icon: React.ElementType; roles: string[] }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { title: "My Research Overview", url: "/", icon: LayoutDashboard, roles: ["student", "supervisor", "panel", "admin", "school_admin", "dean"] },
      { title: "My Academic Profile", url: "/profile", icon: User, roles: ["student", "supervisor", "panel", "admin", "school_admin", "dean"] },
    ],
  },
  {
    label: "DEPARTMENT MANAGEMENT",
    items: [
      { title: "Seminar Booking Requests", url: "/booking-requests", icon: CalendarDays, roles: ["admin"] },
      { title: "Seminar Sessions", url: "/sessions", icon: ClipboardCheck, roles: ["admin"] },
      { title: "Student Progress Control", url: "/progress-control", icon: GitBranch, roles: ["admin"] },
      { title: "Department Decisions", url: "/decisions", icon: FileBarChart, roles: ["admin"] },
    ],
  },
  {
    label: "SCHOOL LEVEL MANAGEMENT",
    items: [
      { title: "School Seminar Queue", url: "/school-queue", icon: Users, roles: ["school_admin"] },
      { title: "School Seminar Schedule", url: "/school-sessions", icon: CalendarDays, roles: ["school_admin"] },
      { title: "School Decisions", url: "/school-decisions", icon: FileBarChart, roles: ["school_admin"] },
      { title: "Thesis Readiness Check", url: "/thesis-clearance", icon: Shield, roles: ["school_admin"] },
    ],
  },
  {
    label: "POSTGRADUATE EXAMINATION",
    items: [
      { title: "Candidates Ready", url: "/dean-queue", icon: Users, roles: ["dean"] },
      { title: "Examiner Assignment", url: "/examiner-assignment", icon: ClipboardCheck, roles: ["dean"] },
      { title: "Viva Scheduling", url: "/viva-scheduling", icon: CalendarDays, roles: ["dean"] },
      { title: "Examination Decisions", url: "/viva-decisions", icon: FileBarChart, roles: ["dean"] },
      { title: "Final Clearance", url: "/final-clearance", icon: Sparkles, roles: ["dean"] },
    ],
  },
  {
    label: "SUPERVISION DASHBOARD",
    items: [
      { title: "My Students", url: "/students", icon: User, roles: ["supervisor"] },
      { title: "Seminar Readiness", url: "/readiness", icon: ClipboardCheck, roles: ["supervisor"] },
      { title: "Corrections Verification", url: "/verification", icon: Sparkles, roles: ["supervisor"] },
      { title: "Progress Reports Review", url: "/reports-review", icon: FileBarChart, roles: ["supervisor"] },
    ],
  },
  {
    label: "ACADEMIC EVALUATION (PANEL)",
    items: [
      { title: "My Evaluations", url: "/evaluations", icon: ClipboardCheck, roles: ["panel"] },
      { title: "Upcoming Viva Sessions", url: "/panel-schedule", icon: CalendarDays, roles: ["panel"] },
      { title: "Submitted Evaluations", url: "/submitted-evaluations", icon: FileBarChart, roles: ["panel"] },
    ],
  },
  {
    label: "RESEARCH PROGRESS",
    items: [
      { title: "Research Journey", url: "/journey", icon: GitBranch, roles: ["student", "supervisor", "dean"] },
      { title: "Book Seminar Presentation", url: "/booking", icon: CalendarDays, roles: ["student"] },
      { title: "Seminar Feedback", url: "/feedback", icon: ClipboardCheck, roles: ["student", "supervisor", "panel"] },
      { title: "Review & Fix Corrections", url: "/corrections", icon: Sparkles, roles: ["student", "supervisor", "panel"] },
      { title: "Progress Reports Submission", url: "/reports", icon: FileBarChart, roles: ["student", "supervisor", "dean"] },
    ],
  },
  {
    label: "THESIS & EXAMINATION",
    items: [
      { title: "Submit Thesis", url: "/submit-thesis", icon: FileBarChart, roles: ["student", "supervisor", "dean"] },
      { title: "Examination Status", url: "/examination-status", icon: Shield, roles: ["student", "supervisor", "dean"] },
      { title: "Academic Updates", url: "/updates", icon: Bell, roles: ["student", "supervisor", "panel", "admin", "school_admin", "dean"] },
      { title: "Account Settings", url: "/settings", icon: Settings, roles: ["student", "supervisor", "panel", "admin", "school_admin", "dean"] },
    ],
  },
  {
    label: "SYSTEM GOVERNANCE (SUPER ADMIN)",
    items: [
      { title: "System Overview", url: "/", icon: LayoutDashboard, roles: ["super_admin"] },
      { title: "Student Registry", url: "/student-registry", icon: UserPlus, roles: ["super_admin"] },
      { title: "Staff Registry", url: "/staff-registry", icon: Briefcase, roles: ["super_admin"] },
      { title: "Academic Structure", url: "/academic-structure", icon: Building2, roles: ["super_admin"] },
      { title: "Role Assignment", url: "/role-assignment", icon: Key, roles: ["super_admin"] },
      { title: "Workflow Monitor", url: "/workflow-monitor", icon: Activity, roles: ["super_admin"] },
      { title: "System Logs", url: "/system-logs", icon: Server, roles: ["super_admin"] },
      { title: "Global Settings", url: "/settings", icon: Settings, roles: ["super_admin"] },
    ],
  },
];

export function AppSidebar({ 
  collapsed, 
  onToggle, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: { 
  collapsed: boolean; 
  onToggle: () => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (val: boolean) => void;
}) {
  const { currentRole } = useRole();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-transform overflow-hidden md:translate-x-0 ${
        mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      } ${
        collapsed ? "md:w-16" : "w-64 md:w-60"
      }`}
    >
      {/* Logo Area - Scholastic White Transition */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 flex-shrink-0 bg-white shadow-sm z-50">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-1 group-hover:scale-105 transition-transform">
          <img src={rongoLogo} alt="Rongo University" className="h-8 w-8 shrink-0 object-contain" />
        </div>
        {(!collapsed || mobileMenuOpen) && (
          <div className="flex flex-col">
            <span className="text-xs font-black leading-none text-primary tracking-tighter">RONGO</span>
            <span className="text-[10px] font-black leading-none text-slate-400 mt-1 uppercase tracking-widest">University</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-6 md:space-y-4 pb-20">
        {NAV_SECTIONS.map(section => {
          const filteredItems = section.items.filter(item => item.roles.includes(currentRole));
          if (filteredItems.length === 0) return null;
          return (
            <div key={section.label}>
              {(!collapsed || mobileMenuOpen) && (
                <p className="text-[10px] font-bold text-sidebar-primary px-2 mb-2 tracking-widest uppercase opacity-70">{section.label}</p>
              )}
              <div className="space-y-1">
                {filteredItems.map(item => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    end={item.url === "/"}
                    onClick={() => setMobileMenuOpen?.(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-sidebar-foreground font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      (collapsed && !mobileMenuOpen) ? "md:justify-center px-0 py-2.5" : ""
                    }`}
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {(!collapsed || mobileMenuOpen) && <span>{item.title}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle (Desktop only) */}
      <button
        onClick={onToggle}
        className="hidden md:flex h-12 items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0 w-full"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
