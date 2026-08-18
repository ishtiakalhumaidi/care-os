/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { getMyUpcomingShifts } from "@/services/schedule.services";

const formatDateTime = (dateString: string) => {
  const d = new Date(dateString);
  const datePart = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return { datePart, timePart };
};

export default function TeacherUpcomingShifts() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["schedules", "my-upcoming"],
    queryFn: () => getMyUpcomingShifts().then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        Failed to load schedule.
      </div>
    );
  }

  const shifts = data || [];

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Clock className="size-4 text-primary" />
          My Upcoming Shifts
        </h3>
      </div>

      {shifts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">No upcoming shifts scheduled.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shifts.map((shift: any) => {
            const { datePart, timePart } = formatDateTime(shift.startTime);
            const endPart = new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Highlight shift if it is scheduled for today
            const isToday = new Date(shift.startTime).toDateString() === new Date().toDateString();

            return (
              <li 
                key={shift.id} 
                className={`rounded-lg border p-4 transition-colors ${
                  isToday ? "border-primary/50 bg-primary/5" : "border-border bg-muted/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className={`font-semibold text-base ${isToday ? "text-primary" : "text-foreground"}`}>
                      {datePart}
                      {isToday && <span className="ml-2 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">Today</span>}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />
                      {timePart} - {endPart}
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1 text-sm">
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <MapPin className="size-3.5 text-muted-foreground" />
                      {shift.classroom.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shift.classroom.branch.name}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}