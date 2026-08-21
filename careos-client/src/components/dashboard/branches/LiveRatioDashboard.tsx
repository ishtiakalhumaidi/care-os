"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getLiveRatioMetrics } from "@/services/branch.services";

interface IRatioMetric {
  classroomId: string;
  name: string;
  legalCapacity: number;
  ratioLimit: number;
  teacherCount: number;
  presentChildren: number;
  currentRatio: string | number;
  state: "OK" | "WARNING" | "VIOLATION";
}

export default function LiveRatioDashboard({ branchId }: { branchId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["branches", "live-ratio", branchId],
    queryFn: () => getLiveRatioMetrics(branchId).then((res) => res.data as IRatioMetric[]),
    refetchInterval: 15000, // Poll every 15 seconds
  });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load live ratio metrics.
      </div>
    );
  }

  const metrics = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </div>
          Live Center Ratios
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((room) => {
          // Dynamic UI states based on mathematical compliance
          const isOk = room.state === "OK";
          const isWarning = room.state === "WARNING";
          const isViolation = room.state === "VIOLATION";

          return (
            <div 
              key={room.classroomId} 
              className={`rounded-lg border p-5 transition-colors ${
                isViolation ? "border-destructive/50 bg-destructive/5" 
                : isWarning ? "border-amber-500/50 bg-amber-500/5" 
                : "border-border bg-card"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <h4 className="font-semibold text-foreground">{room.name}</h4>
                
                {isViolation && <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive uppercase tracking-wider"><AlertTriangle className="size-3" /> Violation</span>}
                {isWarning && <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider"><AlertCircle className="size-3" /> Near Limit</span>}
                {isOk && <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider"><CheckCircle2 className="size-3" /> Compliant</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 divide-x divide-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Present</p>
                  <p className="flex items-baseline gap-1.5 text-2xl font-bold text-foreground">
                    {room.presentChildren}
                    <span className="text-xs font-medium text-muted-foreground">/ {room.legalCapacity}</span>
                  </p>
                </div>
                
                <div className="pl-4">
                  <p className="text-xs text-muted-foreground mb-1">Staffing</p>
                  <p className="flex items-baseline gap-1.5 text-2xl font-bold text-foreground">
                    {room.teacherCount}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-md bg-background px-3 py-2 border border-border">
                <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Users className="size-3.5" /> Required Limit
                </span>
                <span className="text-sm font-semibold text-foreground">
                  1 : {room.ratioLimit}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}