/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MapPin,
  Briefcase,
} from "lucide-react";
import { getBranchWeeklySchedule } from "@/services/schedule.services";
import { motion, AnimatePresence } from "framer-motion";
import CreateShiftModal from "./CreateShiftModal";

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const weekDayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BranchWeeklySchedule({
  branchId,
}: {
  branchId: string;
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getStartOfWeek(new Date())
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const weekEnd = addDays(currentWeekStart, 6);
  const startDateStr = currentWeekStart.toISOString();
  const endDateStr = new Date(weekEnd.setHours(23, 59, 59, 999)).toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ["schedules", "weekly", branchId, startDateStr],
    queryFn: () =>
      getBranchWeeklySchedule(branchId, startDateStr, endDateStr).then(
        (res) => res.data
      ),
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

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const today = new Date();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border bg-background p-1">
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
              className="rounded-md p-2 transition-colors hover:bg-muted"
              title="Previous week"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setCurrentWeekStart(getStartOfWeek(new Date()))}
              className="px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-muted"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
              className="rounded-md p-2 transition-colors hover:bg-muted"
              title="Next week"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {currentWeekStart.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="mx-1">–</span>
            <span className="font-semibold text-foreground">
              {weekEnd.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Plus className="size-3.5" />
          Assign Shift
        </button>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid md:grid-cols-7 md:gap-3">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const dayShifts = shiftsByDay[index];

          return (
            <div
              key={index}
              className={`flex flex-col rounded-xl border bg-card shadow-sm transition-colors ${
                isToday
                  ? "border-primary/40 bg-primary/[0.02]"
                  : "border-border"
              }`}
            >
              {/* Day header */}
              <div
                className={`border-b px-3 py-3 text-center ${
                  isToday ? "border-primary/20" : "border-border"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isToday ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {weekDayNames[index]}
                </p>
                <p
                  className={`mt-0.5 text-lg font-bold ${
                    isToday ? "text-primary" : "text-foreground"
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>

              {/* Shifts */}
              <div className="flex-1 space-y-2 p-2">
                {isLoading ? (
                  <div className="space-y-2 py-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-16 animate-pulse rounded-lg bg-muted"
                      />
                    ))}
                  </div>
                ) : dayShifts.length === 0 ? (
                  <div className="flex h-20 items-center justify-center">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                      No shifts
                    </p>
                  </div>
                ) : (
                  dayShifts.map((shift: any, sIdx: number) => (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: sIdx * 0.03,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      className={`group relative rounded-lg border p-2.5 transition-all hover:shadow-sm ${
                        shift.isSubstitute
                          ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/20 dark:bg-amber-950/20"
                          : "border-border bg-background hover:border-primary/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                          <User className="size-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {shift.user?.name || "Unassigned"}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                            <MapPin className="size-2.5" />
                            {shift.classroom?.name || "No room"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <Clock className="size-2.5" />
                          {formatTime(shift.startTime)} –{" "}
                          {formatTime(shift.endTime)}
                        </span>
                        {shift.isSubstitute && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            Sub
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: accordion list */}
      <div className="space-y-3 md:hidden">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === today.toDateString();
          const dayShifts = shiftsByDay[index];
          const isOpen = selectedDay === index;

          return (
            <div
              key={index}
              className={`overflow-hidden rounded-xl border shadow-sm ${
                isToday
                  ? "border-primary/40 bg-primary/[0.02]"
                  : "border-border bg-card"
              }`}
            >
              <button
                onClick={() => setSelectedDay(isOpen ? null : index)}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${
                      isToday
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="text-sm font-bold">{day.getDate()}</span>
                  </div>
                  <div className="text-left">
                    <p
                      className={`text-sm font-semibold ${
                        isToday ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {weekDayNames[index]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dayShifts.length} shift
                      {dayShifts.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`size-4 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
                  >
                    <div className="space-y-2 border-t border-border px-4 py-3">
                      {dayShifts.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No shifts scheduled
                        </p>
                      ) : (
                        dayShifts.map((shift: any) => (
                          <div
                            key={shift.id}
                            className={`rounded-lg border p-3 ${
                              shift.isSubstitute
                                ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/20"
                                : "border-border bg-background"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Briefcase className="size-4 text-muted-foreground" />
                              <span className="text-sm font-semibold text-foreground">
                                {shift.user?.name || "Unassigned"}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {shift.classroom?.name || "No room"}
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <Clock className="size-3" />
                                {formatTime(shift.startTime)} –{" "}
                                {formatTime(shift.endTime)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <CreateShiftModal
            branchId={branchId}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}