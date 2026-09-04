import React from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getClassrooms } from "@/services/classroom.services";
import { getBranches } from "@/services/branch.services";
import ClassroomsTable from "@/components/dashboard/owner/classrooms/ClassroomsTable";

export default async function CenterAdminClassroomsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const queryParamsObjects = await searchParams;

  const params = new URLSearchParams();
  Object.entries(queryParamsObjects).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.set(key, value);
    }
  });

  // Enforce defaults so server & client keys match exactly
  if (!params.has("sortBy")) params.set("sortBy", "createdAt");
  if (!params.has("sortOrder")) params.set("sortOrder", "desc");
  if (!params.has("limit")) params.set("limit", "10");

  const queryString = params.toString();

  const queryClient = new QueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["classrooms", queryString],
      queryFn: () => getClassrooms(queryString),
      staleTime: 1000 * 60 * 5,
    }),
    queryClient.prefetchQuery({
      queryKey: ["branches", "for-classroom-select"],
      queryFn: () => getBranches("limit=100"),
      staleTime: 1000 * 60 * 5,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Classrooms
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage center classrooms, track capacity limits, and monitor student ratios.
          </p>
        </div>
        <ClassroomsTable
          initialQueryString={queryString}
          basePath="/center-admin/dashboard/classrooms-management"
        />
      </div>
    </HydrationBoundary>
  );
}