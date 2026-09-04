/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getBranches } from "@/services/branch.services";
import { getClassrooms } from "@/services/classroom.services";
import { getActiveBroadcasts } from "@/services/broadcast.services";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  Clock,
  CheckCircle2,
  Megaphone,
  Users,
  Building2,
  School,
} from "lucide-react";
import BroadcastComposer from "./BroadcastComposer";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const PriorityIcon = ({ priority }: { priority: string }) => {
  if (priority === "CRITICAL")
    return <ShieldAlert className="size-5 text-destructive" strokeWidth={2} />;
  if (priority === "WARNING")
    return <AlertTriangle className="size-5 text-amber-500" strokeWidth={2} />;
  return <Info className="size-5 text-primary" strokeWidth={2} />;
};

const PriorityBg = ({ priority }: { priority: string }) => {
  if (priority === "CRITICAL") return "bg-destructive/10 text-destructive";
  if (priority === "WARNING") return "bg-amber-500/10 text-amber-500";
  return "bg-primary/10 text-primary";
};

const AudienceLabel = ({ audience }: { audience: string }) => {
  const map: Record<string, { icon: any; label: string }> = {
    TENANT: { icon: Building2, label: "Organization" },
    BRANCH: { icon: Building2, label: "Branch" },
    CLASSROOM: { icon: School, label: "Classroom" },
  };
  const config = map[audience] || { icon: Users, label: audience };
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      <Icon className="size-3" />
      {config.label}
    </span>
  );
};

export default function BroadcastManagementView() {
  const { data: branchesData } = useQuery({
    queryKey: ["branches", "for-broadcast"],
    queryFn: () => getBranches("limit=100").then((res) => res.data),
  });

  const { data: classroomsData } = useQuery({
    queryKey: ["classrooms", "for-broadcast"],
    queryFn: () => getClassrooms("limit=100").then((res) => res.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["broadcasts"],
    queryFn: getActiveBroadcasts,
  });

  const broadcasts = data?.data || [];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={0}
        className="relative"
      >
        <div className="absolute -top-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="relative text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <Megaphone className="size-3.5 text-primary" />
            Communication Hub
          </span>
          <h1 className="mx-auto max-w-xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Broadcast Center
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            Send announcements, warnings, and critical alerts to your entire
            organization, a single branch, or a specific classroom.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Composer */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="relative lg:col-span-5"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-primary/[0.02] blur-2xl" />
          <div className="relative">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Compose
            </p>
            <BroadcastComposer
              branches={branchesData?.data || []}
              classrooms={classroomsData?.data || []}
            />
          </div>
        </motion.div>

        {/* History */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="lg:col-span-7"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Recent Broadcasts
            </p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              {broadcasts.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-border bg-card text-muted-foreground">
                <Clock className="size-8 animate-pulse" />
                <p className="text-sm">Loading broadcast history...</p>
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-border bg-card text-muted-foreground">
                <CheckCircle2 className="size-10 opacity-40" />
                <p className="font-medium text-foreground">No active broadcasts</p>
                <p className="text-sm">Your broadcast history will appear here.</p>
              </div>
            ) : (
              broadcasts.map((broadcast: any, idx: number) => (
                <motion.div
                  key={broadcast.id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={idx * 0.04}
                  className="group relative overflow-hidden rounded-[1.25rem] border border-border bg-card p-5 transition-all hover:border-primary/20 hover:shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${PriorityBg(
                        { priority: broadcast.priority }
                      )}`}
                    >
                      <PriorityIcon priority={broadcast.priority} />
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="font-display text-sm font-semibold text-foreground">
                          {broadcast.title}
                        </h3>
                        <AudienceLabel audience={broadcast.audience} />
                      </div>

                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {broadcast.body}
                      </p>

                      <div className="flex items-center gap-3 pt-1">
                        <span
                          suppressHydrationWarning
                          className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70"
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
                    </div>

                    {broadcast.priority === "CRITICAL" && (
                      <div className="flex shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-center">
                        <CheckCircle2 className="size-4 text-primary" />
                        <span className="font-display text-sm font-bold text-primary">
                          {broadcast.totalAcknowledgments || 0}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                          Ack&apos;d
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}