/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getCurrentAttendance } from "@/services/attendance.services";
import { getMyClassrooms, IClassroom } from "@/services/classroom.services";
import {
  School,
  ChevronRight,
  Users,
  Baby,
  Gauge,

} from "lucide-react";
import DownloadReportButton from "@/components/ui/DownloadReportButton";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeInOut"  as const},
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />;
}

function ClassroomSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export default function MyClassroomView() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-classrooms"],
    queryFn: getMyClassrooms,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", "current"],
    queryFn: () => getCurrentAttendance(""),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonPulse className="h-8 w-48" />
          <SkeletonPulse className="h-9 w-32" />
        </div>
        <ClassroomSkeleton />
      </div>
    );
  }

  const classrooms: IClassroom[] = data?.data || [];

  const presentCountByClassroom = new Map<string, number>();
  (attendanceData?.data || []).forEach((record: any) => {
    const classroomId = record.child?.classroomId;
    if (!classroomId) return;
    presentCountByClassroom.set(classroomId, (presentCountByClassroom.get(classroomId) || 0) + 1);
  });

  if (classrooms.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 size-20 rounded-full bg-muted/50 blur-xl" />
          <div className="relative flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <School className="size-8" />
          </div>
        </div>
        <h3 className="mt-6 text-lg font-bold text-foreground">No classrooms assigned</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          You haven&apos;t been assigned to a classroom yet. Contact your center admin to get started.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-4xl space-y-6"
    >
      <motion.div variants={fadeInUp} custom={0} className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">My Classrooms</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You&apos;re assigned to {classrooms.length} classroom{classrooms.length > 1 ? "s" : ""}
          </p>
        </div>
        <DownloadReportButton label="Print Roster/Logs" reportType="ATTENDANCE" />
      </motion.div>

      <div className="space-y-3">
        {classrooms.map((classroom, i) => {
          const enrolledCount = classroom._count?.children ?? 0;
          const presentCount = presentCountByClassroom.get(classroom.id) ?? 0;
          const utilization = Math.round((enrolledCount / (classroom.legalCapacity || 1)) * 100);

          return (
            <motion.div key={classroom.id} variants={fadeInUp} custom={i + 1}>
              <Link
                href={`/teacher/dashboard/my-classroom/${classroom.id}`}
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm transition-colors group-hover:bg-primary/15">
                    <School className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {classroom.name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Baby className="size-3" />
                        {classroom.ageGroup}
                      </span>
                      <span>·</span>
                      <span>{classroom.branch?.name}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Gauge className="size-3" />
                        1:{classroom.ratioLimit}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            utilization > 90 ? "bg-red-500" : utilization > 75 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {enrolledCount}/{classroom.legalCapacity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:pl-4">
                  <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-sm">
                    <Users className="size-3.5" />
                    {presentCount} present
                  </div>
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}