"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Loader2,
  Clock,
  User,
  CheckCircle2,
  History,
  Baby,
} from "lucide-react";
import { getChildAttendanceHistory } from "@/services/attendance.services";

interface IAttendanceRecordWithNames {
  id: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  pickedUpByGuardianName: string | null;
  createdAt: string;
}

export default function TeacherChildHistoryModal({
  childId,
  childName,
  onClose,
}: {
  childId: string;
  childName: string;
  onClose: () => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () =>
      getChildAttendanceHistory(childId).then((res) => res.data as IAttendanceRecordWithNames[]),
  });

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                <History className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Attendance Log</h3>
                <p className="text-xs text-muted-foreground">{childName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[60vh] overflow-y-auto p-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">Loading history...</p>
              </div>
            ) : isError || !data ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <X className="size-6 text-destructive" />
                </div>
                <p className="mt-3 text-sm font-medium text-destructive">Failed to load history</p>
                <p className="text-xs text-muted-foreground">Please try again later.</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="relative">
                  <div className="absolute inset-0 size-16 rounded-full bg-muted/50 blur-xl" />
                  <div className="relative flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Baby className="size-7" />
                  </div>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">No records found</h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  No attendance records for the past 30 days.
                </p>
              </div>
            ) : (
              <div className="relative space-y-5 pl-8 before:absolute before:inset-y-2 before:left-3 before:w-px before:bg-border">
                {data.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="relative"
                  >
                    <div
                      className={`absolute -left-[1.35rem] top-1 flex size-5 items-center justify-center rounded-full border-2 bg-card ${
                        record.status === "CHECKED_OUT"
                          ? "border-emerald-500 text-emerald-500"
                          : "border-primary text-primary"
                      }`}
                    >
                      {record.status === "CHECKED_OUT" ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <div className="size-1.5 rounded-full bg-current" />
                      )}
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-foreground">
                          {formatFullDate(record.createdAt)}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            record.status === "CHECKED_OUT"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {record.status === "CHECKED_OUT" ? "Completed" : "Present"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <Clock className="size-3" />
                            Dropped off
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatTime(record.checkInTime)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                            <Clock className="size-3" />
                            Picked up
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {record.checkOutTime ? formatTime(record.checkOutTime) : "—"}
                          </p>
                        </div>
                      </div>

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
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}