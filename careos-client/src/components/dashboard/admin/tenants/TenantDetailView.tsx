/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTenantAnalytics,
  suspendTenant,
  activateTenant,
} from "@/services/tenant.services";
import {
  ArrowLeft,
  PauseCircle,
  PlayCircle,
  Loader2,
  Building2,
  Shield,
  Users,
  Mail,
  AlertTriangle,
  CheckCircle2,
  X,
  Crown,
  Sparkles,
  UserCog,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeInOut" as const },
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SkeletonPulse className="h-5 w-32" />
      <SkeletonPulse className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SkeletonPulse className="h-64 w-full rounded-2xl" />
        <SkeletonPulse className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function TenantDetailView({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => getTenantAnalytics(tenantId).then((res) => res.data),
  });

  const { mutate: suspend, isPending: isSuspending } = useMutation({
    mutationFn: () => suspendTenant(tenantId, { reason }),
    onSuccess: () => {
      toast.success("Tenant suspended successfully.");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      setShowSuspendForm(false);
      setReason("");
    },
    onError: (err: any) => toast.error(err.message || "Failed to suspend tenant."),
  });

  const { mutate: activate, isPending: isActivating } = useMutation({
    mutationFn: () => activateTenant(tenantId),
    onSuccess: () => {
      toast.success("Tenant activated successfully.");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to activate tenant."),
  });

  if (isLoading || !data) return <DetailSkeleton />;

  const { tenant, membersByRole, invitationsByStatus } = data;

  const totalMembers = membersByRole.reduce((sum: number, m: any) => sum + (m.count || 0), 0);
  const totalInvitations = invitationsByStatus.reduce(
    (sum: number, i: any) => sum + (i.count || 0),
    0
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "TENANT_OWNER":
        return <Crown className="size-4 text-amber-500" />;
      case "CENTER_ADMIN":
        return <Shield className="size-4 text-primary" />;
      case "TEACHER":
        return <UserCog className="size-4 text-indigo-500" />;
      case "GUARDIAN":
        return <Users className="size-4 text-emerald-500" />;
      default:
        return <UserPlus className="size-4 text-muted-foreground" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "TENANT_OWNER":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "CENTER_ADMIN":
        return "bg-primary/10 text-primary";
      case "TEACHER":
        return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
      case "GUARDIAN":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "EXPIRED":
      case "REVOKED":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* Back nav */}
      <motion.div variants={fadeInUp} custom={0}>
        <button
          onClick={() => router.push("/admin/dashboard/tenants-management")}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to tenants
        </button>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className={`relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8 ${
          tenant.isActive ? "border-border" : "border-red-500/20"
        }`}
      >
        {!tenant.isActive && (
          <div className="absolute inset-0 bg-red-500/[0.02]" />
        )}
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                  tenant.isActive ? "bg-primary/10 text-primary" : "bg-red-500/10 text-red-500"
                }`}
              >
                <Building2 className="size-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {tenant.name}
                  </h1>
                  {tenant.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="relative flex size-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                      </span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
                      <AlertTriangle className="size-3" />
                      Suspended
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    <Crown className="size-3" />
                    {tenant.plan?.name || "No plan"}
                  </span>
                  <span>·</span>
                  <span className="text-xs">ID: {tenant.id.slice(0, 8)}...</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {tenant.isActive ? (
                <button
                  onClick={() => setShowSuspendForm(!showSuspendForm)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-[0.98] dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                >
                  <PauseCircle className="size-4" />
                  Suspend Tenant
                </button>
              ) : (
                <button
                  onClick={() => activate()}
                  disabled={isActivating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isActivating && <Loader2 className="size-4 animate-spin" />}
                  <PlayCircle className="size-4" />
                  {isActivating ? "Activating..." : "Activate Tenant"}
                </button>
              )}
            </div>
          </div>

          {/* Suspend Form */}
          <AnimatePresence>
            {showSuspendForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                      Suspend Tenant
                    </h3>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    This will prevent all users under this tenant from accessing the platform. Please provide a reason.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Reason for suspension (min. 3 characters)"
                      className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowSuspendForm(false);
                          setReason("");
                        }}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => suspend()}
                        disabled={isSuspending || reason.trim().length < 3}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-50"
                      >
                        {isSuspending && <Loader2 className="size-4 animate-spin" />}
                        {isSuspending ? "Suspending..." : "Confirm Suspension"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suspension Reason Banner */}
          <AnimatePresence>
            {!tenant.isActive && tenant.suspensionReason && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
              >
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    Suspension Reason
                  </p>
                  <p className="mt-0.5 text-sm text-red-600/80 dark:text-red-400/80">
                    {tenant.suspensionReason}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={fadeInUp}
        custom={2}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          {
            label: "Total Members",
            value: totalMembers,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Invitations",
            value: totalInvitations,
            icon: Mail,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-500/10",
          },
          {
            label: "Roles",
            value: membersByRole.length,
            icon: Shield,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Status",
            value: tenant.isActive ? "Active" : "Suspended",
            icon: tenant.isActive ? CheckCircle2 : AlertTriangle,
            color: tenant.isActive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400",
            bg: tenant.isActive ? "bg-emerald-500/10" : "bg-red-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            custom={i + 2}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`size-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Members by Role */}
        <motion.div
          variants={fadeInUp}
          custom={3}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Members by Role</h3>
                <p className="text-xs text-muted-foreground">{totalMembers} total members</p>
              </div>
            </div>
          </div>

          {!membersByRole || membersByRole.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
              <Users className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No members found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {membersByRole.map((m: any, i: number) => (
                <motion.div
                  key={m.role}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${getRoleColor(m.role).split(" ")[0]}`}>
                      {getRoleIcon(m.role)}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {m.role.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getRoleColor(m.role)}`}>
                      {m.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Invitations by Status */}
        <motion.div
          variants={fadeInUp}
          custom={4}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10">
                <Mail className="size-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Invitations</h3>
                <p className="text-xs text-muted-foreground">{totalInvitations} total sent</p>
              </div>
            </div>
          </div>

          {!invitationsByStatus || invitationsByStatus.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
              <Mail className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No invitations found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invitationsByStatus.map((inv: any, i: number) => (
                <motion.div
                  key={inv.status}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg ${getInvitationStatusColor(inv.status).split(" ")[0]}`}
                    >
                      {inv.status === "ACCEPTED" ? (
                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                      ) : inv.status === "PENDING" ? (
                        <Sparkles className="size-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <X className="size-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {inv.status.charAt(0) + inv.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${getInvitationStatusColor(inv.status)}`}
                  >
                    {inv.count}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}