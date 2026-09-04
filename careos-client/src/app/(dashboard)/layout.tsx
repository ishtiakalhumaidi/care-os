import React from "react";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getMe } from "@/services/user.services";
import { SidebarProvider } from "@/components/providers/SidebarContext";

export const dynamic = "force-dynamic";

export default async function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      {/* Root: locked to exact viewport height, never scrolls */}
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar: NO hidden wrapper here. The component handles mobile + desktop itself. */}
        <div className="h-full shrink-0">
          <DashboardSidebar role={user.role} />
        </div>

        {/* Right column: capped at viewport, column layout */}
        <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
          <DashboardNavbar />
          {/* min-h-0 is required so flex can shrink this child below its content height */}
          <main className="flex-1 min-h-0 overflow-y-auto bg-background">
            <div className="p-4 md:p-6">
              <div className="mx-auto w-full max-w-7xl">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}