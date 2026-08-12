/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Baby, CheckCircle2, Circle, Clock, LogOut, Loader2, History } from "lucide-react"; // Added History icon
import {
  getCurrentAttendance,
  getPendingRequests,
  confirmCheckIn,
  IAttendanceRecord,
} from "@/services/attendance.services";
import { IClassroomChildSummary } from "@/services/classroom.services";
import StaffCheckoutRequestModal from "@/components/dashboard/shared/StaffCheckoutRequestModal";
import ConfirmCheckoutModal from "@/components/dashboard/shared/ConfirmCheckoutModal";
import TeacherChildHistoryModal from "./TeacherChildHistoryModal"; // <-- Import the new modal

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
  const [viewingHistoryFor, setViewingHistoryFor] = useState<IClassroomChildSummary | null>(null); // <-- New state

  const { data: presentData, isLoading: isLoadingPresent } = useQuery({
    queryKey: ["attendance", "current", classroomId],
    queryFn: () => getCurrentAttendance(`classroomId=${classroomId}`),
  });

  const { data: pendingData } = useQuery({
    queryKey: ["attendance", "pending", classroomId],
    queryFn: () => getPendingRequests(`classroomId=${classroomId}`),
    refetchInterval: 15000,
  });

  const present: IAttendanceRecord[] = presentData?.data || [];
  const pending: IAttendanceRecord[] = pendingData?.data || [];

  const presentByChild = new Map(present.map((r) => [r.childId, r]));
  const pendingByChild = new Map(pending.map((r) => [r.childId, r]));

  const { mutate: doConfirmCheckIn } = useMutation({
    mutationFn: (attendanceId: string) => confirmCheckIn(attendanceId),
    onSuccess: () => {
      toast.success("Check-in confirmed.");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      {/* ... [Pending requests section remains exactly the same] ... */}
      {pending.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Pending requests ({pending.length})
          </h3>
          <ul className="space-y-2">
            {pending.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm">
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
                    r.status === "PENDING_CHECKIN" ? doConfirmCheckIn(r.id) : setConfirmingCheckout(r)
                  }
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {r.status === "PENDING_CHECKIN" ? "Confirm Check-In" : "Confirm Pickup"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Roster {isLoadingPresent && <Loader2 className="ml-1 inline size-3 animate-spin" />}
        </h3>
        {children.length === 0 ? (
          <p className="text-sm text-muted-foreground">No children enrolled in this classroom yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {children.map((c) => {
              const isPresent = presentByChild.has(c.id);
              const hasPending = pendingByChild.has(c.id);

              return (
                <li key={c.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {c.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photoUrl} alt={c.firstName} className="size-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Baby className="size-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        {isPresent ? (
                          <>
                            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            Present
                          </>
                        ) : hasPending ? (
                          <>
                            <Clock className="size-3 text-amber-600 dark:text-amber-400" />
                            {pendingByChild.get(c.id)?.status === "PENDING_CHECKIN" ? "Check-in pending" : "Pickup pending"}
                          </>
                        ) : (
                          <>
                            <Circle className="size-3" />
                            Not checked in
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions Container */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-12 sm:ml-0">
                    {isPresent && !hasPending && (
                      <button
                        onClick={() => setRequestingPickupFor(c)}
                        className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <LogOut className="size-3.5" />
                        Request Pickup
                      </button>
                    )}
                    
                    {/* The New History Button */}
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
        <ConfirmCheckoutModal record={confirmingCheckout} onClose={() => setConfirmingCheckout(null)} />
      )}
      
   
      {viewingHistoryFor && (
        <TeacherChildHistoryModal
          childId={viewingHistoryFor.id}
          childName={`${viewingHistoryFor.firstName} ${viewingHistoryFor.lastName}`}
          onClose={() => setViewingHistoryFor(null)}
        />
      )}
    </div>
  );
}