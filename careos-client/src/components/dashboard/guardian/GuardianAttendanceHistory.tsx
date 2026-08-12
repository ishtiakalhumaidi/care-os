"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, User, Loader2, Calendar } from "lucide-react";
import { getChildAttendanceHistory } from "@/services/attendance.services";

// Define the extended interface locally based on our new backend response
interface IAttendanceRecordWithNames {
  id: string;
  status: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  pickedUpByGuardianName: string | null;
  createdAt: string;
}

export default function GuardianAttendanceHistory({ childId }: { childId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () => getChildAttendanceHistory(childId).then((res) => res.data as IAttendanceRecordWithNames[]),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive p-4">Failed to load attendance history.</p>;
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        No attendance records found for the past 30 days.
      </div>
    );
  }

  // Format time (e.g., "2:30 PM")
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date (e.g., "Mon, Aug 12")
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        Recent Attendance (30 Days)
      </h3>

      <div className="relative space-y-4 before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-border pl-10">
        {data.map((record, index) => (
          <div key={record.id} className="relative">
            {/* Timeline dot */}
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

              {/* Show who picked up the child if they are checked out */}
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
    </div>
  );
}