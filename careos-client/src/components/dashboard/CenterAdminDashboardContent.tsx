/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { IDashboardData } from "@/services/dashboard.services";

export default function CenterAdminDashboardContent({ data }: { data: IDashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.metrics.map((m, i) => (
          <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">{m.label}</p>
            <p className="mt-2 text-3xl font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Recent Check-ins</h3>
          <div className="space-y-3">
            {data.details.recentCheckins?.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 border-b pb-2 last:border-0">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{c.child.firstName} {c.child.lastName}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.checkInTime ? new Date(c.checkInTime).toLocaleTimeString() : "—"}
                  </p>
                </div>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Recent Timeline</h3>
          <div className="space-y-3">
            {data.details.recentTimelineEvents?.map((e: any) => (
              <div key={e.id} className="border-b pb-2 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{e.eventType}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.loggedAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-muted-foreground">{e.child.firstName} {e.child.lastName}</p>
                {e.description && <p className="mt-1 text-xs">{e.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}