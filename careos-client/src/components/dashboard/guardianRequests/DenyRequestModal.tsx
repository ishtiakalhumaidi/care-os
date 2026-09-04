"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2, AlertTriangle, MessageSquare } from "lucide-react";
import { denyGuardianRequest } from "@/services/guardianRequest.services";
import { getApiErrorMessage } from "@/lib/errorUtils";
import { IGuardianRequest } from "@/services/guardianRequest.services";

export default function DenyRequestModal({
  request,
  onClose,
}: {
  request: IGuardianRequest;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => denyGuardianRequest(request.id, reason || undefined),
    onSuccess: () => {
      toast.success("Request denied");
      queryClient.invalidateQueries({ queryKey: ["guardian-requests"] });
      onClose();
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Deny request</h3>
              <p className="text-xs text-muted-foreground">
                {request.email} · {request.relationship}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4 p-6"
        >
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
              <MessageSquare className="size-3.5" />
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={280}
              placeholder="e.g. Could not verify relationship to the child. This will be shown to the requesting guardian."
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 resize-none"
            />
            <div className="mt-1 flex justify-end">
              <span className={`text-[10px] ${reason.length > 250 ? "text-amber-600" : "text-muted-foreground"}`}>
                {reason.length}/280
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending && <Loader2 className="size-3.5 animate-spin" />}
              Deny request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}