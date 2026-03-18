import { useRole, ROLE_LABELS, type UserRole } from "@/contexts/RoleContext";
import { Bell, Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  student: "bg-primary/10 text-primary",
  supervisor: "bg-primary/10 text-primary",
  panel: "bg-muted text-muted-foreground",
  admin: "bg-secondary/20 text-accent-foreground",
  dean: "bg-secondary/20 text-accent-foreground",
};

export function TopNavbar() {
  const { currentRole, setCurrentRole, user, roleLabel, allRoles } = useRole();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students, reports, presentations…"
          className="h-8 pl-8 text-sm bg-background border-border"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Role badge */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${ROLE_BADGE_CLASSES[currentRole]}`}>
              {roleLabel}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allRoles.map(role => (
              <DropdownMenuItem key={role} onClick={() => setCurrentRole(role)}>
                {ROLE_LABELS[role]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground avatar-outline">
          {user.avatar}
        </div>
      </div>
    </header>
  );
}
