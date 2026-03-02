import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

export default function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1">
        <header className="flex items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger className="md:hidden" />
        </header>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
