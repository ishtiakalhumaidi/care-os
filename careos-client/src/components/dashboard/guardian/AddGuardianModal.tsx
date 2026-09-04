/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  X,
  Loader2,
  UserPlus,
  Mail,
  Users,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { requestGuardian } from "@/services/guardianRequest.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass = "block text-sm font-semibold text-foreground";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeInOut" as const },
  }),
};

interface AddGuardianModalProps {
  childId: string;
  onClose: () => void;
}

export default function AddGuardianModal({
  childId,
  onClose,
}: AddGuardianModalProps) {
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");
  const [canPickup, setCanPickup] = useState(true);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      requestGuardian(childId, { email, relationship, canPickup }),
    onSuccess: () => {
      toast.success("Request sent successfully", {
        description: "Staff will review it before this person is added.",
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["my-child", childId] });
      handleClose();
    },
    onError: (error: unknown) =>
      toast.error(getApiErrorMessage(error), {
        icon: <AlertCircle className="size-4 text-destructive" />,
      }),
  });

  const handleClose = useCallback(() => {
    if (mutation.isPending) return;
    setEmail("");
    setRelationship("");
    setCanPickup(true);
    onClose();
  }, [mutation.isPending, onClose]);

  /* ─── escape key ─── */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  /* ─── lock body scroll ─── */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const isValid =
    email.trim().length > 0 &&
    email.includes("@") &&
    relationship.trim().length >= 2;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <UserPlus className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Request a New Guardian
                </h3>
                <p className="text-xs text-muted-foreground">
                  Staff will review before sending an invitation
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={mutation.isPending}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="space-y-5 p-6"
          >
            <motion.div variants={fadeInUp} custom={0} initial="hidden" animate="visible">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  Guardian&apos;s email
                </span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@example.com"
                disabled={mutation.isPending}
                className={inputClass}
                autoFocus
              />
            </motion.div>

            <motion.div variants={fadeInUp} custom={1} initial="hidden" animate="visible">
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-muted-foreground" />
                  Relationship
                </span>
              </label>
              <input
                type="text"
                required
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Grandmother, Uncle, Babysitter"
                disabled={mutation.isPending}
                className={inputClass}
              />
            </motion.div>

            <motion.div
              variants={fadeInUp}
              custom={2}
              initial="hidden"
              animate="visible"
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4"
            >
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  id="canPickup"
                  checked={canPickup}
                  onChange={(e) => setCanPickup(e.target.checked)}
                  disabled={mutation.isPending}
                  className="size-4 rounded border-border text-primary focus:ring-primary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="canPickup"
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground cursor-pointer"
                >
                  <ShieldCheck className="size-3.5 text-muted-foreground" />
                  Allow pickup authorization
                </label>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  This guardian will be able to check the child in and out of the center.
                </p>
              </div>
            </motion.div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-5 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={mutation.isPending}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !isValid}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              <Send className="size-4" />
              {mutation.isPending ? "Sending..." : "Send Request"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}