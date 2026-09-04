import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getBranches } from "@/services/branch.services";
import BranchesTable from "@/components/dashboard/owner/branches/BranchesTable";
import React from "react";

export default async function BranchesManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParamsObjects = await searchParams;

  const params = new URLSearchParams();

  Object.entries(queryParamsObjects).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  });

  if (!params.has("sortBy")) params.set("sortBy", "createdAt");
  if (!params.has("sortOrder")) params.set("sortOrder", "desc");
  if (!params.has("limit")) params.set("limit", "10");
  if (queryParamsObjects.includeInactive === "true") {
    params.set("includeInactive", "true");
  }

  const queryString = params.toString();

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["branches", queryString],
    queryFn: () => getBranches(queryString),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Branches
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your physical center locations. Locked branches are shown when
            &quot;Show locked&quot; is enabled.
          </p>
        </div>

        <BranchesTable
          initialQueryString={queryString}
          basePath="/owner/dashboard/branches-management"
        />
      </div>
    </HydrationBoundary>
  );
}