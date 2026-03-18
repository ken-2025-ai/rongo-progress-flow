import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TopNavbar } from "@/components/TopNavbar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div className="flex flex-1 flex-col pl-60">
        <TopNavbar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
