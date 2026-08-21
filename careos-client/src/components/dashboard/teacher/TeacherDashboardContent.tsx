/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMyClassrooms } from "@/services/classroom.services";
import { Baby, Users, Gauge, ArrowRight } from "lucide-react";
import TeacherUpcomingShifts from "../schedule/TeacherUpcomingShifts"; // Adjust path if needed

export default function TeacherDashboardContent() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-classrooms"],
    queryFn: getMyClassrooms,
  });

  const classrooms = data?.data || [];
  const hasClassrooms = classrooms.length > 0;

  const totalEnrolled = classrooms.reduce(
    (sum: number, c: any) => sum + (c._count?.children ?? 0),
    0,
  );
  const totalCapacity = classrooms.reduce(
    (sum: number, c: any) => sum + (c.legalCapacity ?? 0),
    0,
  );

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Teacher Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasClassrooms
            ? `You're assigned to ${classrooms.length} classroom${classrooms.length > 1 ? "s" : ""}.`
            : "You haven't been assigned to a classroom yet."}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column: Classroom Stats & Links (Takes up 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {!isLoading && !hasClassrooms ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Contact your center admin to get assigned to a classroom.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                  <dt>
                    <div className="absolute rounded-lg bg-primary/10 p-3">
                      <Baby className="size-6 text-primary" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
                      Children Enrolled
                    </p>
                  </dt>
                  <dd className="ml-16 pb-1">
                    <p className="text-2xl font-semibold text-foreground">
                      {isLoading ? "..." : totalEnrolled}
                    </p>
                  </dd>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                  <dt>
                    <div className="absolute rounded-lg bg-primary/10 p-3">
                      <Gauge className="size-6 text-primary" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
                      Total Capacity
                    </p>
                  </dt>
                  <dd className="ml-16 pb-1">
                    <p className="text-2xl font-semibold text-foreground">
                      {isLoading ? "..." : `${totalEnrolled}/${totalCapacity}`}
                    </p>
                  </dd>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
                  <dt>
                    <div className="absolute rounded-lg bg-primary/10 p-3">
                      <Users className="size-6 text-primary" aria-hidden="true" />
                    </div>
                    <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
                      Classrooms Assigned
                    </p>
                  </dt>
                  <dd className="ml-16 pb-1">
                    <p className="text-2xl font-semibold text-foreground">
                      {isLoading ? "..." : classrooms.length}
                    </p>
                  </dd>
                </div>
              </div>

              <Link
                href="/teacher/dashboard/my-classroom"
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  View classroom rosters
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <TeacherUpcomingShifts />
        </div>

      </div>
    </div>
  );
}