/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getBranchById } from "@/services/branch.services";
import {
  ArrowLeft,
  Building2,
  School,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  Lock,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  GraduationCap,
  Activity,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Calendar,

} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import LiveRatioDashboard from "./LiveRatioDashboard";
import BranchActivityAuditStream from "../timeline/BranchActivityAuditStream";
import BranchWeeklySchedule from "../schedule/BranchWeeklySchedule";


const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/* ─── skeletons ─── */
function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
  );
}

function BranchDetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPulse className="h-10 w-40" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <SkeletonPulse className="size-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-7 w-56" />
            <SkeletonPulse className="h-4 w-80" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonPulse className="h-48 w-full" />
          <SkeletonPulse className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
          <SkeletonPulse className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

/* ─── deleted state ─── */
function DeletedBranchState({ basePath }: { basePath: string }) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex min-h-[70vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center shadow-sm"
    >
      <div className="relative">
        <div className="absolute inset-0 size-24 rounded-full bg-slate-200/50 blur-xl dark:bg-slate-700/30" />
        <div className="relative flex size-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Trash2 className="size-10 text-slate-400" />
        </div>
      </div>
      <h2 className="mt-8 text-2xl font-bold tracking-tight text-foreground">
        Branch Permanently Deleted
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        This branch record has been removed from the system. All associated
        classrooms, schedules, and activity data are archived and no longer
        accessible through this view.
      </p>
      <button
        onClick={() => router.push(basePath)}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
      >
        <ArrowLeft className="size-4" />
        Back to Branches
      </button>
    </motion.div>
  );
}

/* ─── locked overlay ─── */
function LockedOverlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-card shadow-sm dark:border-amber-900/30">
      <div className="pointer-events-none absolute inset-0 z-10 bg-background/50 backdrop-blur-[3px]" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="flex size-16 items-center justify-center rounded-2xl bg-amber-100 shadow-lg dark:bg-amber-900/40"
        >
          <Lock className="size-8 text-amber-700 dark:text-amber-400" />
        </motion.div>
        <h3 className="mt-4 text-sm font-bold text-amber-900 dark:text-amber-300">
          Branch Locked
        </h3>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-amber-800/80 dark:text-amber-400/80">
          Operational data is frozen because this branch exceeds your plan
          limit. Upgrade your subscription to restore full access.
        </p>
      </div>
      <div className="opacity-40 grayscale">{children}</div>
    </div>
  );
}

/* ─── status badge ─── */
function StatusBadge({ branch }: { branch: any }) {
  if (branch.deletedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <XCircle className="size-3.5" />
        Deleted
      </span>
    );
  }
  if (!branch.isActive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <Lock className="size-3.5" />
        Plan Locked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      <CheckCircle2 className="size-3.5" />
      Active
    </span>
  );
}

/* ─── info chip ─── */
function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

