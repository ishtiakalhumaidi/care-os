/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  Utensils,
  Moon,
  Baby,
  AlertTriangle,
  MessageSquare,
  BookOpen,
  Loader2,
  Sparkles,
  Stethoscope,
  Palette,
  Footprints,
} from "lucide-react";
import { getBranchAuditStream } from "@/services/timeline.services";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

const getEventConfig = (type: string) => {
  switch (type) {
    case "MEAL":
      return {
        icon: Utensils,
        color: "text-emerald-600 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900/30",
        action: "logged a meal",
        label: "Meal",
      };
    case "NAP":
      return {
        icon: Moon,
        color: "text-indigo-600 bg-indigo-500/10 border-indigo-200 dark:border-indigo-900/30",
        action: "logged a nap",
        label: "Nap",
      };
    case "BATHROOM":
      return {
        icon: Baby,
        color: "text-sky-600 bg-sky-500/10 border-sky-200 dark:border-sky-900/30",
        action: "logged bathroom",
        label: "Bathroom",
      };
    case "LEARNING":
      return {
        icon: BookOpen,
        color: "text-amber-600 bg-amber-500/10 border-amber-200 dark:border-amber-900/30",
        action: "logged learning",
        label: "Learning",
      };
    case "INCIDENT":
      return {
        icon: AlertTriangle,
        color: "text-destructive bg-destructive/10 border-destructive/20",
        action: "reported incident",
        label: "Incident",
      };
    case "NOTE":
      return {
        icon: MessageSquare,
        color: "text-primary bg-primary/10 border-primary/20",
        action: "added note",
        label: "Note",
      };
    case "HEALTH_CHECK":
      return {
        icon: Stethoscope,
        color: "text-rose-600 bg-rose-500/10 border-rose-200 dark:border-rose-900/30",
        action: "health check",
        label: "Health",
      };
    case "ART":
      return {
        icon: Palette,
        color: "text-violet-600 bg-violet-500/10 border-violet-200 dark:border-violet-900/30",
        action: "art activity",
        label: "Art",
      };
    case "PLAY":
      return {
        icon: Footprints,
        color: "text-orange-600 bg-orange-500/10 border-orange-200 dark:border-orange-900/30",
        action: "play time",
        label: "Play",
      };
    default:
      return {
        icon: Activity,
        color: "text-muted-foreground bg-muted border-border",
        action: "logged activity",
        label: "Activity",
      };
  }
};

export default function BranchActivityAuditStream({
  branchId,
}: {
  branchId: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeline", "audit", branchId, "today"],
    queryFn: () => getBranchAuditStream(branchId).then((res) => res.data),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
        <AlertTriangle className="size-6 text-muted-foreground/50" />
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Failed to load activity stream
        </p>
      </div>
    );
  }

  const events = data || [];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Live
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {events.length} event{events.length !== 1 ? "s" : ""} today
        </span>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
          <Sparkles className="size-8 text-muted-foreground/30" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            No activities yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Events will appear here as staff log them
          </p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute inset-y-3 left-[19px] w-px bg-border" />

          {events.map((event: any, idx: number) => {
            const config = getEventConfig(event.eventType);
            const Icon = config.icon;
            const childName = event.child
              ? `${event.child.firstName} ${event.child.lastName.charAt(0)}.`
              : "Unknown Child";
            const staffName = event.loggedBy?.name || "Staff";
            const timeAgo = event.loggedAt
              ? formatDistanceToNow(new Date(event.loggedAt), {
                  addSuffix: true,
                })
              : "";

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: idx * 0.04,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
                className="group relative flex gap-3 py-3"
              >
                {/* Icon bubble */}
                <div
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 ${config.color}`}
                >
                  <Icon className="size-4" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="rounded-lg border border-border bg-background p-3 transition-colors group-hover:border-primary/20 group-hover:bg-primary/[0.02]">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        {staffName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {config.action}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {childName}
                      </span>
                    </div>

                    {event.notes && (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        &ldquo;{event.notes}&rdquo;
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        {new Date(event.loggedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {timeAgo}
                      </span>
                      <span
                        className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}