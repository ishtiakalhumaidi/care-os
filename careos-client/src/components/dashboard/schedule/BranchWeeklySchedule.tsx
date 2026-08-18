/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { getBranchWeeklySchedule } from "@/services/schedule.services";
import CreateShiftModal from "./CreateShiftModal";

// Native Date Helpers for structural efficiency
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function BranchWeeklySchedule({ branchId }: { branchId: string }) {
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekEnd = addDays(currentWeekStart, 6);
  const startDateStr = currentWeekStart.toISOString();
  const endDateStr = new Date(weekEnd.setHours(23, 59, 59, 999)).toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ["schedules", "weekly", branchId, startDateStr],
    queryFn: () => getBranchWeeklySchedule(branchId, startDateStr, endDateStr).then(res => res.data),
  });

  const shifts = data || [];

  const shiftsByDay = useMemo(() => {
    const grouped = Array.from({ length: 7 }, () => [] as any[]);
    shifts.forEach((shift: any) => {
      const shiftDate = new Date(shift.startTime);
      let dayIndex = shiftDate.getDay() - 1; 
      if (dayIndex === -1) dayIndex = 6; 
      
      if (dayIndex >= 0 && dayIndex < 7) {
        grouped[dayIndex].push(shift);
      }
    });
    return grouped;
  }, [shifts]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="space-y-4">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-4">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Weekly Schedule</h3>
            <p className="text-sm text-muted-foreground">
              {currentWeekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border border-border bg-background">
            <button 
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
              className="p-2 hover:bg-muted transition-colors border-r border-border"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button 
              onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
              className="px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors border-r border-border"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              className="p-2 hover:bg-muted transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5" /> Assign Shift
          </button>
        </div>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayShifts = shiftsByDay[index];

          return (
            <div key={index} className={`rounded-lg border p-3 flex flex-col h-[400px] overflow-hidden ${isToday ? "border-primary/50 bg-primary/5" : "border-border bg-card"}`}>
              <div className="mb-3 text-center border-b border-border/50 pb-2">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                  {day.getDate()}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {isLoading ? (
                  <p className="text-xs text-center text-muted-foreground mt-4">Loading...</p>
                ) : dayShifts.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground mt-4">No shifts</p>
                ) : (
                  dayShifts.map((shift: any) => (
                    <div key={shift.id} className="rounded border border-border bg-background p-2 text-xs">
                      <p className="font-semibold text-foreground flex items-center gap-1 mb-1 truncate">
                        <User className="size-3" /> {shift.user.name}
                      </p>
                      <p className="text-muted-foreground flex items-center gap-1 mb-1 truncate">
                        <CalendarIcon className="size-3" /> {shift.classroom.name}
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <Clock className="size-3" /> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                      </p>
                      {shift.isSubstitute && (
                        <span className="mt-1 inline-block rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">SUB</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <CreateShiftModal branchId={branchId} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}