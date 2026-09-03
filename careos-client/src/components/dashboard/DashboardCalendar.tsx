"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const academicEvents: Record<string, string[]> = {
  "2026-09-05": ["Staff Meeting"],
  "2026-09-12": ["Parent-Teacher Conference"],
  "2026-09-15": ["Field Trip"],
  "2026-09-20": ["Holiday"],
  "2026-09-25": ["Progress Reports Due"],
};

export default function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getEventKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          <h3 className="font-semibold text-sm">Academic Calendar</h3>
        </div>
        <button
          onClick={goToToday}
          className="text-xs text-primary hover:underline font-medium"
        >
          Today
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold w-32 text-center">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground mb-2">
        {weekDays.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const eventKey = day ? getEventKey(day) : "";
          const hasEvents = day && academicEvents[eventKey]?.length > 0;
          const eventCount = hasEvents ? academicEvents[eventKey].length : 0;

          return (
            <div
              key={i}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-md text-xs relative transition-colors
                ${day ? "hover:bg-muted cursor-pointer" : ""}
                ${day && isToday(day) ? "bg-primary text-primary-foreground font-bold shadow-sm" : ""}
                ${day && !isToday(day) ? "text-foreground" : ""}
              `}
              title={hasEvents ? academicEvents[eventKey].join(", ") : undefined}
            >
              {day}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: Math.min(eventCount, 3) }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`size-1 rounded-full ${
                        isToday(day) ? "bg-primary-foreground/70" : "bg-amber-500"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mini legend */}
      <div className="mt-4 flex items-center gap-3 text-[10px] text-muted-foreground border-t pt-3">
        <div className="flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-amber-500" />
          <span>Event</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="size-1.5 rounded-full bg-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}