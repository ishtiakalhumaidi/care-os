/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import type { IDashboardData } from "@/services/dashboard.services";
import { TrendingUp, TrendingDown, Users, Building2, Baby, DollarSign, AlertTriangle } from "lucide-react";

/* ─── mini chart components ─── */

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
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        points={pts.join(" ")}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AreaChart({ data }: { data: { month: string; value: number }[] }) {
  if (!data.length) return null;
  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 600;
  const h = 200;
  const pad = 10;

  const getX = (i: number) => (i / (data.length - 1)) * (w - pad * 2) + pad;
  const getY = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(d.value)}`)
    .join(" ");

  const areaPath = `${path} L ${getX(data.length - 1)} ${h} L ${getX(0)} ${h} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* grid */}
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i / 3) * (h - pad * 2);
          return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="4 4" />;
        })}
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* dots */}
        {data.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.value)} r={4} fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth={2} />
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

function BarChart({ data }: { data: { month: string; count: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 300;
  const h = 150;
  const pad = 20;
  const barW = (w - pad * 2) / data.length * 0.6;
  const gap = (w - pad * 2) / data.length;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36" preserveAspectRatio="none">
        {/* grid */}
        {[0, 1, 2].map((i) => {
          const y = pad + (i / 2) * (h - pad * 2);
          return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 3" />;
        })}
        {data.map((d, i) => {
          const bh = ((d.count / max) * (h - pad * 2));
          const x = pad + i * gap + (gap - barW) / 2;
          const y = h - pad - bh;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} rx={4} fill="hsl(var(--primary))" opacity={0.85} />
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between px-4 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] text-muted-foreground">{d.month}</span>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: { plan: string; count: number }[] }) {
  if (!data.length) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = 80;
  const c = 2 * Math.PI * r;
  const colors = ["hsl(var(--primary))", "hsl(var(--primary) / 0.7)", "hsl(var(--primary) / 0.45)", "hsl(var(--primary) / 0.25)", "#94a3b8"];

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
          tenants
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="text-muted-foreground">{d.plan}</span>
            <span className="ml-auto font-medium">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
/* ─── trend badge ─── */

function TrendBadge({ percent }: { percent: number }) {
  const isUp = percent >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}>
      {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {Math.abs(percent)}%
    </span>
  );
}

/* ─── main component ─── */

export default function SuperAdminDashboardContent({ data }: { data: IDashboardData }) {
  const comp = data.details.comparisons as any;
  const charts = data.details.charts as any;
  const mrrHist = charts?.mrrHistory || [];
  const tenantSignups = charts?.tenantSignups || [];

  const kpi = [
    {
      label: "Monthly Recurring Revenue",
      value: data.metrics.find((m) => m.label === "Monthly Recurring Revenue")?.value ?? "$0",
      change: comp?.mrr?.changePercent ?? 0,
      icon: <DollarSign className="size-5 text-emerald-600" />,
      spark: mrrHist.map((d: any) => d.value),
    },
    {
      label: "Active Tenants",
      value: data.metrics.find((m) => m.label === "Active Tenants")?.value ?? 0,
      change: comp?.tenants?.changePercent ?? 0,
      icon: <Building2 className="size-5 text-primary" />,
      spark: tenantSignups.map((d: any) => d.count),
    },
    {
      label: "Platform Users",
      value: data.metrics.find((m) => m.label === "Platform Users")?.value ?? 0,
      change: comp?.users?.changePercent ?? 0,
      icon: <Users className="size-5 text-blue-500" />,
    },
    {
      label: "Children on Platform",
      value: data.metrics.find((m) => m.label === "Children on Platform")?.value ?? 0,
      change: comp?.children?.changePercent ?? 0,
      icon: <Baby className="size-5 text-amber-500" />,
    },
  ];

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
              <TrendBadge percent={item.change} />
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

      {/* Main Chart + Side Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* MRR Area Chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground">MRR over last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{kpi[0].value}</p>
              <TrendBadge percent={kpi[0].change} />
            </div>
          </div>
          <AreaChart data={mrrHist} />
        </div>

        {/* Plan Distribution */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-1 font-semibold">Plans</h3>
          <p className="mb-4 text-xs text-muted-foreground">Active tenants by subscription</p>
          <DonutChart data={data.details.tenantsByPlan || []} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tenant Signups */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-1 font-semibold">Tenant Signups</h3>
          <p className="mb-4 text-xs text-muted-foreground">New tenants per month</p>
          <BarChart data={tenantSignups} />
        </div>

        {/* Users by Role */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Users by Role</h3>
          <div className="space-y-3">
            {data.details.usersByRole?.map((r: any) => (
              <div key={r.role} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="flex-1 text-sm capitalize text-muted-foreground">
                  {r.role.replace("_", " ").toLowerCase()}
                </span>
                <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min((r.count / (data.metrics.find((m) => m.label === "Platform Users")?.value as number || 1)) * 100, 100)}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Children by Status */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">Enrollment Status</h3>
          <div className="space-y-3">
            {data.details.childrenByStatus?.map((s: any) => {
              const total = data.metrics.find((m) => m.label === "Children on Platform")?.value as number || 1;
              const pct = Math.min((s.count / total) * 100, 100);
              const color =
                s.status === "ENROLLED"
                  ? "bg-emerald-500"
                  : s.status === "APPLIED" || s.status === "WAITLISTED"
                  ? "bg-amber-500"
                  : s.status === "SUSPENDED" || s.status === "REJECTED"
                  ? "bg-red-500"
                  : "bg-slate-400";
              return (
                <div key={s.status} className="flex items-center gap-3">
                  <span className="flex-1 text-sm capitalize text-muted-foreground">
                    {s.status.toLowerCase()}
                  </span>
                  <div className="h-1.5 flex-1 max-w-[100px] rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-sm font-medium">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
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