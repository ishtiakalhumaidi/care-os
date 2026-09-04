"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  CheckCircle2,
  User,
  Loader2,
  Calendar,
  ShieldAlert,
  LogIn,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { getChildAttendanceHistory } from "@/services/attendance.services";
import DownloadReportButton from "@/components/ui/DownloadReportButton";

interface IAttendanceRecordWithNames {
  id: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  pickedUpByGuardianName: string | null;
  createdAt: string;
}

export default function GuardianAttendanceHistory({
  childId,
}: {
  childId: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () =>
      getChildAttendanceHistory(childId).then(
        (res) => res.data as IAttendanceRecordWithNames[]
      ),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="mt-2 text-xs text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 text-center">
        <ShieldAlert className="size-8 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">
          Failed to load attendance history
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex min-h-[16rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-10 text-center">
        <Calendar className="size-8 text-muted-foreground/30" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          No records found
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          No attendance data for the past 30 days
        </p>
      </div>
    );
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "—";
    return format(parseISO(dateString), "h:mm a");
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "EEEE, MMM d, yyyy");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Attendance History
            </h3>
            <p className="text-xs text-muted-foreground">Past 30 days</p>
          </div>
        </div>
        <DownloadReportButton
          label="Download Report"
          reportType="ATTENDANCE"
        />
      </div>

      {/* Timeline */}
      <div className="relative space-y-5 pl-2">
        {/* Vertical line */}
        <div className="absolute inset-y-2 left-[19px] w-px bg-border" />

        {data.map((record, idx) => {
          const isCheckedOut = record.status === "CHECKED_OUT";

          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: idx * 0.04,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              className="relative"
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[0.6rem] top-1 flex size-4 items-center justify-center rounded-full border-2 bg-card ${
                  isCheckedOut ? "border-primary" : "border-emerald-500"
                }`}
              >
                {isCheckedOut ? (
                  <CheckCircle2
                    className={`size-2.5 ${
                      isCheckedOut ? "text-primary" : "text-emerald-500"
                    }`}
                  />
                ) : (
                  <div className="size-1.5 rounded-full bg-emerald-500" />
                )}
              </div>

              {/* Card */}
              <div className="ml-6 rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {formatDate(record.createdAt)}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isCheckedOut
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {isCheckedOut ? "Checked Out" : "Present"}
                  </span>
                </div>

                {/* Drop-off / Pick-up grid */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <LogIn className="size-3" />
                      Drop-off
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {formatTime(record.checkInTime)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <LogOut className="size-3" />
                      Pick-up
                    </p>
                    <p className="mt-1 text-lg font-bold text-foreground">
                      {record.checkOutTime
                        ? formatTime(record.checkOutTime)
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Guardian pickup badge */}
                {record.checkOutTime && record.pickedUpByGuardianName && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                    <User className="size-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Picked up by {record.pickedUpByGuardianName}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}