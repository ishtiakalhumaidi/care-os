"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  School,
  Loader2,
  Users,
  MessageSquare,
  Shield,
  Gauge,
  Baby,
} from "lucide-react";
import { getMyClassroomById, IClassroom } from "@/services/classroom.services";
import { startDirectMessage, startClassroomMessage } from "@/services/message.services";
import ClassroomAttendanceRoster from "./ClassroomAttendanceRoster";
import { useChat } from "@/components/providers/ChatContext";
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
    <div className="space-y-6">
      <SkeletonPulse className="h-5 w-32" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <SkeletonPulse className="size-14 rounded-full" />
          <div className="space-y-2">
            <SkeletonPulse className="h-6 w-48" />
            <SkeletonPulse className="h-4 w-32" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <SkeletonPulse className="h-3 w-16" />
              <SkeletonPulse className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClassroomAttendanceDetailView({
  classroomId,
  currentUserId,
}: {
  classroomId: string;
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();
  const { openDrawer } = useChat();

  const {
    data: classroom,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-classroom", classroomId],
    queryFn: () => getMyClassroomById(classroomId).then((res) => res.data as IClassroom),
  });

  const { mutate: startTeamChat, isPending: isStartingTeam } = useMutation({
    mutationFn: () => startClassroomMessage(classroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      openDrawer();
    },
    onError: () => toast.error("Failed to open team chat"),
  });

  const { mutate: startDM, isPending: isStartingDM } = useMutation({
    mutationFn: (targetId: string) => startDirectMessage(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      openDrawer();
    },
    onError: () => toast.error("Failed to start direct message"),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !classroom) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
      >
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <Shield className="size-6 text-destructive" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-destructive">Failed to load classroom</h3>
        <p className="mt-1 text-xs text-destructive/70">
          {(error as Error)?.message || "Something went wrong. Please try again."}
        </p>
      </motion.div>
    );
  }

  const enrolledCount = classroom._count?.children ?? 0;
  const teacherCount = classroom._count?.teacherAssignments ?? 0;
  const utilization = Math.round((enrolledCount / (classroom.legalCapacity || 1)) * 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl space-y-6"
    >
      {/* Back nav */}
      <motion.div variants={fadeInUp} custom={0}>
        <Link
          href="/teacher/dashboard/my-classroom"
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to classrooms
        </Link>
      </motion.div>

      {/* Header Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <School className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {classroom.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {classroom.ageGroup} · {classroom.branch?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 shadow-sm">
                <Baby className="size-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {enrolledCount} enrolled
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5" />
                Capacity
              </p>
              <p className="text-lg font-semibold text-foreground">
                {enrolledCount} <span className="text-muted-foreground">/ {classroom.legalCapacity}</span>
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(utilization, 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-full rounded-full ${
                    utilization > 90 ? "bg-red-500" : utilization > 75 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Gauge className="size-3.5" />
                Ratio limit
              </p>
              <p className="text-lg font-semibold text-foreground">1 : {classroom.ratioLimit}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Users className="size-3.5" />
                Teachers
              </p>
              <p className="text-lg font-semibold text-foreground">{teacherCount}</p>
            </div>
            <div className="space-y-1">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <School className="size-3.5" />
                Utilization
              </p>
              <p className={`text-lg font-semibold ${
                utilization > 90 ? "text-red-500" : utilization > 75 ? "text-amber-500" : "text-emerald-500"
              }`}>
                {utilization}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={fadeInUp} custom={2} className="lg:col-span-2">
          <ClassroomAttendanceRoster classroomId={classroomId}>
            {classroom.children || []}
          </ClassroomAttendanceRoster>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={fadeInUp} custom={3} className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-4 text-primary" />
                </div>
                Teachers in this room
              </h3>
              <button
                onClick={() => startTeamChat()}
                disabled={isStartingTeam}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                {isStartingTeam && <Loader2 className="size-3 animate-spin" />}
                <MessageSquare className="size-3" />
                {isStartingTeam ? "Opening..." : "Team Chat"}
              </button>
            </div>

            {!classroom.teacherAssignments || classroom.teacherAssignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-8 text-center">
                <Users className="mx-auto size-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">No other teachers assigned.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {classroom.teacherAssignments.map((a, i) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-xs font-bold">
                          {a.teacher.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{a.teacher.email}</p>
                      </div>
                    </div>
                    {a.teacher.id !== currentUserId && (
                      <button
                        onClick={() => startDM(a.teacher.id)}
                        disabled={isStartingDM}
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        title="Send Direct Message"
                      >
                        <MessageSquare className="size-4" />
                      </button>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}