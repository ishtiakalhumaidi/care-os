/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGuardianSplits } from "@/services/child.services";
import { toast } from "sonner";
import {
  Loader2,
  PieChart,
  AlertCircle,
  Save,
  CheckCircle2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/lib/errorUtils";

interface GuardianSplitManagerProps {
  childId: string;
  guardians: any[];
}

/* 
  NOTE: The parent MUST render this with a key prop tied to the child 
  so it remounts fresh when the child changes, e.g.:
  <GuardianSplitManager key={`splits-${child.id}`} ... />
  This avoids syncing props to state during render or in effects.
*/

export default function GuardianSplitManager({
  childId,
  guardians,
}: GuardianSplitManagerProps) {
  const queryClient = useQueryClient();

  // Initialize once from props. Parent controls remount via key.
  const [splits, setSplits] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    guardians.forEach((g) => {
      initial[g.id] = g.splitPercentage ?? (g.isPrimary ? 100 : 0);
    });
    return initial;
  });

  const handleSplitChange = (linkId: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, Number(value) || 0));
    setSplits((prev) => ({ ...prev, [linkId]: numValue }));
  };

  const totalSplit = Object.values(splits).reduce((sum, val) => sum + val, 0);
  const isValid = totalSplit === 100;

  const { mutate: handleSave, isPending } = useMutation({
    mutationFn: () => {
      const payload = Object.entries(splits).map(
        ([linkId, splitPercentage]) => ({
          linkId,
          splitPercentage,
        })
      );
      return updateGuardianSplits(childId, payload);
    },
    onSuccess: () => {
      toast.success("Billing splits updated", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to update splits"));
    },
  });

  if (guardians.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
          <PieChart className="size-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Split-Custody Billing
          </h3>
          <p className="text-xs text-muted-foreground">
            Adjust financial responsibility for future invoices
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {guardians.map((guardian, idx) => (
          <motion.div
            key={guardian.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: idx * 0.04,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
            className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/20"
          >
            <div className="flex items-center gap-3 min-w-0">
              {guardian.user.image ? (
                <img
                  src={guardian.user.image}
                  alt={guardian.user.name}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {guardian.user.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {guardian.user.name || "Unnamed Guardian"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {guardian.relationship}{" "}
                  {guardian.isPrimary && "· Primary"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={splits[guardian.id] ?? 0}
                onChange={(e) => handleSplitChange(guardian.id, e.target.value)}
                className="w-20 rounded-lg border border-input bg-background px-3 py-2 text-right text-sm font-medium text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              <span className="text-sm font-medium text-muted-foreground">
                %
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Progress */}
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Allocation
            </span>
            <span
              className={`text-sm font-bold ${
                isValid
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }`}
            >
              {totalSplit}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(totalSplit, 100)}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
              className={`h-full rounded-full ${
                isValid
                  ? "bg-emerald-500"
                  : totalSplit > 100
                  ? "bg-destructive"
                  : "bg-amber-500"
              }`}
            />
          </div>
          {!isValid && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-destructive">
              <AlertCircle className="size-3" />
              Splits must equal exactly 100%
            </p>
          )}
        </div>

        <button
          onClick={() => handleSave()}
          disabled={!isValid || isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? "Saving..." : "Save Splits"}
        </button>
      </div>
    </motion.div>
  );
}