/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock, Utensils, Moon, Baby, AlertTriangle, MessageSquare, BookOpen, Loader2 } from "lucide-react";
import { getBranchAuditStream } from "@/services/timeline.services";

const getEventConfig = (type: string) => {
  switch (type) {
    case "MEAL": return { icon: Utensils, color: "text-emerald-600 bg-emerald-500/10", action: "logged a meal" };
    case "NAP": return { icon: Moon, color: "text-indigo-600 bg-indigo-500/10", action: "logged a nap" };
    case "BATHROOM": return { icon: Baby, color: "text-sky-600 bg-sky-500/10", action: "logged a bathroom break" };
    case "LEARNING": return { icon: BookOpen, color: "text-amber-600 bg-amber-500/10", action: "logged learning" };
    case "INCIDENT": return { icon: AlertTriangle, color: "text-destructive bg-destructive/10", action: "reported an incident" };
    case "NOTE": return { icon: MessageSquare, color: "text-primary bg-primary/10", action: "added a note" };
    default: return { icon: Activity, color: "text-muted-foreground bg-muted", action: "logged an activity" };
  }
};

export default function BranchActivityAuditStream({ branchId }: { branchId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["timeline", "audit", branchId, "today"],
    queryFn: () => getBranchAuditStream(branchId).then((res) => res.data),
    refetchInterval: 30000, // Very aggressive 30s refetch for a live ticker feel
  });

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-destructive">
        Failed to load live audit stream.
      </div>
    );
  }

  const events = data || [];

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-[500px]">
      <div className="flex items-center gap-2 border-b border-border p-5">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </div>
        <h3 className="text-base font-semibold text-foreground">Live Activity Stream</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No activities logged in this branch today.
          </div>
        ) : (
          <div className="relative space-y-6 before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-border pl-12">
            {events.map((event: any) => {
              const config = getEventConfig(event.eventType);
              const Icon = config.icon;
              // Assuming your backend query returned the child relation properly
              const childName = event.child ? `${event.child.firstName} ${event.child.lastName.charAt(0)}.` : "Unknown Child";
              
              return (
                <div key={event.id} className="relative">
                  <div className={`absolute -left-[2.75rem] flex size-8 items-center justify-center rounded-full border-4 border-card ${config.color}`}>
                    <Icon className="size-3.5" />
                  </div>
                  
                  <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
                    <p className="text-foreground">
                      <span className="font-semibold">Staff Member</span> {config.action} for{" "}
                      <span className="font-semibold">{childName}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {new Date(event.loggedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}