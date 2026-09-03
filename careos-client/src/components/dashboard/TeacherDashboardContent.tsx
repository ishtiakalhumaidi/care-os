/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import type { IDashboardData } from "@/services/dashboard.services";
import { Baby, CheckCircle, FileText, MessageCircle } from "lucide-react";
import TeacherTimesheetWidget from "./schedule/TeacherTimesheetWidget";
import TeacherUpcomingShifts from "./schedule/TeacherUpcomingShifts";

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  subtext?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="absolute rounded-lg bg-primary/10 p-3">{icon}</div>
      <p className="ml-16 truncate text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <p className="ml-16 mt-1 text-2xl font-semibold text-foreground">
        {value}
      </p>
      {subtext && (
        <p className="ml-16 text-xs text-muted-foreground">{subtext}</p>
      )}
    </div>
  );
}

export default function TeacherDashboardContent({ data }: { data: IDashboardData }) {
  const classrooms = data.details.classrooms || [];
  const recentTimeline = data.details.recentTimelineEvents || [];
  const recentMessages = data.details.recentMessages || [];
  const hasClassrooms = classrooms.length > 0;

  const getMetric = (label: string) =>
    data.metrics.find((m) => m.label === label)?.value ?? 0;

  const totalChildren = getMetric("Total Children");
  const checkedIn = getMetric("Checked In Today");
  const notCheckedIn = getMetric("Not Checked In");
  const pendingDocs = getMetric("Pending Documents");
  const totalCapacity = classrooms.reduce(
    (sum: number, c: any) => sum + (c.legalCapacity ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasClassrooms
            ? `You're assigned to ${classrooms.length} classroom${classrooms.length > 1 ? "s" : ""}.`
            : "You haven't been assigned to a classroom yet."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {!hasClassrooms ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Contact your center admin to get assigned to a classroom.
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  icon={<Baby className="size-6 text-primary" />}
                  label="Children Enrolled"
                  value={totalChildren}
                  subtext={totalCapacity ? `${totalCapacity} capacity` : undefined}
                />
                <StatCard
                  icon={<CheckCircle className="size-6 text-emerald-600" />}
                  label="Checked In Today"
                  value={checkedIn}
                  subtext={`${notCheckedIn} pending check-in`}
                />
                <StatCard
                  icon={<FileText className="size-6 text-amber-600" />}
                  label="Pending Documents"
                  value={pendingDocs}
                />
              </div>

              {/* Classrooms */}
              <div className="rounded-xl border bg-card shadow-sm">
                <div className="border-b px-6 py-4">
                  <h3 className="font-semibold">My Classrooms</h3>
                </div>
                <div className="divide-y">
                  {classrooms.map((c: any) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.childCount} children
                          {c.legalCapacity ? ` · ${c.legalCapacity} capacity` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.isLead && (
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            Lead
                          </span>
                        )}
                        <Link
                          href={`/teacher/dashboard/my-classroom/${c.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              {recentTimeline.length > 0 && (
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold">Recent Activity</h3>
                  <div className="space-y-3">
                    {recentTimeline.slice(0, 6).map((e: any) => (
                      <div
                        key={e.id}
                        className="flex items-start gap-3 border-b pb-2 last:border-0"
                      >
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {e.eventType}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(e.loggedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {e.child?.firstName} {e.child?.lastName}
                          </p>
                          {e.description && (
                            <p className="mt-1 text-xs text-foreground/80">
                              {e.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Messages */}
              {recentMessages.length > 0 && (
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold">Recent Messages</h3>
                  <div className="space-y-3">
                    {recentMessages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className="flex items-start gap-3 border-b pb-2 last:border-0"
                      >
                        <MessageCircle className="size-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {msg.sender?.name ?? "Unknown"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT — 1/3 */}
        <div className="lg:col-span-1 space-y-6">
          <TeacherTimesheetWidget />
          <TeacherUpcomingShifts />
        </div>
      </div>
    </div>
  );
}