/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboard, type DashboardPeriod } from "@/services/dashboard.services";
import { useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import SuperAdminDashboardContent from "./SuperAdminDashboardContent";
import OwnerDashboardContent from "./OwnerDashboardContent";
import CenterAdminDashboardContent from "./CenterAdminDashboardContent";
import TeacherDashboardContent from "./TeacherDashboardContent";
import GuardianDashboardContent from "./GuardianDashboardContent";
import DashboardCalendar from "./DashboardCalendar";

export default function DashboardContent() {
  const [period, setPeriod] = useState<DashboardPeriod>("7d");

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => getDashboard(period),
  });

  if (error && (error as any)?.response?.status === 403) {
    const msg =
      (error as any)?.response?.data?.message ||
      "Your account has been suspended.";
    const isBranchLock = msg.toLowerCase().includes("branch");
    const isTenantLock = msg.toLowerCase().includes("organization") || msg.toLowerCase().includes("tenant");

    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-5 rounded-2xl border bg-card p-8 shadow-lg">
          <div className={`mx-auto size-16 rounded-full flex items-center justify-center ${isBranchLock ? "bg-amber-100" : isTenantLock ? "bg-red-100" : "bg-slate-100"}`}>
            <Lock className={`size-8 ${isBranchLock ? "text-amber-600" : isTenantLock ? "text-red-600" : "text-slate-600"}`} />
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {isBranchLock ? "Branch Deactivated" : isTenantLock ? "Organization Suspended" : "Access Restricted"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{msg}</p>
          </div>
          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
              <p>
                If you believe this is a mistake, please contact your
                {isBranchLock ? " branch " : " "}
                administrator or CareOS support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">{data.role.replace("_", " ")} Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          {isFetching && <span className="text-xs text-muted-foreground">Refreshing…</span>}
        </div>
      </div>

      {/* Alerts */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => (
            <div
              key={i}
              className={`rounded-lg border px-4 py-3 text-sm ${
                alert.type === "critical"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : alert.type === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
              }`}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}
      
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {data.role === "SUPER_ADMIN" && <SuperAdminDashboardContent data={data} />}
          {data.role === "TENANT_OWNER" && <OwnerDashboardContent data={data} />}
          {data.role === "CENTER_ADMIN" && <CenterAdminDashboardContent data={data} />}
          {data.role === "TEACHER" && <TeacherDashboardContent data={data} />}
          {data.role === "GUARDIAN" && <GuardianDashboardContent data={data} />}
        </div>
        <div className="lg:col-span-1 space-y-6">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  );
}