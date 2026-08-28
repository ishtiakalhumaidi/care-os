import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatProvider } from "@/components/providers/ChatContext";
import { getMe } from "@/services/user.services";
import { SidebarProvider } from "@/components/providers/SidebarContext";
import { SocketProvider } from "@/providers/SocketProvider";

export const dynamic = "force-dynamic";

export default async function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getMe();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  return  (
    <SidebarProvider>
      <SocketProvider token={token}>
        <ChatProvider>
          <div className="flex min-h-screen bg-background">
            <DashboardSidebar role={user.role} />
            <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
              <DashboardNavbar />
              <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
                <div className="mx-auto w-full max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </ChatProvider>
      </SocketProvider>
    </SidebarProvider>
  );
}