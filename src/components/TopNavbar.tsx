import { useRole, ROLE_LABELS, type UserRole } from "@/contexts/RoleContext";
import { Bell, Search, ChevronDown, Menu, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

export function TopNavbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { currentRole, setCurrentRole, user, roleLabel, allRoles, logout } = useRole();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 bg-topbar text-topbar-foreground px-4 md:px-6">
      {/* Hamburger */}
      <button 
        className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/10 transition-colors md:hidden -ml-2"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative max-w-xs">
        <Input
          placeholder="Search..."
          className="h-8 pl-3 pr-8 text-sm bg-white/10 border-white/20 text-topbar-foreground placeholder:text-white/50 focus:bg-white/20"
        />
        <Search className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
      </div>

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-white/10 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-semibold">
              {user.avatar}
            </div>
            <span className="text-sm font-medium">{user.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Switch Role
          </div>
          {allRoles.map(role => (
            <DropdownMenuItem key={role} onClick={() => setCurrentRole(role)} className="cursor-pointer">
              {ROLE_LABELS[role]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
