/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { requestCheckOut } from "@/services/attendance.services";

export default function StaffCheckoutRequestModal({
  childId,
  childName,
  onClose,
}: {
  childId: string;
  childName: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => requestCheckOut(childId, reason),
    onSuccess: () => {
      toast.success("Pickup requested from guardian.");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Request pickup — {childName}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          e.g. fever, injury, or end of scheduled care. This starts the pickup process — a
          staff member will still confirm identity when the guardian arrives.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Reason (optional)"
          className="mt-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={() => mutate()}
          disabled={isPending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Send Pickup Request
        </button>
      </div>
    </div>
  );
}