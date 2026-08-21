/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { getChildDailyTimeline } from "@/services/timeline.services";
import { 
  Utensils, 
  Moon, 
  Baby, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Clock, 
  Loader2,
  Calendar as CalendarIcon,
  Activity 
} from "lucide-react";

const getEventConfig = (type: string) => {
  switch (type) {
    case "MEAL": return { icon: Utensils, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Meal Time" };
    case "NAP": return { icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10", label: "Nap Time" };
    case "BATHROOM": return { icon: Baby, color: "text-sky-500", bg: "bg-sky-500/10", label: "Bathroom Break" };
    case "INCIDENT": return { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", label: "Incident Reported" };
    case "LEARNING": return { icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10", label: "Learning Activity" };
    case "NOTE": default: return { icon: FileText, color: "text-primary", bg: "bg-primary/10", label: "Staff Note" };
  }
};

export default function GuardianActivityFeed({ childId }: { childId: string }) {
  // Use native date for structural simplicity
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeline", childId, selectedDate],
    queryFn: () => getChildDailyTimeline(childId, selectedDate).then(res => res.data),
    refetchInterval: 30000, // Poll every 30 seconds for live updates
  });

  const events = data || [];

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          Daily Activity Feed
        </h3>
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-muted-foreground" />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load the activity feed.
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
          <Clock className="size-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">No activities logged yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Check back later for updates on your child&apos;s day.</p>
        </div>
      ) : (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {events.map((event: any) => {
            const config = getEventConfig(event.eventType);
            const Icon = config.icon;
            const time = new Date(event.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                {/* Timeline Marker */}
                <div className={`flex items-center justify-center size-10 rounded-full border-4 border-card ${config.bg} ${config.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}>
                  <Icon className="size-4" />
                </div>

                {/* Event Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" /> {time}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-foreground mt-2 leading-relaxed">
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