import { useRole, ROLE_LABELS, type UserRole } from "@/contexts/RoleContext";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, GitBranch, CalendarDays, ClipboardCheck,
  Sparkles, FileBarChart, Bell, Shield, Settings, LogOut, ChevronDown
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, roles: ["student", "supervisor", "panel", "admin", "dean"] },
  { title: "Pipeline Tracker", url: "/pipeline", icon: GitBranch, roles: ["student", "supervisor", "dean"] },
  { title: "Presentation Booking", url: "/presentations", icon: CalendarDays, roles: ["student", "admin"] },
  { title: "Assessment Rubric", url: "/assessment", icon: ClipboardCheck, roles: ["panel", "supervisor"] },
  { title: "AI Corrections", url: "/corrections", icon: Sparkles, roles: ["student", "supervisor", "panel"] },
  { title: "Quarterly Reports", url: "/reports", icon: FileBarChart, roles: ["student", "supervisor", "dean"] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ["student", "supervisor", "panel", "admin", "dean"] },
  { title: "Admin Overview", url: "/admin", icon: Shield, roles: ["admin", "dean"] },
  { title: "Settings", url: "/settings", icon: Settings, roles: ["student", "supervisor", "panel", "admin", "dean"] },
];

const ROLE_COLORS: Record<UserRole, string> = {
  student: "bg-secondary/20 text-secondary",
  supervisor: "bg-primary/20 text-primary-foreground",
  panel: "bg-muted text-muted-foreground",
  admin: "bg-secondary/30 text-secondary",
  dean: "bg-secondary/40 text-secondary",
};

export function AppSidebar() {
  const { currentRole, setCurrentRole, user, roleLabel, allRoles } = useRole();

  const filteredItems = NAV_ITEMS.filter(item =>
    item.roles.includes(currentRole)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary font-bold text-secondary-foreground text-sm">
          RU
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold leading-none text-sidebar-foreground">RONGO</span>
          <span className="text-[10px] leading-none text-sidebar-foreground/60">PG Assessment</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {filteredItems.map(item => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* User / Role Switcher */}
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-muted text-xs font-semibold text-sidebar-foreground avatar-outline">
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
                <p className="truncate text-[10px] text-sidebar-foreground/50">{roleLabel}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <p className="label-uppercase px-2 py-1.5 text-muted-foreground">Switch Role</p>
            {allRoles.map(role => (
              <DropdownMenuItem
                key={role}
                onClick={() => setCurrentRole(role)}
                className={currentRole === role ? "bg-muted font-medium" : ""}
              >
                {ROLE_LABELS[role]}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="text-destructive mt-1">
              <LogOut className="h-3.5 w-3.5 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
