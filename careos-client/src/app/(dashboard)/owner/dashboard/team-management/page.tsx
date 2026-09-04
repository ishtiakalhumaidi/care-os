import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getBranches } from "@/services/branch.services";
import TeamManagement from "@/components/dashboard/owner/team/TeamManagement";

export default async function TeamManagementPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["branches", "for-invite-select"],
    queryFn: () => getBranches("limit=100"),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Team</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite center admins, teachers, and guardians to your organization.
          </p>
        </div>
        <TeamManagement />
      </div>
    </HydrationBoundary>
  );
}