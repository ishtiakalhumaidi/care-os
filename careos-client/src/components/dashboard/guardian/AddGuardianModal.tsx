"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { requestGuardian } from "@/services/guardianRequest.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

export default function AddGuardianModal({
  childId,
  onClose,
}: {
  childId: string;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [canPickup, setCanPickup] = useState(true);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => requestGuardian(childId, { email, relationship, canPickup }),
    onSuccess: () => {
      toast.success("Request sent. Staff will review it before this person is added.");
      queryClient.invalidateQueries({ queryKey: ["my-child", childId] });
      onClose();
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Request a new guardian</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          This person doesn&apos;t need an existing account. Staff will review your
          request and send them an invitation directly.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Guardian&apos;s email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Relationship</label>
            <input
              type="text"
              required
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g. Grandmother, Uncle"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={canPickup}
              onChange={(e) => setCanPickup(e.target.checked)}
              className="size-4 rounded border-border"
            />
            Allow this guardian to pick up the child
          </label>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Send request
          </button>
        </form>
      </div>
    </div>
  );
}