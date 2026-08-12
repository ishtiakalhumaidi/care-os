"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { denyGuardianRequest } from "@/services/guardianRequest.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

export default function DenyRequestModal({
  requestId,
  onClose,
}: {
  requestId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => denyGuardianRequest(requestId, reason || undefined),
    onSuccess: () => {
      toast.success("Request denied");
      queryClient.invalidateQueries({ queryKey: ["guardian-requests"] });
      onClose();
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Deny request</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Reason (optional — shown to the requesting guardian)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Could not verify relationship to the child"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Deny request
          </button>
        </form>
      </div>
    </div>
  );
}