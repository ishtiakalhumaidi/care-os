"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenantById } from "@/services/tenant.services";
import { format } from "date-fns";
import {
  Building2,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  Loader2,
} from "lucide-react";

function SkeletonOverview() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse">
      <div className="mb-4 h-5 w-24 rounded-md bg-muted" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 rounded-md bg-muted" />
            <div className="h-5 w-12 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TenantOverviewCard({ tenantId }: { tenantId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => getTenantById(tenantId).then((res) => res.data),
  });

  if (isLoading) return <SkeletonOverview />;
  if (!data) return null;

  const stats = [
    {
      label: "Status",
      value: data.isActive ? "Active" : "Suspended",
      icon: data.isActive ? CheckCircle2 : AlertTriangle,
      color: data.isActive
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400",
      bg: data.isActive
        ? "bg-emerald-50 dark:bg-emerald-950/30"
        : "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Branches",
      value: data._count?.branches ?? 0,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Team",
      value: data._count?.users ?? 0,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Created",
      value: format(new Date(data.createdAt), "MMM d, yyyy"),
      icon: Calendar,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="border-b bg-muted/30 px-6 py-4">
        <h3 className="text-sm font-semibold text-foreground">Overview</h3>
      </div>

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-lg border bg-card p-4 text-center transition-colors hover:bg-muted/30">
                <div className={`mx-auto mb-2 flex size-9 items-center justify-center rounded-lg ${s.bg}`}>
                  <Icon className={`size-4 ${s.color}`} />
                </div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Suspension Warning */}
        {!data.isActive && data.suspensionReason && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
            <div className="text-sm">
              <span className="font-semibold text-red-700 dark:text-red-400">
                Suspended:{" "}
              </span>
              <span className="text-red-600 dark:text-red-400">
                {data.suspensionReason}
              </span>
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(data.contactEmail || data.contactPhone || data.website || data.addressLine1) && (
          <div className="mt-6 grid grid-cols-1 gap-3 border-t pt-6 sm:grid-cols-2">
            {data.contactEmail && (
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{data.contactEmail}</span>
              </div>
            )}
            {data.contactPhone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Phone:</span>
                <span className="font-medium text-foreground">{data.contactPhone}</span>
              </div>
            )}
            {data.website && (
              <div className="flex items-center gap-2.5 text-sm">
                <Globe className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Web:</span>
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  {data.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {data.addressLine1 && (
              <div className="flex items-start gap-2.5 text-sm sm:col-span-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">HQ:</span>
                <span className="font-medium text-foreground">
                  {data.addressLine1}
                  {data.addressLine2 && `, ${data.addressLine2}`}
                  {data.city && `, ${data.city}`}
                  {data.state && `, ${data.state}`}
                  {data.postalCode && ` ${data.postalCode}`}
                  {data.country && `, ${data.country}`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}