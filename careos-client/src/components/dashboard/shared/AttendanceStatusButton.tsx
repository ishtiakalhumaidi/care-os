/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogIn, LogOut, Loader2, Clock } from "lucide-react";
import { requestCheckIn, requestCheckOut, AttendanceStatus } from "@/services/attendance.services";

export default function AttendanceStatusButton({
  childId,
  status,
  reason,
  canPickup = true,
  invalidateKeys,
}: {
  childId: string;
  status?: AttendanceStatus;
  reason?: string | null;
  canPickup?: boolean;
  invalidateKeys: string[][];
}) {
  const queryClient = useQueryClient();

  const { mutate: doRequestCheckIn, isPending: isRequestingIn } = useMutation({
    mutationFn: () => requestCheckIn(childId),
    onSuccess: () => {
      toast.success("Check-in requested. Staff will confirm shortly.");
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: doRequestCheckOut, isPending: isRequestingOut } = useMutation({
    mutationFn: () => requestCheckOut(childId),
    onSuccess: () => {
      toast.success("Pickup requested. Please see staff to finalize.");
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (status === "PENDING_CHECKIN") {
    return (
      <span className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Clock className="size-3.5" />
        Waiting for staff to confirm check-in
      </span>
    );
  }

  if (status === "PENDING_CHECKOUT") {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          <Clock className="size-3.5" />
          {reason ? "Staff requested early pickup" : "Pickup requested. Please see staff."}
        </span>
        {reason && (
          <span className="text-xs font-medium text-destructive">
            Reason: {reason}
          </span>
        )}
      </div>
    );
  }

  if (status === "CHECKED_IN") {
    return (
      <button
        onClick={() => doRequestCheckOut()}
        disabled={isRequestingOut || !canPickup}
        title={!canPickup ? "You are not authorized to pick up this child" : undefined}
        className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
      >
        {isRequestingOut ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
        Request Pickup
      </button>
    );
  }

  return (
    <button
      onClick={() => doRequestCheckIn()}
      disabled={isRequestingIn}
      className="flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
    >
      {isRequestingIn ? <Loader2 className="size-3.5 animate-spin" /> : <LogIn className="size-3.5" />}
      Request Check-In
    </button>
  );
}