import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full relative">
      <AppSidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(c => !c)} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className={`flex flex-1 flex-col transition-all duration-300 w-full ${collapsed ? "md:pl-16" : "md:pl-60"}`}>
        <TopNavbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />
        <div className="h-1 bg-accent w-full" />
        <main className="flex-1 p-4 md:p-6 w-full max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
