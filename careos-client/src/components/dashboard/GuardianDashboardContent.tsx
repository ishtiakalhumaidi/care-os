/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { IDashboardData } from "@/services/dashboard.services";
import Image from "next/image";
import Link from "next/link";

export default function GuardianDashboardContent({ data }: { data: IDashboardData }) {
  const children = data.details.children ?? [];

  return (
    <div className="space-y-6">
      {/* Top metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {data.metrics.map((m, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{m.label}</p>
            <p className="mt-2 text-3xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* My Children cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">My Children</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child: any) => (<Link href={`/guardian/dashboard/children/${child.id}`} key={child.id} >
            <div
              
              className="flex items-start gap-4 rounded-xl border bg-card p-4 shadow-sm  hover:outline-2 hover:outline-primary/50"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                {child.photoUrl ? (
                  <Image
                    width={56}
                    height={56}
                    src={child.photoUrl}
                    alt={child.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
                    {child.name?.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{child.name}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      child.todayAttendance === "CHECKED_IN"
                        ? "bg-green-100 text-green-700"
                        : child.todayAttendance === "CHECKED_OUT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {child.todayAttendance.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">Code: {child.childCode}</p>
                {child.classroom && (
                  <p className="text-xs text-muted-foreground">Room: {child.classroom}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  {child.pendingDocsCount > 0 && (
                    <span className="text-xs text-amber-600">
                      {child.pendingDocsCount} doc{child.pendingDocsCount > 1 ? "s" : ""} to sign
                    </span>
                  )}
                  {child.unpaidTotal > 0 && (
                    <span className="text-xs text-red-600">
                      ${child.unpaidTotal.toFixed(2)} due
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
          
          ))}

          {children.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">
              No children linked to your account yet.
            </div>
          )}
        </div>
      </div>

      {/* Broadcasts */}
      {data.details.broadcasts?.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Announcements</h3>
          <div className="space-y-3">
            {data.details.broadcasts.map((b: any) => (
              <div key={b.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{b.title}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      b.priority === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : b.priority === "WARNING"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {b.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      {data.details.conversations?.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Recent Conversations</h3>
          <div className="space-y-3">
            {data.details.conversations.map((conv: any) => (
              <div
                key={conv.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {conv.isDirectMessage ? "Direct Message" : "Classroom Chat"}
                  </p>
                  {conv.messages?.[0] && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {conv.messages[0].content}
                    </p>
                  )}
                </div>
                {conv.messages?.[0] && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(conv.messages[0].createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}