"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getMyClassroomById, IClassroom } from "@/services/classroom.services";
import {
  ArrowLeft,
  School,
  Baby,
  Loader2,
  Users,
  Gauge,
  Sparkles,
  Mail,
  Shield,
  User,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeInOut"  as const },
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPulse className="h-5 w-32" />
      <SkeletonPulse className="h-40 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonPulse className="h-64 w-full rounded-2xl" />
        <SkeletonPulse className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function TeacherClassroomDetailView({
  classroomId,
}: {
  classroomId: string;
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-classroom", classroomId],
    queryFn: () => getMyClassroomById(classroomId).then((res) => res.data as IClassroom),
  });

  if (isLoading) return <DetailSkeleton />;

  if (isError || !data) {
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
          {(error as Error)?.message || "Something went wrong."}
        </p>
      </motion.div>
    );
  }

  const classroom = data;
  const enrolledCount = classroom._count?.children ?? 0;
  const teacherCount = classroom._count?.teacherAssignments ?? 0;
  const utilization = Math.round((enrolledCount / (classroom.legalCapacity || 1)) * 100);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl space-y-6"
    >
      <motion.div variants={fadeInUp} custom={0}>
        <Link
          href="/teacher/dashboard/my-classroom"
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to classrooms
        </Link>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <School className="size-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{classroom.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {classroom.ageGroup} · {classroom.branch?.name}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 sm:grid-cols-4">
            {[
              { label: "Capacity", value: `${enrolledCount} / ${classroom.legalCapacity}`, icon: Users },
              { label: "Ratio", value: `1 : ${classroom.ratioLimit}`, icon: Gauge },
              { label: "Teachers", value: `${teacherCount}`, icon: School },
              {
                label: "Utilization",
                value: `${utilization}%`,
                icon: Sparkles,
                color:
                  utilization > 90
                    ? "text-red-500"
                    : utilization > 75
                      ? "text-amber-500"
                      : "text-emerald-500",
              },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <stat.icon className="size-3.5" />
                  {stat.label}
                </p>
                <p className={`text-xl font-bold ${stat.color || "text-foreground"}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {utilization > 0 && (
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(utilization, 100)}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full rounded-full ${
                  utilization > 90 ? "bg-red-500" : utilization > 75 ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Teachers */}
        <motion.div
          variants={fadeInUp}
          custom={2}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Users className="size-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Teachers in this room</h3>
          </div>

          {!classroom.teacherAssignments || classroom.teacherAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
              <Users className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No teachers assigned.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {classroom.teacherAssignments.map((a, i) => (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-xs font-bold">
                      {a.teacher.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{a.teacher.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Mail className="size-3" />
                      {a.teacher.email}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Children */}
        <motion.div
          variants={fadeInUp}
          custom={3}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Baby className="size-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Enrolled children <span className="text-muted-foreground">({enrolledCount})</span>
            </h3>
          </div>

          {!classroom.children || classroom.children.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
              <Baby className="size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">No children enrolled yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {classroom.children.map((c, i) => (
                <motion.li
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:bg-muted/30"
                >
                  {c.photoUrl ? (
                    <img
                      src={c.photoUrl}
                      alt={c.firstName}
                      className="size-9 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-border">
                      <User className="size-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {c.firstName} {c.lastName}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}