/* ─── main component ─── */
export default function BranchDetailView({
  branchId,
  basePath,
  classroomsBasePath,
}: {
  branchId: string;
  basePath: string;
  classroomsBasePath: string;
}) {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["branches", branchId],
    queryFn: () => getBranchById(branchId).then((res) => res.data),
  });

  if (isLoading) return <BranchDetailSkeleton />;

  if (isError || !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-16 text-center"
      >
        <ShieldAlert className="size-12 text-destructive/70" />
        <h2 className="mt-4 text-lg font-bold text-destructive">
          Failed to Load Branch
        </h2>
        <p className="mt-2 text-sm text-destructive/80">
          We couldn&apos;t retrieve this branch&apos;s details. Please try again
          later.
        </p>
        <button
          onClick={() => router.push(basePath)}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="size-4" />
          Back to Branches
        </button>
      </motion.div>
    );
  }

  const branch = data;
  const classrooms = branch.classrooms || [];
  const isDeleted = !!branch.deletedAt;
  const isLocked = !branch.isActive && !isDeleted;
  const isActive = branch.isActive && !isDeleted;

  if (isDeleted) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push(basePath)}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to branches
        </button>
        <DeletedBranchState basePath={basePath} />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-[1600px] space-y-6 pb-10"
    >
      {/* ─── back button ─── */}
      <motion.div variants={fadeInUp} custom={0}>
        <button
          onClick={() => router.push(basePath)}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to branches
        </button>
      </motion.div>

      {/* ─── header card ─── */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className={`relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8 ${
          isLocked
            ? "border-amber-200/60 dark:border-amber-900/30"
            : "border-border"
        }`}
      >
        {isLocked && (
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/10" />
        )}
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm sm:size-16 ${
                isLocked
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Building2 className="size-7 sm:size-8" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  {branch.name}
                </h1>
                <StatusBadge branch={branch} />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">
                  {branch.address}
                  {branch.city && `, ${branch.city}`}
                </span>
              </p>

              {/* Info chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <InfoChip icon={Phone} label="Phone" value={branch.contactPhone} />
                <InfoChip icon={Mail} label="Email" value={branch.contactEmail} />
                <InfoChip icon={Clock} label="Timezone" value={branch.timezone} />
                <InfoChip icon={ShieldAlert} label="License" value={branch.licenseNumber} />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-center shadow-sm sm:px-6 sm:py-4">
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                {classrooms.length}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Classrooms
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-center shadow-sm sm:px-6 sm:py-4">
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                {branch._count?.children ?? 0}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Children
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-center shadow-sm sm:px-6 sm:py-4">
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                {branch._count?.staff ?? branch.staff?.length ?? 0}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Staff
              </p>
            </div>
          </div>
        </div>

        {/* Locked banner */}
        <AnimatePresence>
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative mt-6 overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/30 dark:bg-amber-950/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <AlertTriangle className="size-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                    Subscription Limit Reached
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800/80 dark:text-amber-400/80">
                    This branch is locked because it exceeds your current plan
                    limit. You can still view branch information and the classroom
                    list, but operational features like live ratios and
                    scheduling are frozen.{" "}
                    <span className="cursor-pointer font-semibold underline decoration-amber-600/40 underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200">
                      Upgrade your plan
                    </span>{" "}
                    to unlock this branch.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── live ratios ─── */}
      <motion.div variants={fadeInUp} custom={2}>
        {isActive ? (
          <LiveRatioDashboard branchId={branchId} />
        ) : (
          <LockedOverlay>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="size-5 text-muted-foreground" />
                <h3 className="text-base font-semibold">Live Center Ratios</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-card p-5"
                  >
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="mt-4 h-8 w-16 rounded bg-muted" />
                  </div>
                ))}
              </div>
            </div>
          </LockedOverlay>
        )}
      </motion.div>

      {/* ─── main grid ─── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left column */}
        <div className="space-y-6 xl:col-span-8">
          {/* Classrooms */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <School className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Classrooms
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {classrooms.length} room{classrooms.length !== 1 ? "s" : ""}{" "}
                    registered
                  </p>
                </div>
              </div>
              {isActive && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {branch._count?.children ?? 0} total enrolled
                </span>
              )}
            </div>

            {classrooms.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                  <School className="size-6 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">
                  No classrooms yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Classrooms will appear here once they are added to this
                  branch.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((c: any, idx: number) => {
                  const enrolled = c._count?.children ?? 0;
                  const capacity = c.legalCapacity ?? 0;
                  const isFull = capacity > 0 && enrolled >= capacity;
                  const utilization =
                    capacity > 0
                      ? Math.round((enrolled / capacity) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.04,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      onClick={() =>
                        isActive &&
                        router.push(`${classroomsBasePath}/${c.id}`)
                      }
                      className={`group relative rounded-xl border p-4 transition-all ${
                        isActive
                          ? "cursor-pointer border-border bg-background hover:border-primary/30 hover:shadow-md"
                          : "border-border/60 bg-muted/30 opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex size-9 items-center justify-center rounded-lg ${
                              isFull
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <GraduationCap className="size-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {c.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {c.ageGroup || "Mixed Age"}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <ChevronRight className="size-4 text-muted-foreground/0 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
                        )}
                      </div>

                      {/* Utilization bar */}
                      {capacity > 0 && (
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-[10px] font-medium text-muted-foreground">
                            <span>Capacity</span>
                            <span
                              className={
                                isFull
                                  ? "text-destructive"
                                  : utilization > 80
                                  ? "text-amber-600"
                                  : "text-foreground"
                              }
                            >
                              {enrolled}/{capacity}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(utilization, 100)}%`,
                              }}
                              transition={{
                                duration: 0.8,
                                delay: idx * 0.05,
                                ease: [0.22, 1, 0.36, 1] as const,
                              }}
                              className={`h-full rounded-full ${
                                isFull
                                  ? "bg-destructive"
                                  : utilization > 80
                                  ? "bg-amber-500"
                                  : "bg-primary"
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* Teacher count mini */}
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Users className="size-3" />
                        <span>
                          {c._count?.teacherAssignments ?? 0} teacher
                          {(c._count?.teacherAssignments ?? 0) !== 1
                            ? "s"
                            : ""}{" "}
                          assigned
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Weekly Schedule */}
          <motion.div variants={fadeInUp} custom={4}>
            {isActive ? (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
                <div className="mb-6 flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Staff Scheduling
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Weekly shift assignments
                    </p>
                  </div>
                </div>
                <BranchWeeklySchedule branchId={branchId} />
              </div>
            ) : (
              <LockedOverlay>
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Calendar className="size-5 text-muted-foreground" />
                    <h3 className="text-base font-semibold">Staff Scheduling</h3>
                  </div>
                  <div className="h-48 rounded-lg bg-muted" />
                </div>
              </LockedOverlay>
            )}
          </motion.div>
        </div>

        {/* Right column: Activity */}
        <motion.div variants={fadeInUp} custom={5} className="xl:col-span-4">
          <div
            className={`rounded-2xl border bg-card p-5 shadow-sm sm:p-6 ${
              isLocked
                ? "border-amber-200/40 opacity-70 grayscale dark:border-amber-900/20"
                : "border-border"
            }`}
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Activity Stream
                </h3>
                <p className="text-xs text-muted-foreground">
                  Real-time branch events
                </p>
              </div>
            </div>
            <BranchActivityAuditStream branchId={branchId} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}