/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActiveBroadcasts, acknowledgeBroadcast } from "@/services/broadcast.services";
import { ShieldAlert, AlertTriangle, Info, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AlertsInboxView() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["broadcasts"],
    queryFn: getActiveBroadcasts, 
  });

  
  const broadcasts = data?.data || [];

  const { mutate: acknowledge, isPending } = useMutation({
    mutationFn: acknowledgeBroadcast,
    onSuccess: () => {
      toast.success("Acknowledgment recorded.");
      queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to acknowledge.");
    }
  });

  const PriorityIcon = ({ priority }: { priority: string }) => {
    if (priority === "CRITICAL") return <ShieldAlert className="size-5 text-destructive" />;
    if (priority === "WARNING") return <AlertTriangle className="size-5 text-amber-500" />;
    return <Info className="size-5 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-muted-foreground animate-pulse">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading alerts...</p>
      </div>
    );
  }

  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-muted-foreground bg-card border border-border rounded-xl">
        <CheckCircle2 className="size-12 mb-4 opacity-50" />
        <p className="font-medium">You are all caught up!</p>
        <p className="text-sm">No active alerts or announcements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {broadcasts.map((broadcast: any) => (
        <div 
          key={broadcast.id} 
          className={`relative p-5 rounded-xl border shadow-sm transition-colors ${
            broadcast.priority === "CRITICAL" && !broadcast.isAcknowledged 
              ? "bg-destructive/10 border-destructive/30" 
              : "bg-card border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full shrink-0 ${
              broadcast.priority === "CRITICAL" ? "bg-destructive/10" : "bg-muted"
            }`}>
              <PriorityIcon priority={broadcast.priority} />
            </div>
            
            <div className="flex-1 space-y-1">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-semibold text-base">{broadcast.title}</h3>
                <span 
                  suppressHydrationWarning 
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-background px-2.5 py-1 rounded-md border border-border w-fit"
                >
                  <Clock className="size-3" />
                  {new Date(broadcast.createdAt).toLocaleString("en-US", { 
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
                  })}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                {broadcast.body}
              </p>

              {/* Action Required: Missed Critical Alerts */}
              {broadcast.priority === "CRITICAL" && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  {!broadcast.isAcknowledged ? (
                    <button
                      onClick={() => acknowledge(broadcast.id)}
                      disabled={isPending}
                      className="flex items-center gap-2 bg-destructive text-destructive-foreground px-5 py-2.5 rounded-lg text-sm font-bold transition-transform active:scale-95 disabled:opacity-50 hover:bg-destructive/90"
                    >
                      {isPending ? <Loader2 className="size-4 animate-spin" /> : <ShieldAlert className="size-4" />}
                      Acknowledge & Mark Safe
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                      <CheckCircle2 className="size-4" />
                      Acknowledged
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}