/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  X,
  PauseCircle,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  MessageSquareWarning,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { suspendChild, IChild } from "@/services/child.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

interface SuspendChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: IChild;
}

export default function SuspendChildModal({
  isOpen,
  onClose,
  child,
}: SuspendChildModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const handleClose = useCallback(() => {
    if (isPending) return;
    setReason("");
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  const { mutate, isPending } = useMutation({
    mutationFn: () => suspendChild(child.id, { reason: reason.trim() }),
    onSuccess: () => {
      toast.success("Child suspended", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
        description: `${child.firstName} ${child.lastName} has been suspended.`,
      });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to suspend child."));
    },
  });

  /* ─── reset on open (derived during render, no effect needed) ─── */
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && reason !== "") {
      setReason("");
    }
  }

  /* ─── escape key ─── */
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, handleClose]);

  const charCount = reason.trim().length;
  const isValid = charCount >= 3 && charCount <= 500;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-amber-200/60 bg-card shadow-2xl sm:rounded-2xl dark:border-amber-900/30 max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-amber-200/30 bg-amber-50/[0.4] px-5 py-4 dark:border-amber-900/20 dark:bg-amber-950/10 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <PauseCircle className="size-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Suspend Student
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {child.firstName} {child.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* Warning banner */}
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50 px-4 py-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                <Lock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                    Access will be temporarily revoked
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80 dark:text-amber-400/80">
                    {child.firstName} will lose check-in access and guardians
                    will be unable to log activities. You can reactivate the
                    account at any time from the student profile.
                  </p>
                </div>
              </div>

              {/* Reason field */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MessageSquareWarning className="size-3.5" />
                    Suspension Reason
                  </label>
                  <span
                    className={`text-[10px] font-medium tabular-nums ${
                      charCount > 500
                        ? "text-destructive"
                        : charCount >= 3
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {charCount}/500
                  </span>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={isPending}
                  rows={4}
                  maxLength={520}
                  autoFocus
                  placeholder="e.g. Payment overdue — account suspended pending invoice settlement"
                  className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed outline-none transition-all placeholder:text-muted-foreground/50 disabled:opacity-50 ${
                    charCount > 500
                      ? "border-destructive ring-1 ring-destructive/20 focus:border-destructive"
                      : "border-input hover:border-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                {charCount > 0 && charCount < 3 && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-destructive">
                    <ShieldAlert className="size-3" />
                    Please provide at least 3 characters
                  </p>
                )}
              </div>

              {/* Current status mini-card */}
              <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Current Status
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Enrolled
                  </span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    <PauseCircle className="size-3" />
                    Suspended
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-5 py-4 sm:px-6">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => mutate()}
                  disabled={isPending || !isValid}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Suspending...
                    </>
                  ) : (
                    <>
                      <PauseCircle className="size-4" />
                      Suspend Student
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}