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
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar role={user.role} />
        <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}