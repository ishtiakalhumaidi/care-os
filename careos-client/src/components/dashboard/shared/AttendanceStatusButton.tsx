/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LogIn,
  LogOut,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import {
  requestCheckIn,
  requestCheckOut,
  AttendanceStatus,
} from "@/services/attendance.services";

const fadeIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeInOut" as const },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

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
      toast.success("Check-in requested", {
        description: "Staff will confirm shortly.",
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to request check-in", {
        icon: <AlertCircle className="size-4 text-destructive" />,
      }),
  });

  const { mutate: doRequestCheckOut, isPending: isRequestingOut } = useMutation({
    mutationFn: () => requestCheckOut(childId),
    onSuccess: () => {
      toast.success("Pickup requested", {
        description: "Please see staff to finalize.",
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      );
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to request pickup", {
        icon: <AlertCircle className="size-4 text-destructive" />,
      }),
  });

  /* ─── PENDING_CHECKIN ─── */
  if (status === "PENDING_CHECKIN") {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
        </span>
        <Clock className="size-3.5" />
        Waiting for staff confirmation
      </motion.div>
    );
  }

  /* ─── PENDING_CHECKOUT ─── */
  if (status === "PENDING_CHECKOUT") {
    return (
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="inline-flex flex-col gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
          </span>
          <Clock className="size-3.5" />
          {reason ? "Staff requested early pickup" : "Pickup requested — see staff"}
        </div>
        {reason && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-start gap-1.5 text-xs font-medium text-destructive"
          >
            <AlertCircle className="mt-0.5 size-3 shrink-0" />
            <span>Reason: {reason}</span>
          </motion.p>
        )}
      </motion.div>
    );
  }

  /* ─── CHECKED_IN ─── */
  if (status === "CHECKED_IN") {
    return (
      <motion.button
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        onClick={() => doRequestCheckOut()}
        disabled={isRequestingOut || !canPickup}
        title={
          !canPickup ? "You are not authorized to pick up this child" : undefined
        }
        whileTap={canPickup && !isRequestingOut ? { scale: 0.97 } : undefined}
        className="group inline-flex items-center gap-2 rounded-xl bg-destructive/10 px-5 py-2.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive/20 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRequestingOut ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogOut className="size-4 transition-transform group-hover:translate-x-0.5" />
        )}
        {isRequestingOut ? "Requesting pickup..." : "Request Pickup"}
      </motion.button>
    );
  }

  /* ─── DEFAULT: Request Check-In ─── */
  return (
    <motion.button
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      onClick={() => doRequestCheckIn()}
      disabled={isRequestingIn}
      whileTap={!isRequestingIn ? { scale: 0.97 } : undefined}
      className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRequestingIn ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogIn className="size-4 transition-transform group-hover:-translate-x-0.5" />
      )}
      {isRequestingIn ? "Requesting..." : "Request Check-In"}
    </motion.button>
  );
}