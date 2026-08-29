import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getActiveBroadcasts } from "@/services/broadcast.services";
import AlertsInboxView from "@/components/dashboard/broadcast/AlertsInboxView";

export default async function TeacherAlertsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({ 
    queryKey: ["broadcasts"], 
    queryFn: getActiveBroadcasts 
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Alerts & Announcements</h2>
          <p className="text-sm text-muted-foreground">
            Review important updates, center announcements, and emergency alerts.
          </p>
        </div>
        <AlertsInboxView />
      </div>
    </HydrationBoundary>
  );
}