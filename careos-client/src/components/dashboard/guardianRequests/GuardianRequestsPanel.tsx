/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  X,
  UserCheck,
  ShieldQuestion,
  Mail,
  Baby,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  getPendingGuardianRequests,
  approveGuardianRequest,
  IGuardianRequest,
} from "@/services/guardianRequest.services";
import { getApiErrorMessage } from "@/lib/errorUtils";
import DenyRequestModal from "./DenyRequestModal";

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="size-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded-md bg-muted" />
            <div className="h-3 w-56 rounded-md bg-muted" />
            <div className="h-3 w-32 rounded-md bg-muted" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-md bg-muted" />
          <div className="h-8 w-16 rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

/* ─── Child Avatar ─── */
function ChildAvatar({ child }: { child: any }) {
  const initial = (child.firstName?.[0] || child.lastName?.[0] || "?").toUpperCase();
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-border">
      {initial}
    </div>
  );
}

/* ─── Requester Avatar ─── */
function RequesterAvatar({ name }: { name: string }) {
  const initial = name?.[0]?.toUpperCase() || "?";
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
      {initial}
    </div>
  );
}

/* ─── Main Component ─── */
export default function GuardianRequestsPanel() {
  const queryClient = useQueryClient();
  const [denyTarget, setDenyTarget] = useState<IGuardianRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["guardian-requests"],
    queryFn: () =>
      getPendingGuardianRequests().then((res) => res.data as IGuardianRequest[]),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveGuardianRequest(id),
    onMutate: (id) => setApprovingId(id),
    onSuccess: () => {
      toast.success("Approved — invitation sent to the guardian's email.");
      queryClient.invalidateQueries({ queryKey: ["guardian-requests"] });
    },
    onError: (err: unknown) => toast.error(getApiErrorMessage(err)),
    onSettled: () => setApprovingId(null),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <X className="size-5 text-destructive" />
        </div>
        <p className="mt-3 text-sm font-medium text-destructive">
          {(error as Error)?.message || "Failed to load guardian requests"}
        </p>
      </div>
    );
  }

  const requests = data || [];

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <ShieldQuestion className="size-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">
          All caught up
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          No pending guardian requests right now. New requests will appear here
          when a primary guardian invites a co-guardian.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Count header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{requests.length}</span> pending{" "}
          {requests.length === 1 ? "request" : "requests"}
        </p>
      </div>

      {requests.map((req) => (
        <div
          key={req.id}
          className="group relative rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
        >
          {/* Left accent bar */}
          <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-amber-500" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Left: Info */}
            <div className="flex items-start gap-3 pl-3">
              <ChildAvatar child={req.child} />

              <div className="min-w-0 flex-1">
                {/* Email + relationship */}
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {req.email}
                  </p>
                  <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900">
                    {req.relationship}
                  </span>
                </div>

                {/* Child info */}
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Baby className="size-3.5" />
                  For{" "}
                  <span className="font-medium text-foreground">
                    {req.child.firstName} {req.child.lastName}
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>{req.child.childCode}</span>
                </p>

                {/* Pickup permission */}
                <p className="mt-1.5 flex items-center gap-1.5 text-xs">
                  {req.canPickup ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Authorized to pick up child
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="size-3 text-red-500" />
                      <span className="text-red-600 dark:text-red-400">
                        Not authorized to pick up
                      </span>
                    </>
                  )}
                </p>

                {/* Requester meta */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <RequesterAvatar name={req.requestedBy.name} />
                  <span>
                    Requested by <span className="font-medium text-foreground">{req.requestedBy.name}</span>
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <Clock className="size-3" />
                  <span>{new Date(req.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex shrink-0 items-center gap-2 pl-3 sm:pl-0">
              <button
                onClick={() => approveMutation.mutate(req.id)}
                disabled={approvingId === req.id}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {approvingId === req.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Approve
              </button>
              <button
                onClick={() => setDenyTarget(req)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
              >
                <X className="size-3.5" />
                Deny
              </button>
            </div>
          </div>
        </div>
      ))}

      {denyTarget && (
        <DenyRequestModal
          request={denyTarget}
          onClose={() => setDenyTarget(null)}
        />
      )}
    </div>
  );
}