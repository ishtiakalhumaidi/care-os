/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Baby,
  CheckCircle2,
  Circle,
  Clock,
  LogOut,
  Loader2,
  History,
  Activity,
  Utensils,
  Moon,
  MessageSquare,
  Images,
  AlertTriangle,
  Sparkles,
  User,
} from "lucide-react";
import {
  getCurrentAttendance,
  getPendingRequests,
  confirmCheckIn,
  IAttendanceRecord,
} from "@/services/attendance.services";
import { getClassroomDailyMatrix } from "@/services/timeline.services";
import { IClassroomChildSummary } from "@/services/classroom.services";
import StaffCheckoutRequestModal from "@/components/dashboard/shared/StaffCheckoutRequestModal";
import ConfirmCheckoutModal from "@/components/dashboard/shared/ConfirmCheckoutModal";
import TeacherChildHistoryModal from "./TeacherChildHistoryModal";
import TeacherTimelineLoggerModal from "../timeline/TeacherTimelineLoggerModal";
import { useChat } from "@/components/providers/ChatContext";
import { addOfflineAction } from "@/utils/offlineQueue.util";
import Link from "next/link";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeInOut" as const },
  }),
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function RosterSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <SkeletonPulse className="size-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-4 w-32" />
            <SkeletonPulse className="h-3 w-48" />
          </div>
          <SkeletonPulse className="h-8 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export default function ClassroomAttendanceRoster({
  classroomId,
  children,
}: {
  classroomId: string;
  children: IClassroomChildSummary[];
}) {
  const queryClient = useQueryClient();
  const [requestingPickupFor, setRequestingPickupFor] = useState<IClassroomChildSummary | null>(null);
  const [confirmingCheckout, setConfirmingCheckout] = useState<IAttendanceRecord | null>(null);
  const [viewingHistoryFor, setViewingHistoryFor] = useState<IClassroomChildSummary | null>(null);
  const [loggingActivityFor, setLoggingActivityFor] = useState<IClassroomChildSummary | null>(null);
  const { openDrawer } = useChat();

  const { data: presentData, isLoading: isLoadingPresent } = useQuery({
    queryKey: ["attendance", "current", classroomId],
    queryFn: () => getCurrentAttendance(`classroomId=${classroomId}`),
    refetchInterval: 15000,
  });

  const { data: pendingData } = useQuery({
    queryKey: ["attendance", "pending", classroomId],
    queryFn: () => getPendingRequests(`classroomId=${classroomId}`),
    refetchInterval: 15000,
  });

  const { data: matrixData } = useQuery({
    queryKey: ["timeline", "matrix", classroomId, "today"],
    queryFn: () => getClassroomDailyMatrix(classroomId).then((res) => res.data),
    refetchInterval: 60000,
  });

  const present: IAttendanceRecord[] = presentData?.data || [];
  const pending: IAttendanceRecord[] = pendingData?.data || [];

  const presentByChild = new Map(present.map((r) => [r.childId, r]));
  const pendingByChild = new Map(pending.map((r) => [r.childId, r]));

  const matrixByChild = new Map<string, Record<string, number>>();
  (matrixData || []).forEach((event: { childId: string; eventType: string }) => {
    if (!matrixByChild.has(event.childId)) matrixByChild.set(event.childId, {});
    const childRecords = matrixByChild.get(event.childId)!;
    childRecords[event.eventType] = (childRecords[event.eventType] || 0) + 1;
  });

  const { mutate: doConfirmCheckIn } = useMutation({
    mutationFn: (attendanceId: string) => confirmCheckIn(attendanceId),
    onSuccess: () => {
      toast.success("Check-in confirmed.");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleConfirmCheckIn = (attendanceId: string) => {
    if (!navigator.onLine) {
      addOfflineAction({
        type: "CONFIRM_CHECKIN",
        attendanceId,
        timestamp: new Date().toISOString(),
      });
      toast.success("Saved offline. Will sync when reconnected.");
      queryClient.setQueryData(
        ["attendance", "pending", classroomId],
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, data: oldData.data.filter((a: any) => a.id !== attendanceId) };
        }
      );
    } else {
      doConfirmCheckIn(attendanceId);
    }
  };

  const presentCount = children.filter((c) => presentByChild.has(c.id)).length;

  return (
    <div className="space-y-5">
      {/* Pending Requests */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
                <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Pending requests <span className="text-muted-foreground">({pending.length})</span>
              </h3>
            </div>
            <div className="space-y-2">
              {pending.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10">
                      <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {r.child?.firstName} {r.child?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.status === "PENDING_CHECKIN"
                          ? "Guardian requested check-in"
                          : r.checkOutReason
                            ? `Staff requested pickup (${r.checkOutReason})`
                            : "Guardian requested pickup"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      r.status === "PENDING_CHECKIN"
                        ? handleConfirmCheckIn(r.id)
                        : setConfirmingCheckout(r)
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] shrink-0"
                  >
                    {r.status === "PENDING_CHECKIN" ? "Confirm Check-In" : "Confirm Pickup"}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roster */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Classroom Roster</h3>
              <p className="text-xs text-muted-foreground">
                {presentCount} of {children.length} present
                {isLoadingPresent && <Loader2 className="ml-1 inline size-3 animate-spin" />}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${children.length ? (presentCount / children.length) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="p-2">
          {isLoadingPresent && children.length === 0 ? (
            <div className="p-4">
              <RosterSkeleton />
            </div>
          ) : children.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative">
                <div className="absolute inset-0 size-16 rounded-full bg-muted/50 blur-xl" />
                <div className="relative flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Baby className="size-7" />
                </div>
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">No children enrolled</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                This classroom doesn&apos;t have any enrolled children yet.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {children.map((c, i) => {
                const isPresent = presentByChild.has(c.id);
                const hasPending = pendingByChild.has(c.id);
                const childMatrix: Record<string, number> = matrixByChild.get(c.id) || {};
                const record = presentByChild.get(c.id);

                return (
                  <motion.li
                    key={c.id}
                    variants={fadeInUp}
                    custom={i}
                    className="group flex flex-col gap-3 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {c.photoUrl ? (
                        <img
                          src={c.photoUrl}
                          alt={c.firstName}
                          className="size-11 rounded-full object-cover ring-2 ring-border"
                        />
                      ) : (
                        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-border">
                          <User className="size-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {c.firstName} {c.lastName}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              isPresent
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : hasPending
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isPresent ? (
                              <CheckCircle2 className="size-3" />
                            ) : hasPending ? (
                              <Clock className="size-3" />
                            ) : (
                              <Circle className="size-3" />
                            )}
                            {isPresent ? "Present" : hasPending ? "Pending" : "Not checked in"}
                          </span>

                          {isPresent && (
                            <div className="flex items-center gap-1.5">
                              <span
                                title={`${childMatrix["MEAL"] || 0} Meals`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                                  childMatrix["MEAL"]
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Utensils className="size-3" />
                                {childMatrix["MEAL"] > 0 && childMatrix["MEAL"]}
                              </span>
                              <span
                                title={`${childMatrix["NAP"] || 0} Naps`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                                  childMatrix["NAP"]
                                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Moon className="size-3" />
                                {childMatrix["NAP"] > 0 && childMatrix["NAP"]}
                              </span>
                              <span
                                title={`${childMatrix["BATHROOM"] || 0} Bathroom`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                                  childMatrix["BATHROOM"]
                                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Baby className="size-3" />
                                {childMatrix["BATHROOM"] > 0 && childMatrix["BATHROOM"]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pl-14 sm:pl-0">
                      {isPresent && (
                        <button
                          onClick={() => setLoggingActivityFor(c)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-primary/5 hover:border-primary/30"
                        >
                          <Activity className="size-3.5 text-primary" />
                          Log
                        </button>
                      )}

                      {isPresent && !hasPending && (
                        <button
                          onClick={() => setRequestingPickupFor(c)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                        >
                          <LogOut className="size-3.5" />
                          Pickup
                        </button>
                      )}

                      <button
                        onClick={() => setViewingHistoryFor(c)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                        <History className="size-3.5" />
                        History
                      </button>

                      <Link
                        href={`/teacher/dashboard/children/${c.id}/gallery`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                        <Images className="size-3.5" />
                        Gallery
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(c.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                      >
                        <MessageSquare className="size-3.5" />
                        Message
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {requestingPickupFor && (
          <StaffCheckoutRequestModal
            childId={requestingPickupFor.id}
            childName={`${requestingPickupFor.firstName} ${requestingPickupFor.lastName}`}
            onClose={() => setRequestingPickupFor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {confirmingCheckout && (
          <ConfirmCheckoutModal
            record={confirmingCheckout}
            onClose={() => setConfirmingCheckout(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {viewingHistoryFor && (
          <TeacherChildHistoryModal
            childId={viewingHistoryFor.id}
            childName={`${viewingHistoryFor.firstName} ${viewingHistoryFor.lastName}`}
            onClose={() => setViewingHistoryFor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loggingActivityFor && (
          <TeacherTimelineLoggerModal
            childId={loggingActivityFor.id}
            childName={`${loggingActivityFor.firstName} ${loggingActivityFor.lastName}`}
            onClose={() => setLoggingActivityFor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}