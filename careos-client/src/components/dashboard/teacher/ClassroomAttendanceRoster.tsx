/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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

import { addOfflineAction } from "@/utils/offlineQueue.util"; 

export default function ClassroomAttendanceRoster({
  classroomId,
  children,
}: {
  classroomId: string;
  children: IClassroomChildSummary[];
}) {
  const queryClient = useQueryClient();
  const [requestingPickupFor, setRequestingPickupFor] =
    useState<IClassroomChildSummary | null>(null);
  const [confirmingCheckout, setConfirmingCheckout] =
    useState<IAttendanceRecord | null>(null);
  const [viewingHistoryFor, setViewingHistoryFor] =
    useState<IClassroomChildSummary | null>(null);
  const [loggingActivityFor, setLoggingActivityFor] =
    useState<IClassroomChildSummary | null>(null);

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

  (matrixData || []).forEach(
    (event: { childId: string; eventType: string }) => {
      if (!matrixByChild.has(event.childId)) {
        matrixByChild.set(event.childId, {});
      }
      const childRecords = matrixByChild.get(event.childId)!;
      childRecords[event.eventType] = (childRecords[event.eventType] || 0) + 1;
    },
  );

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
        attendanceId: attendanceId,
        timestamp: new Date().toISOString(),
      });
      
      toast.success("Saved offline. Will sync when reconnected.");

      queryClient.setQueryData(["attendance", "pending", classroomId], (oldData: any) => {
        if (!oldData) return oldData;
        return { 
          ...oldData, 
          data: oldData.data.filter((a: any) => a.id !== attendanceId) 
        };
      });
    } else {
      doConfirmCheckIn(attendanceId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pending Requests Section */}
      {pending.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Pending requests ({pending.length})
          </h3>
          <ul className="space-y-2">
            {pending.map((r) => (
              <li
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md bg-card px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium text-foreground">
                    {r.child?.firstName} {r.child?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.status === "PENDING_CHECKIN"
                      ? "• Guardian requested check-in"
                      : r.checkOutReason
                        ? `• Staff requested pickup (${r.checkOutReason})`
                        : "• Guardian requested pickup"}
                  </span>
                </div>
                <button
                  onClick={() =>
                    r.status === "PENDING_CHECKIN"
                      ? handleConfirmCheckIn(r.id)
                      : setConfirmingCheckout(r)
                  }
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                >
                  {r.status === "PENDING_CHECKIN"
                    ? "Confirm Check-In"
                    : "Confirm Pickup"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Roster Section */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Roster{" "}
          {isLoadingPresent && (
            <Loader2 className="ml-1 inline size-3 animate-spin" />
          )}
        </h3>
        {children.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No children enrolled in this classroom yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {children.map((c) => {
              const isPresent = presentByChild.has(c.id);
              const hasPending = pendingByChild.has(c.id);
              const childMatrix: Record<string, number> =
                matrixByChild.get(c.id) || {};

              return (
                <li
                  key={c.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt={c.firstName}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Baby className="size-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground text-base">
                        {c.firstName} {c.lastName}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                              Present
                            </>
                          ) : hasPending ? (
                            <>
                              <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />{" "}
                              {pendingByChild.get(c.id)?.status ===
                              "PENDING_CHECKIN"
                                ? "Check-in pending"
                                : "Pickup pending"}
                            </>
                          ) : (
                            <>
                              <Circle className="size-3.5" /> Not checked in
                            </>
                          )}
                        </p>

                        {/* Daily Matrix Indicators */}
                        {isPresent && (
                          <div className="flex items-center gap-1.5 pl-4 border-l border-border">
                            {/* MEAL BADGE */}
                            <span
                              title={`${childMatrix["MEAL"] || 0} Meals logged`}
                              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                                childMatrix["MEAL"]
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground/30"
                              }`}
                            >
                              <Utensils className="size-3.5" />
                              {childMatrix["MEAL"] > 0 && childMatrix["MEAL"]}
                            </span>

                            {/* NAP BADGE */}
                            <span
                              title={`${childMatrix["NAP"] || 0} Naps logged`}
                              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                                childMatrix["NAP"]
                                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                  : "text-muted-foreground/30"
                              }`}
                            >
                              <Moon className="size-3.5" />
                              {childMatrix["NAP"] > 0 && childMatrix["NAP"]}
                            </span>

                            {/* BATHROOM BADGE */}
                            <span
                              title={`${childMatrix["BATHROOM"] || 0} Bathroom breaks logged`}
                              className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                                childMatrix["BATHROOM"]
                                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                  : "text-muted-foreground/30"
                              }`}
                            >
                              <Baby className="size-3.5" />
                              {childMatrix["BATHROOM"] > 0 &&
                                childMatrix["BATHROOM"]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Container */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-0 ml-12 sm:ml-0">
                    {isPresent && (
                      <button
                        onClick={() => setLoggingActivityFor(c)}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Activity className="size-3.5" />
                        Log Activity
                      </button>
                    )}

                    {isPresent && !hasPending && (
                      <button
                        onClick={() => setRequestingPickupFor(c)}
                        className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <LogOut className="size-3.5" />
                        Request Pickup
                      </button>
                    )}

                    <button
                      onClick={() => setViewingHistoryFor(c)}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <History className="size-3.5" />
                      History
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Render Modals */}
      {requestingPickupFor && (
        <StaffCheckoutRequestModal
          childId={requestingPickupFor.id}
          childName={`${requestingPickupFor.firstName} ${requestingPickupFor.lastName}`}
          onClose={() => setRequestingPickupFor(null)}
        />
      )}
      {confirmingCheckout && (
        <ConfirmCheckoutModal
          record={confirmingCheckout}
          onClose={() => setConfirmingCheckout(null)}
        />
      )}
      {viewingHistoryFor && (
        <TeacherChildHistoryModal
          childId={viewingHistoryFor.id}
          childName={`${viewingHistoryFor.firstName} ${viewingHistoryFor.lastName}`}
          onClose={() => setViewingHistoryFor(null)}
        />
      )}
      {loggingActivityFor && (
        <TeacherTimelineLoggerModal
          childId={loggingActivityFor.id}
          childName={`${loggingActivityFor.firstName} ${loggingActivityFor.lastName}`}
          onClose={() => setLoggingActivityFor(null)}
        />
      )}
    </div>
  );
}
