"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getChildren, IChild } from "@/services/child.services";
import {
  Loader2,
  Baby,
  User,
  Search,
  GraduationCap,
  Shield,
  Users,
  X,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: "easeInOut" as const },
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
          <SkeletonPulse className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-3 w-48" />
          </div>
          <SkeletonPulse className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function TeacherStudentsList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["children", "teacher-view"],
    queryFn: () => getChildren("status=ENROLLED&limit=50"),
  });

  const children: IChild[] = data?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENROLLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            Enrolled
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <div className="size-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "WITHDRAWN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400">
            <div className="size-1.5 rounded-full bg-red-500" />
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
            <div className="size-1.5 rounded-full bg-muted-foreground" />
            {status}
          </span>
        );
    }
  };

  const filteredChildren = useMemo(() => {
    if (!searchQuery.trim()) return children;
    const q = searchQuery.toLowerCase();
    return children.filter(
      (c) =>
        c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.classroom?.name?.toLowerCase().includes(q)
    );
  }, [children, searchQuery]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl space-y-5"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        custom={0}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Students
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${children.length} enrolled students`}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or classroom..."
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
        </div>
      </motion.div>

      {/* Table Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        {/* Table Header */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="size-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Enrollment Roster</h3>
          {!isLoading && (
            <span className="ml-auto text-xs text-muted-foreground">
              {filteredChildren.length} result{filteredChildren.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : children.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 size-16 rounded-full bg-muted/50 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users className="size-7" />
              </div>
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              No enrolled students
            </h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              There are no enrolled students in the system yet.
            </p>
          </div>
        ) : filteredChildren.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="size-7" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-foreground">
              No matches found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence>
              {filteredChildren.map((child, i) => (
                <motion.div
                  key={child.id}
                  variants={fadeInUp}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
                >
                  {/* Avatar */}
                  {child.photoUrl ? (
                    <img
                      src={child.photoUrl}
                      alt={child.firstName}
                      className="size-10 rounded-full object-cover ring-2 ring-border transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-border">
                      <User className="size-5" />
                    </div>
                  )}

                  {/* Name & Details */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {child.firstName} {child.lastName}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Baby className="size-3" />
                      {child.classroom?.name || (
                        <span className="italic">Unassigned</span>
                      )}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">{getStatusBadge(child.status)}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}