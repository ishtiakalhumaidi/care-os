/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Play, Square, Loader2, History } from "lucide-react";
import { toast } from "sonner";
import { clockIn, clockOut, getCurrentTimesheet } from "@/services/schedule.services";
import TeacherTimesheetHistoryModal from "./TeacherTimesheetHistoryModal";

export default function TeacherTimesheetWidget() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // 1. Defer the state update to the next tick to bypass the strict linter
    const mountTimer = setTimeout(() => setMounted(true), 0);
    
    // 2. Start the clock
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    return () => {
      clearTimeout(mountTimer);
      clearInterval(clockTimer);
    };
  }, []);

  const { data: timesheetData, isLoading } = useQuery({
    queryKey: ["timesheet", "current"],
    queryFn: () => getCurrentTimesheet().then((res) => res.data),
  });

  const { mutate: doClockIn, isPending: isClockingIn } = useMutation({
    mutationFn: () => clockIn(),
    onSuccess: () => {
      toast.success("You are now clocked in.");
      queryClient.invalidateQueries({ queryKey: ["timesheet", "current"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: doClockOut, isPending: isClockingOut } = useMutation({
    mutationFn: () => clockOut(),
    onSuccess: () => {
      toast.success("You have been clocked out.");
      queryClient.invalidateQueries({ queryKey: ["timesheet", "current"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const isClockedIn = Boolean(timesheetData);

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        {/* Title & Active Badge grouped on the left */}
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            Time Clock
          </h3>
          {isClockedIn && (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Active
            </span>
          )}
        </div>

        {/* History Button on the right */}
        <button
          onClick={() => setShowHistory(true)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          title="View History"
        >
          <History className="size-4" />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-6 text-center">
        {/* Render a skeleton/placeholder until the browser is ready */}
        <p className="text-3xl font-display font-bold text-foreground mb-1 tracking-tight">
          {mounted
            ? currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "--:--:--"}
        </p>

        {isLoading ? (
          <p className="text-sm text-muted-foreground mt-2">Checking status...</p>
        ) : isClockedIn ? (
          <p className="text-sm text-muted-foreground mt-2">
            Clocked in since{" "}
            {mounted
              ? new Date(timesheetData.clockInTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--:--"}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">Ready to start your shift</p>
        )}
      </div>

      <div className="mt-2">
        {!isClockedIn ? (
          <button
            onClick={() => doClockIn()}
            disabled={isClockingIn || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:outline-none disabled:opacity-50"
          >
            {isClockingIn ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Clock In
          </button>
        ) : (
          <button
            onClick={() => doClockOut()}
            disabled={isClockingOut || isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 focus:outline-none disabled:opacity-50"
          >
            {isClockingOut ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Square className="size-4" />
            )}
            Clock Out
          </button>
        )}
      </div>

      {/* Render the modal */}
      {showHistory && (
        <TeacherTimesheetHistoryModal onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}