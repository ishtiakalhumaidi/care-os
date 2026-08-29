/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
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
} from "lucide-react";
import BroadcastComposer from "./BroadcastComposer";

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

  const PriorityIcon = ({ priority }: { priority: string }) => {
    if (priority === "CRITICAL")
      return <ShieldAlert className="size-4 text-destructive" />;
    if (priority === "WARNING")
      return <AlertTriangle className="size-4 text-amber-500" />;
    return <Info className="size-4 text-primary" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Composer */}
      <div className="lg:col-span-5 space-y-6">
        <BroadcastComposer
          branches={branchesData?.data || []}
          classrooms={classroomsData?.data || []}
        />
      </div>

      {/* Right Column: History */}
      <div className="lg:col-span-7">
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full">
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold flex items-center gap-2">
              <Clock className="size-5 text-muted-foreground" />
              Recent Broadcasts
            </h2>
          </div>

          <div className="divide-y divide-border">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
                Loading broadcast history...
              </div>
            ) : broadcasts?.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No active broadcasts.
              </div>
            ) : (
              broadcasts?.map((broadcast: any) => (
                <div
                  key={broadcast.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <PriorityIcon priority={broadcast.priority} />
                        <h3 className="font-semibold text-sm">
                          {broadcast.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {broadcast.body}
                      </p>
                      <div className="flex items-center gap-3 pt-2 text-[11px] font-medium text-muted-foreground">
                        <span className="capitalize bg-muted px-2 py-0.5 rounded-md">
                          {broadcast.audience.toLowerCase()}
                        </span>
                        <span suppressHydrationWarning>
                          {new Date(broadcast.createdAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Acknowledgment Stats (Visible to Admins) */}
                    {broadcast.priority === "CRITICAL" && (
                      <div className="flex flex-col items-center justify-center shrink-0 bg-primary/10 text-primary border border-primary/20 rounded-lg p-2 min-w-[70px]">
                        <CheckCircle2 className="size-4 mb-1" />

                        <span className="text-xs font-bold">
                          {broadcast.totalAcknowledgments || 0}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider">
                          Ack&apos;d
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
