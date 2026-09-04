/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  X,
  ShieldAlert,
  AlertTriangle,
  Ban,
  CheckCircle2,
  MessageSquareWarning,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { rejectChild, IChild } from "@/services/child.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

interface RejectChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: IChild;
}

export default function RejectChildModal({
  isOpen,
  onClose,
  child,
}: RejectChildModalProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => rejectChild(child.id, { rejectionReason: reason.trim() }),
    onSuccess: () => {
      toast.success("Application rejected", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
        description: `${child.firstName} ${child.lastName}'s application has been rejected.`,
      });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      handleClose();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to reject application."));
    },
  });

  const handleClose = useCallback(() => {
    if (isPending) return;
    setReason("");
    onClose();
  }, [isPending, onClose]);

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
  const isValid = charCount >= 5 && charCount <= 500;

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
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-destructive/20 bg-card shadow-2xl sm:rounded-2xl max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-destructive/10 bg-destructive/[0.03] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
                  <Ban className="size-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Reject Application
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
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                    This action cannot be undone
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-amber-800/80 dark:text-amber-400/80">
                    The guardian will be notified and will see this reason on
                    their dashboard. The child will remain in{" "}
                    <strong>Rejected</strong> status.
                  </p>
                </div>
              </div>

              {/* Reason field */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MessageSquareWarning className="size-3.5" />
                    Rejection Reason
                  </label>
                  <span
                    className={`text-[10px] font-medium tabular-nums ${
                      charCount > 500
                        ? "text-destructive"
                        : charCount >= 5
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
                  placeholder="e.g. Our infant program is currently at full capacity. We have added your child to our waitlist and will contact you when a spot opens."
                  className={`w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm leading-relaxed outline-none transition-all placeholder:text-muted-foreground/50 disabled:opacity-50 ${
                    charCount > 500
                      ? "border-destructive ring-1 ring-destructive/20 focus:border-destructive"
                      : "border-input hover:border-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  }`}
                />
                {charCount > 0 && charCount < 5 && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-destructive">
                    <ShieldAlert className="size-3" />
                    Please provide at least 5 characters
                  </p>
                )}
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-sm transition-all hover:bg-destructive/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <Ban className="size-4" />
                      Reject Application
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