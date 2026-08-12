/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";
import { confirmCheckOut, IAttendanceRecord } from "@/services/attendance.services";

export default function ConfirmCheckoutModal({
  record,
  onClose,
}: {
  record: IAttendanceRecord;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [guardianId, setGuardianId] = useState("");
  const eligibleGuardians = (record.child?.guardians || []).filter((g) => g.canPickup);

  const { mutate, isPending } = useMutation({
    mutationFn: () => confirmCheckOut(record.id, guardianId),
    onSuccess: () => {
      toast.success("Check-out confirmed.");
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Confirm pickup — {record.child?.firstName} {record.child?.lastName}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>

        {record.checkOutReason && (
          <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Reason: {record.checkOutReason}
          </p>
        )}

        <p className="mt-4 text-xs font-medium text-muted-foreground">Who is picking up?</p>
        <div className="mt-2 space-y-2">
          {eligibleGuardians.length === 0 ? (
            <p className="text-sm text-destructive">
              No guardian on file is authorized for pickup. Contact your admin.
            </p>
          ) : (
            eligibleGuardians.map((g) => (
              <label
                key={g.id}
                className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm cursor-pointer hover:bg-muted"
              >
                <input
                  type="radio"
                  name="guardian"
                  value={g.user.id}
                  checked={guardianId === g.user.id}
                  onChange={() => setGuardianId(g.user.id)}
                  className="size-4"
                />
                {g.user.name}
              </label>
            ))
          )}
        </div>

        <button
          onClick={() => mutate()}
          disabled={isPending || !guardianId}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Confirm Pickup
        </button>
      </div>
    </div>
  );
}