/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Baby,
  Loader2,
  Lock,
  AlertCircle,
  Info,
  HeartPulse,
  Stethoscope,
  MapPin,
  GraduationCap,
  Activity,
} from "lucide-react";
import { getMyChildById, IChild } from "@/services/child.services";
import { getChildAttendanceHistory } from "@/services/attendance.services";
import AttendanceStatusButton from "@/components/dashboard/shared/AttendanceStatusButton";
import ManagePickupsCard from "./ManagePickupsCard";
import GuardianAttendanceHistory from "./GuardianAttendanceHistory";
import GuardianTimelineFeed from "../timeline/GuardianTimelineFeed";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeInOut" as const },
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SkeletonPulse className="h-5 w-32" />
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <div className="flex items-center gap-5">
          <SkeletonPulse className="size-20 rounded-full" />
          <div className="space-y-2">
            <SkeletonPulse className="h-7 w-48" />
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-3 w-40" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SkeletonPulse className="h-40 w-full rounded-2xl" />
        <SkeletonPulse className="h-40 w-full rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonPulse className="h-80 w-full rounded-2xl" />
        <SkeletonPulse className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function GuardianChildDetailView({
  childId,
}: {
  childId: string;
}) {
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<IChild>({
    queryKey: ["my-child", childId],
    queryFn: () => getMyChildById(childId).then((res) => res.data),
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () => getChildAttendanceHistory(childId).then((res) => res.data),
    enabled: !!data && data.status === "ENROLLED",
    refetchInterval: 15000,
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 size-16 rounded-full bg-destructive/20 blur-xl" />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
        </div>
        <h3 className="mt-5 text-lg font-bold text-foreground">
          Failed to load details
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {(error as Error)?.message ||
            "The child profile could not be retrieved at this time."}
        </p>
        <Link
          href="/guardian/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 active:scale-[0.98]"
        >
          <ArrowLeft className="size-4" />
          Return to Dashboard
        </Link>
      </motion.div>
    );
  }

  const latestRecord = attendanceHistory?.[0];
  const canPickup = data?.viewerLink?.canPickup ?? true;
  const isCheckedIn = Boolean(latestRecord && !latestRecord.checkOutTime);
  const isLocked = data.status === "REJECTED";

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ENROLLED":
        return {
          label: "Enrolled",
          class:
            "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          dot: "bg-emerald-500",
        };
      case "REJECTED":
        return {
          label: "Declined",
          class:
            "bg-destructive/10 text-destructive border-destructive/20",
          dot: "bg-destructive",
        };
      case "SUSPENDED":
        return {
          label: "Suspended",
          class:
            "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          dot: "bg-amber-500",
        };
      case "APPLIED":
      case "WAITLISTED":
        return {
          label: "Under Review",
          class:
            "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          dot: "bg-blue-500",
        };
      default:
        return {
          label: status,
          class: "bg-muted text-muted-foreground border-border",
          dot: "bg-muted-foreground",
        };
    }
  };

  const statusConfig = getStatusConfig(data.status);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* Back nav */}
      <motion.div variants={fadeInUp} custom={0}>
        <Link
          href="/guardian/dashboard"
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to dashboard
        </Link>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className={`relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm sm:p-8 ${
          isLocked ? "border-destructive/20" : "border-border"
        }`}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-destructive/[0.02]" />
        )}
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {data.photoUrl ? (
                <div
                  className={`relative size-20 overflow-hidden rounded-full border-2 shadow-sm ${
                    isLocked
                      ? "border-muted grayscale"
                      : "border-background ring-2 ring-border"
                  }`}
                >
                  <Image
                    src={data.photoUrl}
                    alt={data.firstName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`flex size-20 items-center justify-center rounded-full shadow-inner ${
                    isLocked
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <Baby className="size-10" />
                </div>
              )}

              {isLocked && (
                <div className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground shadow-md">
                  <Lock className="size-3.5" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {data.firstName} {data.lastName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig.class}`}
                >
                  <span
                    className={`size-1.5 rounded-full ${statusConfig.dot}`}
                  />
                  {statusConfig.label}
                </span>
              </div>

              <p className="mt-1.5 text-sm font-medium text-muted-foreground">
                ID:{" "}
                <span className="font-mono text-foreground/80">
                  {data.childCode}
                </span>
              </p>

              {data.branch && (
                <p className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {data.branch.name}
                  {data.classroom && (
                    <>
                      <span className="text-border">·</span>
                      <GraduationCap className="size-3.5" />
                      {data.classroom.name}
                    </>
                  )}
                </p>
              )}

              {isCheckedIn && latestRecord && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                >
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  <Activity className="size-3.5" />
                  Checked in at{" "}
                  {new Date(latestRecord.checkInTime!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {data.status === "ENROLLED" && (
            <div className="shrink-0">
              <AttendanceStatusButton
                childId={childId}
                status={latestRecord?.status}
                reason={latestRecord?.checkOutReason}
                canPickup={canPickup}
                invalidateKeys={[["attendance", "history", childId]]}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Locked Banner */}
      {isLocked ? (
        <motion.div
          variants={fadeInUp}
          custom={2}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center shadow-sm"
        >
          <div className="relative">
            <div className="absolute inset-0 size-20 rounded-full bg-destructive/20 blur-xl" />
            <div className="relative flex size-20 items-center justify-center rounded-full bg-destructive/10">
              <Lock className="size-8 text-destructive" />
            </div>
          </div>
          <h2 className="mt-6 text-xl font-bold text-foreground">
            Access Locked
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            This application has been declined by the administration. Access to
            detailed records, attendance history, and timeline feeds is
            currently locked.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-medium text-muted-foreground shadow-sm">
            <Info className="size-4" />
            Contact the center administrator for more information.
          </div>
        </motion.div>
      ) : (
        <>
          {/* Medical Info Cards */}
          <motion.div
            variants={fadeInUp}
            custom={2}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/20">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <HeartPulse className="size-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Medical Notes
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {data.medicalNotes || (
                  <span className="italic text-muted-foreground/50">
                    No medical notes on file.
                  </span>
                )}
              </p>
            </div>

            <div className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-rose-500/20">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10">
                  <Stethoscope className="size-5 text-rose-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Allergies
                </h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {data.allergies || (
                  <span className="italic text-muted-foreground/50">
                    No known allergies on file.
                  </span>
                )}
              </p>
            </div>
          </motion.div>

          {/* Core Management Grid */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <div className="space-y-6">
              <ManagePickupsCard
                childId={childId}
                guardians={data.guardians || []}
                viewerLink={data.viewerLink}
              />
              {data.status === "ENROLLED" && (
                <GuardianAttendanceHistory childId={childId} />
              )}
            </div>

            <div className="space-y-6">
              {data.status === "ENROLLED" ? (
                <GuardianTimelineFeed childId={childId} />
              ) : (
                <motion.div
                  variants={fadeInUp}
                  custom={4}
                  className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 size-16 rounded-full bg-muted/50 blur-xl" />
                    <div className="relative flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Info className="size-7" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-foreground">
                    Timeline Unavailable
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    The timeline feed will become active once enrollment is
                    approved.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}