import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";

export function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className={`flex flex-1 flex-col transition-all duration-300 ${collapsed ? "pl-16" : "pl-60"}`}>
        <TopNavbar />
        <div className="h-1 bg-accent w-full" />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
