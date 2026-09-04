import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getMe } from "@/services/user.services";
import { getDashboard } from "@/services/dashboard.services";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function GuardianDashboardPage() {
  const user = await getMe();
  if (!user) redirect("/login");

  if (user.role === "GUARDIAN" && !user.guardianProfile?.length) {
    redirect("/guardian/dashboard/register-child");
  }

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["dashboard", "7d"],
    queryFn: () => getDashboard("7d"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}