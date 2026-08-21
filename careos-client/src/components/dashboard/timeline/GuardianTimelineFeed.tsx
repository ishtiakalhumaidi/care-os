"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Utensils, Moon, Baby, AlertTriangle, MessageSquare, BookOpen, Loader2, Calendar } from "lucide-react";
import { getDailyTimeline, ITimelineEvent } from "@/services/timeline.services";

const getEventConfig = (type: string) => {
  switch (type) {
    case "MEAL": return { icon: Utensils, color: "text-emerald-600 bg-emerald-500/10", label: "Meal Time" };
    case "NAP": return { icon: Moon, color: "text-indigo-600 bg-indigo-500/10", label: "Nap Time" };
    case "BATHROOM": return { icon: Baby, color: "text-sky-600 bg-sky-500/10", label: "Bathroom Break" };
    case "LEARNING": return { icon: BookOpen, color: "text-amber-600 bg-amber-500/10", label: "Learning Activity" };
    case "INCIDENT": return { icon: AlertTriangle, color: "text-destructive bg-destructive/10", label: "Incident Report" };
    case "NOTE": return { icon: MessageSquare, color: "text-primary bg-primary/10", label: "Update" };
    default: return { icon: MessageSquare, color: "text-muted-foreground bg-muted", label: "Update" };
  }
};

// Helper to get today's date in local YYYY-MM-DD format
const getLocalToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function GuardianTimelineFeed({ childId }: { childId: string }) {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalToday());

  const { data, isLoading, isError } = useQuery({
    // The query key now includes selectedDate, so React Query auto-refetches when the date changes
    queryKey: ["timeline", childId, selectedDate],
    queryFn: () => getDailyTimeline(childId, selectedDate).then((res) => res.data as ITimelineEvent[]),
    refetchInterval: selectedDate === getLocalToday() ? 60000 : false, // Only auto-refresh if looking at today
  });

  const events = data || [];
  const isToday = selectedDate === getLocalToday();

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Feed Header with Date Picker */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-foreground">
          {isToday ? "Today's Activities" : "Activity History"}
        </h3>
        <div className="flex items-center gap-2 relative">
          <Calendar className="size-4 text-muted-foreground absolute left-2.5 pointer-events-none" />
          <input
            type="date"
            max={getLocalToday()} // Prevent selecting future dates
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-input bg-background py-1.5 pl-8 pr-3 text-xs text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-muted/50 transition-colors"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive py-4 text-center">Failed to load timeline.</p>
      ) : events.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {isToday ? "No activities logged yet today." : "No activities logged on this date."}
          </p>
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-border pl-12">
          {events.map((event) => {
            const config = getEventConfig(event.eventType);
            const Icon = config.icon;
            
            return (
              <div key={event.id} className="relative">
                {/* Timeline Icon Badge */}
                <div className={`absolute -left-[2.75rem] flex size-8 items-center justify-center rounded-full border-4 border-card ${config.color}`}>
                  <Icon className="size-3.5" />
                </div>
                
                {/* Event Content */}
                <div className="rounded-md border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {event.description && (
                    <p className={`text-sm mt-2 ${event.eventType === "INCIDENT" ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}