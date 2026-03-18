import { useState } from "react";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, GitBranch, CalendarDays, ClipboardCheck,
  Sparkles, FileBarChart, Bell, Shield, Settings, LogOut, User, Users, ChevronLeft, ChevronRight
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
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { currentRole } = useRole();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <img src={rongoLogo} alt="Rongo University" className="h-9 w-9 shrink-0 object-contain" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-none text-container-header">RONGO</span>
            <span className="text-[10px] leading-none text-sidebar-foreground">UNIVERSITY</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {NAV_SECTIONS.map(section => {
          const filteredItems = section.items.filter(item => item.roles.includes(currentRole));
          if (filteredItems.length === 0) return null;
          return (
            <div key={section.label}>
              {!collapsed && (
                <p className="label-uppercase text-sidebar-primary px-2 mb-1.5">{section.label}</p>
              )}
              <div className="space-y-0.5">
                {filteredItems.map(item => (
                  <NavLink
                    key={item.url}
                    to={item.url}
                    end={item.url === "/"}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      collapsed ? "justify-center" : ""
                    }`}
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
