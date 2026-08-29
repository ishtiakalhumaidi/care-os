import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getBranches } from "@/services/branch.services";
import { getClassrooms } from "@/services/classroom.services";
import { getActiveBroadcasts } from "@/services/broadcast.services";
import BroadcastManagementView from "@/components/dashboard/broadcast/BroadcastManagementView";

export default async function CenterAdminBroadcastsPage() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["branches", "for-broadcast"], queryFn: () => getBranches("limit=100") }),
    queryClient.prefetchQuery({ queryKey: ["classrooms", "for-broadcast"], queryFn: () => getClassrooms("limit=100") }),
    queryClient.prefetchQuery({ queryKey: ["broadcasts"], queryFn: getActiveBroadcasts }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Emergency Broadcasts</h2>
          <p className="text-sm text-muted-foreground">
            Dispatch urgent alerts, severe weather warnings, or priority information to targeted groups.
          </p>
        </div>
        <BroadcastManagementView />
      </div>
    </HydrationBoundary>
  );
}