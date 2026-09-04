import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getChildren } from "@/services/child.services";
import StudentsTable from "@/components/dashboard/students/StudentsTable";

export default async function StudentsManagementPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["children", "status=APPLIED"],
    queryFn: () => getChildren("status=APPLIED&limit=50"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Students
        </h2>
        <StudentsTable basePath="/center-admin/dashboard/students-management" />
      </div>
    </HydrationBoundary>
  );
}
