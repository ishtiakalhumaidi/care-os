/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Loader2, Calendar, Clock } from "lucide-react";
import { getMyTimesheetHistory } from "@/services/schedule.services";

export default function TeacherTimesheetHistoryModal({ onClose }: { onClose: () => void }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timesheet", "history"],
    queryFn: () => getMyTimesheetHistory().then(res => res.data),
  });

  const history = data || [];

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return "In Progress";
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card shadow-lg flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between border-b border-border p-4 shrink-0">
          <h2 className="text-lg font-semibold text-foreground">Timesheet History</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted text-muted-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive text-center py-4">Failed to load history.</p>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-border rounded-lg">
              <Clock className="size-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-foreground">No records found</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((record: any) => (
                <li key={record.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/50">
                    <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {new Date(record.clockInTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {calculateDuration(record.clockInTime, record.clockOutTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      <p>In: {new Date(record.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      {record.clockOutTime ? (
                        <p>Out: {new Date(record.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      ) : (
                        <p className="text-emerald-500 font-medium mt-0.5">Currently Active</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}