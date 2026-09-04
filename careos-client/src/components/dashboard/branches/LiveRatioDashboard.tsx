"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Baby,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { getLiveRatioMetrics } from "@/services/branch.services";
import { motion } from "framer-motion";

interface IRatioMetric {
  classroomId: string;
  name: string;
  legalCapacity: number;
  ratioLimit: number;
  teacherCount: number;
  presentChildren: number;
  currentRatio: string | number;
  state: "OK" | "WARNING" | "VIOLATION";
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function LiveRatioDashboard({ branchId }: { branchId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["branches", "live-ratio", branchId],
    queryFn: () => getLiveRatioMetrics(branchId).then((res) => res.data as IRatioMetric[]),
    refetchInterval: 15000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <h3 className="text-base font-semibold">Live Center Ratios</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertTriangle className="mx-auto size-6 text-destructive/70" />
        <p className="mt-2 text-sm font-medium text-destructive">
          Failed to load live ratio metrics.
        </p>
        <p className="text-xs text-destructive/70">Retrying in 15 seconds...</p>
      </div>
    );
  }

  const metrics = data;

  // Summary stats
  const totalChildren = metrics.reduce((sum, m) => sum + m.presentChildren, 0);
  const totalTeachers = metrics.reduce((sum, m) => sum + m.teacherCount, 0);
  const violations = metrics.filter((m) => m.state === "VIOLATION").length;
  const warnings = metrics.filter((m) => m.state === "WARNING").length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Live Center Ratios
            </h3>
            <p className="text-xs text-muted-foreground">
              Updates every 15 seconds
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Baby className="size-3" />
            {totalChildren} children
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
            <UserCheck className="size-3" />
            {totalTeachers} staff
          </span>
          {violations > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
              <AlertTriangle className="size-3" />
              {violations} violation{violations > 1 ? "s" : ""}
            </span>
          )}
          {warnings > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-3" />
              {warnings} warning{warnings > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((room, idx) => {
          const isOk = room.state === "OK";
          const isWarning = room.state === "WARNING";
          const isViolation = room.state === "VIOLATION";

          const actualRatio =
            room.teacherCount > 0
              ? (room.presentChildren / room.teacherCount).toFixed(1)
              : "0.0";
          const ratioNum = parseFloat(actualRatio);
          const limitNum = room.ratioLimit;

          let trendIcon = Minus;
          let trendColor = "text-muted-foreground";
          if (ratioNum > limitNum * 0.9) {
            trendIcon = TrendingUp;
            trendColor = isViolation ? "text-destructive" : "text-amber-500";
          } else if (ratioNum < limitNum * 0.5) {
            trendIcon = TrendingDown;
            trendColor = "text-emerald-500";
          }

          const TrendIcon = trendIcon;

          return (
            <motion.div
              key={room.classroomId}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={idx}
              className={`relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md ${
                isViolation
                  ? "border-destructive/40 bg-destructive/[0.03]"
                  : isWarning
                  ? "border-amber-500/40 bg-amber-500/[0.03]"
                  : "border-border bg-background hover:border-primary/30"
              }`}
            >
              {/* Status stripe */}
              <div
                className={`absolute left-0 top-0 h-full w-1 ${
                  isViolation
                    ? "bg-destructive"
                    : isWarning
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />

              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-foreground">
                    {room.name}
                  </h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Limit 1:{room.ratioLimit}
                  </p>
                </div>

                {isViolation && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                    <AlertTriangle className="size-3" />
                    Violation
                  </span>
                )}
                {isWarning && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <AlertCircle className="size-3" />
                    Near Limit
                  </span>
                )}
                {isOk && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Compliant
                  </span>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Children
                  </p>
                  <p className="mt-1 flex items-baseline gap-1 text-xl font-bold text-foreground">
                    {room.presentChildren}
                    <span className="text-xs font-medium text-muted-foreground">
                      / {room.legalCapacity}
                    </span>
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Teachers
                  </p>
                  <p className="mt-1 text-xl font-bold text-foreground">
                    {room.teacherCount}
                  </p>
                </div>
              </div>

              {/* Ratio bar */}
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Users className="size-3" />
                    Actual Ratio
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold">
                    <TrendIcon className={`size-3 ${trendColor}`} />
                    <span
                      className={
                        isViolation
                          ? "text-destructive"
                          : isWarning
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      1 : {actualRatio}
                    </span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (ratioNum / (limitNum * 1.2)) * 100,
                        100
                      )}%`,
                    }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.05,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                    className={`h-full rounded-full ${
                      isViolation
                        ? "bg-destructive"
                        : isWarning
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>0</span>
                  <span
                    className={
                      isViolation
                        ? "font-bold text-destructive"
                        : isWarning
                        ? "font-bold text-amber-600"
                        : ""
                    }
                  >
                    Limit: 1:{limitNum}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}