"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
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
    queryFn: () => getChildAttendanceHistory(childId).then((res) => res.data as IAttendanceRecordWithNames[]),
  });

  // Format time (e.g., "2:30 PM")
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date (e.g., "Mon, Aug 12")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Attendance Log</h3>
            <p className="text-xs text-muted-foreground">{childName}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !data ? (
            <p className="text-center text-sm text-destructive py-4">Failed to load attendance history.</p>
          ) : data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No attendance records found for the past 30 days.
            </div>
          ) : (
            <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-border pl-10">
              {data.map((record) => (
                <div key={record.id} className="relative">
                  <div className="absolute -left-[1.6rem] flex size-4 items-center justify-center rounded-full bg-background border-2 border-primary mt-1">
                    {record.status === "CHECKED_OUT" ? (
                      <CheckCircle2 className="size-2.5 text-primary" />
                    ) : (
                      <div className="size-1.5 rounded-full bg-primary" />
                    )}
                  </div>

                  <div className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-foreground mb-2">
                      {formatDate(record.createdAt)}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                          <Clock className="size-3" />
                          Dropped off
                        </p>
                        <p className="font-medium text-foreground">{formatTime(record.checkInTime)}</p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                          <Clock className="size-3" />
                          Picked up
                        </p>
                        <p className="font-medium text-foreground">
                          {record.checkOutTime ? formatTime(record.checkOutTime) : "Currently present"}
                        </p>
                      </div>
                    </div>

                    {record.checkOutTime && record.pickedUpByGuardianName && (
                      <div className="mt-3 flex items-center gap-2 rounded bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
                        <User className="size-3.5" />
                        Picked up by {record.pickedUpByGuardianName}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}