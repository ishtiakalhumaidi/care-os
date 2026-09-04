/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllTenants } from "@/services/tenant.services";
import {
  Loader2,
  Building2,
  Search,
  X,
  Users,
  MapPin,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeInOut"  as const },
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <SkeletonPulse className="size-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-40" />
            <SkeletonPulse className="h-3 w-24" />
          </div>
          <SkeletonPulse className="h-4 w-20" />
          <SkeletonPulse className="h-4 w-16" />
          <SkeletonPulse className="h-4 w-16" />
          <SkeletonPulse className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function TenantsTable() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tenants"],
    queryFn: () => getAllTenants("limit=100"),
  });

  const tenants = data?.data || [];

  const filteredTenants = useMemo(() => {
    if (!searchQuery.trim()) return tenants;
    const q = searchQuery.toLowerCase();
    return tenants.filter((t: any) => t.name?.toLowerCase().includes(q));
  }, [tenants, searchQuery]);

  const activeCount = tenants.filter((t: any) => t.isActive).length;
  const suspendedCount = tenants.filter((t: any) => !t.isActive).length;

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
        <AlertTriangle className="size-3" />
        Suspended
      </span>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Page Header */}
      <motion.div
        variants={fadeInUp}
        custom={0}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Building2 className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Tenants
              </h1>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Manage all registered childcare centers, view their plans, and monitor status.
              </p>
            </div>
          </div>
          {!isLoading && tenants.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 shadow-sm">
              <Sparkles className="size-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {tenants.length} total
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!isLoading && tenants.length > 0 && (
        <motion.div
          variants={fadeInUp}
          custom={1}
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          {[
            {
              label: "Total Tenants",
              value: tenants.length,
              icon: Building2,
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              label: "Active",
              value: activeCount,
              icon: CheckCircle2,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-500/10",
            },
            {
              label: "Suspended",
              value: suspendedCount,
              icon: AlertTriangle,
              color: "text-red-600 dark:text-red-400",
              bg: "bg-red-500/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              custom={i + 1}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Search */}
      {!isLoading && tenants.length > 0 && (
        <motion.div variants={fadeInUp} custom={2} className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tenants by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-10 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </motion.div>
      )}

      {/* Table Card */}
      <motion.div
        variants={fadeInUp}
        custom={3}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">All Tenants</h3>
          {!isLoading && (
            <span className="ml-auto text-xs text-muted-foreground">
              {filteredTenants.length} result{filteredTenants.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : tenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 size-16 rounded-full bg-muted/50 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Building2 className="size-7" />
              </div>
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">No tenants yet</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              There are no registered tenants in the system.
            </p>
          </div>
        ) : filteredTenants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-7" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">No matches found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Tenant</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Plan</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Branches</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Users</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <AnimatePresence>
                  {filteredTenants.map((t: any, i: number) => (
                    <motion.tr
                      key={t.id}
                      variants={fadeInUp}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      onClick={() => router.push(`/admin/dashboard/tenants-management/${t.id}`)}
                      className="group cursor-pointer transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                            <Building2 className="size-4" />
                          </div>
                          <span className="font-semibold text-foreground">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {t.plan?.name || (
                          <span className="italic text-muted-foreground/50">No plan</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="size-3.5" />
                          <span>{t._count?.branches ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="size-3.5" />
                          <span>{t._count?.users ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">{getStatusBadge(t.isActive)}</td>
                      <td className="px-5 py-4">
                        <div className="flex size-8 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all group-hover:bg-muted group-hover:opacity-100">
                          <ArrowRight className="size-4" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}