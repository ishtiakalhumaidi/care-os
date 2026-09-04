"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Utensils,
  Moon,
  Baby,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Loader2,
  Calendar,
  Clock,
  Activity,
} from "lucide-react";
import { getDailyTimeline, ITimelineEvent } from "@/services/timeline.services";

const getEventConfig = (type: string) => {
  switch (type) {
    case "MEAL":
      return {
        icon: Utensils,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        label: "Meal Time",
      };
    case "NAP":
      return {
        icon: Moon,
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20",
        label: "Nap Time",
      };
    case "BATHROOM":
      return {
        icon: Baby,
        color: "text-sky-600 dark:text-sky-400",
        bg: "bg-sky-500/10",
        border: "border-sky-500/20",
        label: "Bathroom Break",
      };
    case "LEARNING":
      return {
        icon: BookOpen,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        label: "Learning Activity",
      };
    case "INCIDENT":
      return {
        icon: AlertTriangle,
        color: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive/20",
        label: "Incident Report",
      };
    case "NOTE":
      return {
        icon: MessageSquare,
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        label: "Update",
      };
    default:
      return {
        icon: Activity,
        color: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border",
        label: "Update",
      };
  }
};

const getLocalToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const fadeInUp = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: "easeInOut" as const },
  }),
};

export default function GuardianTimelineFeed({
  childId,
}: {
  childId: string;
}) {
  const [selectedDate, setSelectedDate] = useState<string>(getLocalToday());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeline", childId, selectedDate],
    queryFn: () =>
      getDailyTimeline(childId, selectedDate).then(
        (res) => res.data as ITimelineEvent[]
      ),
    refetchInterval: selectedDate === getLocalToday() ? 60000 : false,
  });

  const events = data || [];
  const isToday = selectedDate === getLocalToday();

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {isToday ? "Today's Activities" : "Activity History"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {events.length} event{events.length !== 1 ? "s" : ""} logged
            </p>
          </div>
        </div>

        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="date"
            max={getLocalToday()}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-xs font-medium text-foreground shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/50"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="mt-3 text-xs text-muted-foreground">
            Loading timeline...
          </p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-10 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="mt-2 text-sm font-medium text-destructive">
            Failed to load timeline
          </p>
          <p className="mt-1 text-xs text-destructive/70">
            Please try again later.
          </p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 py-12 text-center">
          <div className="relative">
            <div className="absolute inset-0 size-14 rounded-full bg-muted/50 blur-xl" />
            <div className="relative flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Clock className="size-6" />
            </div>
          </div>
          <h4 className="mt-4 text-sm font-semibold text-foreground">
            {isToday ? "No activities yet" : "No activities on this date"}
          </h4>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            {isToday
              ? "Events will appear here as teachers log them throughout the day."
              : "There were no recorded events on the selected date."}
          </p>
        </div>
      ) : (
        <div className="relative space-y-6 pl-2">
          {/* Vertical line */}
          <div className="absolute inset-y-2 left-[1.1875rem] w-px bg-border" />

          <AnimatePresence>
            {events.map((event, i) => {
              const config = getEventConfig(event.eventType);
              const Icon = config.icon;

              return (
                <motion.div
                  key={event.id}
                  variants={fadeInUp}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2.5 top-3 z-10 flex size-5 items-center justify-center rounded-full border-2 border-card ${config.bg}`}
                  >
                    <div className={`size-2 rounded-full ${config.color.replace("text-", "bg-")}`} />
                  </div>

                  {/* Event card */}
                  <div className="ml-10">
                    <div
                      className={`rounded-xl border ${config.border} bg-background p-4 shadow-sm transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex size-8 items-center justify-center rounded-lg ${config.bg}`}
                          >
                            <Icon className={`size-4 ${config.color}`} />
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${config.color}`}
                            >
                              {config.label}
                            </span>
                            {event.createdBy && (
                              <p className="text-[11px] text-muted-foreground">
                                by {event.createdBy.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                          <Clock className="size-3" />
                          {new Date(event.loggedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {event.description && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className={`mt-3 text-sm leading-relaxed ${
                            event.eventType === "INCIDENT"
                              ? "font-medium text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {event.description}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}