import { useState } from "react";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, GitBranch, CalendarDays, ClipboardCheck,
  Sparkles, FileBarChart, Bell, Shield, Settings, LogOut, User, ChevronLeft, ChevronRight
} from "lucide-react";
import rongoLogo from "@/assets/rongo-logo.png";

interface NavSection {
  label: string;
  items: { title: string; url: string; icon: React.ElementType; roles: string[] }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "DASHBOARD",
    items: [
      { title: "Personal Profile", url: "/", icon: User, roles: ["student", "supervisor", "panel", "admin", "dean"] },
    ],
  },
  {
    label: "ACADEMICS",
    items: [
      { title: "Pipeline Tracker", url: "/pipeline", icon: GitBranch, roles: ["student", "supervisor", "dean"] },
      { title: "Presentation Booking", url: "/presentations", icon: CalendarDays, roles: ["student", "admin"] },
      { title: "Assessment Rubric", url: "/assessment", icon: ClipboardCheck, roles: ["panel", "supervisor"] },
      { title: "AI Corrections", url: "/corrections", icon: Sparkles, roles: ["student", "supervisor", "panel"] },
      { title: "Quarterly Reports", url: "/reports", icon: FileBarChart, roles: ["student", "supervisor", "dean"] },
    ],
  },
  {
    label: "THESIS",
    items: [
      { title: "Notifications", url: "/notifications", icon: Bell, roles: ["student", "supervisor", "panel", "admin", "dean"] },
      { title: "Admin Overview", url: "/admin", icon: Shield, roles: ["admin", "dean"] },
      { title: "Settings", url: "/settings", icon: Settings, roles: ["student", "supervisor", "panel", "admin", "dean"] },
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
            <span className="text-xs font-bold leading-none text-sidebar-foreground">RONGO</span>
            <span className="text-[10px] leading-none text-sidebar-muted-foreground opacity-70">UNIVERSITY</span>
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
