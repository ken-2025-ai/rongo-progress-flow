import { useRole, type UserRole, ROLE_LABELS } from "@/contexts/RoleContext";
import { Bell, Search, ChevronDown, Menu, LogOut, ShieldCheck, User, Sparkles, Wand2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, 
  DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function TopNavbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { currentRole, switchRole, user, roleLabel, availableRoles, logout } = useRole();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 bg-topbar text-topbar-foreground px-4 md:px-8 border-b border-white/5 shadow-2xl backdrop-blur-md">
      
      {/* Mobile Trigger */}
      <button 
        className="flex h-12 w-12 items-center justify-center rounded-xl hover:bg-white/10 transition-all md:hidden -ml-2 group"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      <div className="flex-1" />

      {/* Global Intelligence Search */}
      <div className="relative group hidden sm:block">
        <Input
          placeholder="Search institutional nodes..."
          className="h-10 w-[300px] pl-4 pr-10 text-sm bg-white/5 border-white/10 text-topbar-foreground placeholder:text-white/30 focus:bg-white/10 focus:w-[400px] transition-all rounded-2xl"
        />
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" />
      </div>

      <div className="flex items-center gap-4">
        {/* Active Badge */}
        <Badge variant="outline" className="hidden lg:flex bg-white/5 border-white/10 text-white/60 font-black text-[9px] uppercase tracking-widest px-3 py-1 gap-2 rounded-full h-8">
           <ShieldCheck size={12} className="text-primary"/> Active Portal: <span className="text-white italic">{roleLabel}</span>
        </Badge>
        
        <button className="h-10 w-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all relative group">
           <Bell size={18} className="text-white/60 group-hover:text-white" />
           <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border-2 border-topbar pulse-shimmer" />
        </button>

        <div className="h-8 w-px bg-white/10 mx-1" />

        {/* Unified Identity Node */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 rounded-2xl p-1 pr-3 hover:bg-white/10 transition-all border border-transparent hover:border-white/5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white text-xs font-black shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                {user?.avatar}
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-xs font-black tracking-tight leading-none text-white">{user?.name}</span>
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1 italic">{roleLabel}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-white/40 group-hover:text-white transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-2 bg-card border-border shadow-4xl rounded-2xl">
            <DropdownMenuLabel className="px-4 py-3">
               <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Identity Profile</p>
                  <p className="text-sm font-black text-foreground">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground italic truncate">{user?.email}</p>
               </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="opacity-50" />
            
            <DropdownMenuLabel className="px-4 py-3 flex items-center justify-between">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Switch Perspective</span>
               <Wand2 size={12} className="text-primary animate-pulse" />
            </DropdownMenuLabel>

            {availableRoles.map((role) => (
               <DropdownMenuItem 
                  key={role} 
                  onClick={() => switchRole(role)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1 ${
                    currentRole === role 
                      ? "bg-primary text-white font-black" 
                      : "hover:bg-muted/50 text-foreground/80 font-bold"
                  }`}
               >
                  <div className="flex items-center gap-3">
                     <span className="text-lg">{role === 'student' ? '🎓' : role === 'dean' ? '📜' : '🏢'}</span>
                     <span className="text-xs">{ROLE_LABELS[role]}</span>
                  </div>
                  {currentRole === role && <ShieldCheck size={14} className="text-white" />}
               </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator className="opacity-50 mt-2" />
            
            <DropdownMenuItem className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold hover:bg-muted/50 rounded-xl cursor-pointer">
               <User size={16} className="text-muted-foreground" /> Account Settings
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={() => logout()} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-destructive hover:bg-destructive/5 rounded-xl cursor-pointer mt-1">
              <LogOut size={16} /> Log Out System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
