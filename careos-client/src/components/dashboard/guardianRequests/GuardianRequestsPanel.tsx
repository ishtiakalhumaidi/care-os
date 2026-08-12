"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Check, X, UserCheck, ShieldQuestion } from "lucide-react";
import {
  getPendingGuardianRequests,
  approveGuardianRequest,
  IGuardianRequest,
} from "@/services/guardianRequest.services";
import { getApiErrorMessage } from "@/lib/errorUtils";
import DenyRequestModal from "./DenyRequestModal";

export default function GuardianRequestsPanel() {
  const queryClient = useQueryClient();
  const [denyTargetId, setDenyTargetId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["guardian-requests"],
    queryFn: () =>
      getPendingGuardianRequests().then(
        (res) => res.data as IGuardianRequest[],
      ),
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
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        {(error as Error)?.message || "Failed to load guardian requests"}
      </div>
    );
  }

  const requests = data || [];

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <ShieldQuestion className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          No pending guardian requests right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div
          key={req.id}
          className="rounded-lg border border-border bg-card p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserCheck className="size-4 text-primary" />
                {req.email}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Requested as <span className="font-medium">{req.relationship}</span>{" "}
                for{" "}
                <span className="font-medium text-foreground">
                  {req.child.firstName} {req.child.lastName}
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {req.canPickup
                  ? "Will be allowed to pick up the child"
                  : "Will NOT be allowed to pick up the child"}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Requested by {req.requestedBy.name} ({req.requestedBy.email}) ·{" "}
                {new Date(req.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => approveMutation.mutate(req.id)}
                disabled={approvingId === req.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {approvingId === req.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
                Approve
              </button>
              <button
                onClick={() => setDenyTargetId(req.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                <X className="size-3.5" />
                Deny
              </button>
            </div>
          </div>
        </div>
      ))}

      {denyTargetId && (
        <DenyRequestModal
          requestId={denyTargetId}
          onClose={() => setDenyTargetId(null)}
        />
      )}
    </div>
  );
}