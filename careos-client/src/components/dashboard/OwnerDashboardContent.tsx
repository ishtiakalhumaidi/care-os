/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import type { IDashboardData } from "@/services/dashboard.services";
import { DollarSign, Receipt, Baby, CheckCircle, Users, Bell, AlertTriangle, TrendingUp, TrendingDown, FileText, UserPlus } from "lucide-react";

function TrendBadge({ percent }: { percent: number }) {
  const isUp = percent >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
      {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {Math.abs(percent)}%
    </span>
  );
}

function SparkLine({ data, color = "currentColor" }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-28 opacity-60" preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth={2} points={pts.join(" ")} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AreaChart({ data }: { data: { month: string; amount: number }[] }) {
  if (!data.length) return null;
  const values = data.map((d) => d.amount);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 600;
  const h = 200;
  const pad = 10;

  const getX = (i: number) => (i / (data.length - 1)) * (w - pad * 2) + pad;
  const getY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);

  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.amount)}`).join(" ");
  const areaPath = `${path} L ${getX(data.length - 1)} ${h} L ${getX(0)} ${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ownerAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i / 3) * (h - pad * 2);
          return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 4" />;
        })}
        <path d={areaPath} fill="url(#ownerAreaGrad)" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.amount)} r={4} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={2} />
        ))}
      </svg>
      <div className="flex justify-between px-2 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: { status: string; count: number }[] }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 80;
  const c = 2 * Math.PI * r;
  const colors = ["hsl(var(--primary))", "hsl(var(--primary) / 0.7)", "hsl(var(--primary) / 0.45)", "hsl(var(--primary) / 0.25)", "#94a3b8", "#cbd5e1"];

  const segments = data.reduce<{ key: number; seg: number; offset: number; color: string }[]>(
    (acc, d, i) => {
      const seg = (d.count / total) * c;
      const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].seg : 0;
      acc.push({
        key: i,
        seg,
        offset: prevOffset,
        color: colors[i % colors.length],
      });
      return acc;
    },
    []
  );

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 200 200" className="h-36 w-36 shrink-0 -rotate-90">
        {segments.map(({ key, seg, offset, color }) => (
          <circle
            key={key}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={24}
            strokeDasharray={`${seg} ${c - seg}`}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        ))}
        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-xl font-bold rotate-90">
          {total}
        </text>
        <text x="100" y="120" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[10px] rotate-90">
          children
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-muted-foreground capitalize">{d.status.toLowerCase()}</span>
            <span className="ml-auto font-medium">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OwnerDashboardContent({ data }: { data: IDashboardData }) {
  const comp = data.details.comparisons as any;
  const charts = data.details.charts as any;
  const planLimits = data.details.planLimits as any;
  const revenueHist = charts?.revenueHistory || [];
  const enrollmentGrowth = charts?.enrollmentGrowth || [];

  const kpi = [
    {
      label: "Paid This Month",
      value: data.metrics.find((m) => m.label === "Paid This Month")?.value ?? "$0",
      change: comp?.revenue?.changePercent ?? 0,
      icon: <DollarSign className="size-5 text-emerald-600" />,
      spark: revenueHist.map((d: any) => d.amount),
    },
    {
      label: "Outstanding",
      value: data.metrics.find((m) => m.label === "Outstanding")?.value ?? "$0",
      change: 0,
      icon: <Receipt className="size-5 text-red-500" />,
    },
    {
      label: "Children",
      value: data.metrics.find((m) => m.label === "Children")?.value ?? 0,
      change: comp?.children?.changePercent ?? 0,
      icon: <Baby className="size-5 text-primary" />,
      spark: enrollmentGrowth.map((d: any) => d.count),
    },
    {
      label: "Enrolled",
      value: data.metrics.find((m) => m.label === "Enrolled")?.value ?? 0,
      change: comp?.enrolled?.changePercent ?? 0,
      icon: <CheckCircle className="size-5 text-blue-500" />,
    },
  ];

  const enrollmentData = (data.details.childrenByStatus || []).map((s: any) => ({
    status: s.status,
    count: s.count,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpi.map((item, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-muted p-2">{item.icon}</div>
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
              </div>
              {item.change !== 0 && <TrendBadge percent={item.change} />}
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight">{item.value}</p>
            {item.spark && item.spark.length > 1 && (
              <div className="absolute bottom-2 right-2">
                <SparkLine data={item.spark} color="hsl(var(--primary))" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">Collections over last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{kpi[0].value}</p>
              {comp?.revenue?.changePercent !== 0 && <TrendBadge percent={comp?.revenue?.changePercent ?? 0} />}
            </div>
          </div>
          <AreaChart data={revenueHist} />
        </div>

        {/* Enrollment Pipeline */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-1 font-semibold">Enrollment Pipeline</h3>
          <p className="mb-4 text-xs text-muted-foreground">Children by status</p>
          <DonutChart data={enrollmentData} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
               {/* Plan Usage */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Plan Usage</h3>
          <div className="space-y-5">
            {planLimits?.maxStudents ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Children</span>
                  <span className="font-medium">{planLimits.currentStudents} / {planLimits.maxStudents}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((planLimits.currentStudents / planLimits.maxStudents) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : null}

            {planLimits?.maxBranches ? (
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Branches</span>
                  <span className="font-medium">{planLimits.currentBranches} / {planLimits.maxBranches}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      planLimits.currentBranches > planLimits.maxBranches
                        ? "bg-red-500"
                        : planLimits.currentBranches >= planLimits.maxBranches
                        ? "bg-amber-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${Math.min((planLimits.currentBranches / planLimits.maxBranches) * 100, 100)}%` }}
                  />
                </div>
                {/* ─── NEW: Branch status legend ─── */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="inline-block size-2 rounded-full bg-primary" />
                    Active
                  </span>
                  {planLimits.currentBranches > planLimits.maxBranches && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <span className="inline-block size-2 rounded-full bg-red-500" />
                      Over limit — upgrade required
                    </span>
                  )}
                  {planLimits.currentBranches === planLimits.maxBranches && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <span className="inline-block size-2 rounded-full bg-amber-500" />
                      At limit
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {!planLimits?.maxStudents && !planLimits?.maxBranches && (
              <p className="text-sm text-muted-foreground">No plan limits configured.</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-semibold">Pending Items</h4>
            {data.metrics.find((m) => m.label === "Pending Requests")?.value ? (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <UserPlus className="size-4" />
                <span>{data.metrics.find((m) => m.label === "Pending Requests")?.value} guardian requests</span>
              </div>
            ) : null}
            {data.alerts.some((a: any) => a.message.includes("document")) ? (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <FileText className="size-4" />
                <span>Documents awaiting signature</span>
              </div>
            ) : null}
            {data.alerts.some((a: any) => a.message.includes("unpaid")) ? (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <Receipt className="size-4" />
                <span>Unpaid invoices</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Staff by Role */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Staff by Role</h3>
          <div className="space-y-3">
            {data.details.staffByRole?.map((r: any) => {
              const totalStaff = (data.details.staffByRole as any[])?.reduce((s: number, x: any) => s + x.count, 0) || 1;
              const pct = Math.min((r.count / totalStaff) * 100, 100);
              return (
                <div key={r.role} className="flex items-center gap-3">
                  <span className="flex-1 text-sm capitalize text-muted-foreground">{r.role.replace("_", " ").toLowerCase()}</span>
                  <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm font-medium">{r.count}</span>
                </div>
              );
            })}
            {(!data.details.staffByRole || data.details.staffByRole.length === 0) && (
              <p className="text-sm text-muted-foreground">No staff members yet.</p>
            )}
          </div>
        </div>

        {/* Recent Broadcasts */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Recent Broadcasts</h3>
          </div>
          <div className="space-y-3">
            {data.details.recentBroadcasts?.map((b: any) => (
              <div key={b.id} className="border-b pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium line-clamp-1">{b.title}</p>
                  <span className={`ml-2 shrink-0 rounded px-2 py-0.5 text-xs ${b.priority === "CRITICAL" ? "bg-red-100 text-red-700" : b.priority === "WARNING" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {b.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {(!data.details.recentBroadcasts || data.details.recentBroadcasts.length === 0) && (
              <p className="text-sm text-muted-foreground">No recent announcements.</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Banner */}
      {data.alerts.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800 dark:text-amber-400">
            {data.alerts.map((a, i) => <p key={i}>{a.message}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}