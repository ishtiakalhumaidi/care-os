/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveBroadcasts,
  acknowledgeBroadcast,
} from "@/services/broadcast.services";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  Loader2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const PriorityConfig = ({ priority }: { priority: string }) => {
  if (priority === "CRITICAL")
    return {
      icon: ShieldAlert,
      border: "border-l-destructive",
      bg: "bg-destructive/10",
      text: "text-destructive",
      label: "Critical",
    };
  if (priority === "WARNING")
    return {
      icon: AlertTriangle,
      border: "border-l-amber-500",
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      label: "Warning",
    };
  return {
    icon: Info,
    border: "border-l-primary",
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Info",
  };
};

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
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-border bg-card text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Fetching alerts...</p>
      </div>
    );
  }

  if (!broadcasts || broadcasts.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-[1.5rem] border border-border bg-card text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <Inbox className="size-8 text-muted-foreground opacity-50" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-foreground">
            You are all caught up
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            No active alerts or announcements at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Active Alerts
        </p>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          {broadcasts.length} unread
        </span>
      </div>

      {broadcasts.map((broadcast: any, idx: number) => {
        const config = PriorityConfig({ priority: broadcast.priority });
        const Icon = config.icon;

        return (
          <motion.div
            key={broadcast.id}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={idx * 0.05}
            className={`overflow-hidden rounded-[1.25rem] border border-border bg-card shadow-sm transition-all hover:border-primary/20 hover:shadow-sm ${config.border} border-l-[3px]`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.text}`}
                >
                  <Icon className="size-5" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-foreground">
                        {broadcast.title}
                      </h3>
                      <span
                        className={`mt-1 inline-block rounded-md px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest ${config.bg} ${config.text}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <span
                      suppressHydrationWarning
                      className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70"
                    >
                      <Clock className="size-3" />
                      {new Date(broadcast.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {broadcast.body}
                  </p>

                  {broadcast.priority === "CRITICAL" && (
                    <div className="mt-4 border-t border-border pt-4">
                      {!broadcast.isAcknowledged ? (
                        <button
                          onClick={() => acknowledge(broadcast.id)}
                          disabled={isPending}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-3 text-sm font-semibold text-destructive-foreground transition-all hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
                        >
                          {isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <ShieldAlert className="size-4" />
                          )}
                          Acknowledge & Mark Safe
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-500">
                          <CheckCircle2 className="size-4" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}