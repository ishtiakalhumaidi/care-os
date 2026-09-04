/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Pencil,
  CreditCard,
  DollarSign,
  Building2,
  Users,
} from "lucide-react";
import { updatePlan } from "@/services/plan.services";

const inputClass =
  "mt-1.5 block w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

const labelClass = "block text-sm font-semibold text-foreground";

interface IPlan {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxStudents: number;
}

function planToForm(plan: IPlan | null) {
  return {
    name: plan?.name || "",
    price: plan?.price?.toString() || "",
    maxBranches: plan?.maxBranches?.toString() || "",
    maxStudents: plan?.maxStudents?.toString() || "",
  };
}

export default function EditPlanModal({
  isOpen,
  onClose,
  plan,
}: {
  isOpen: boolean;
  onClose: () => void;
  plan: IPlan | null;
}) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(() => planToForm(plan));

  const [prevPlanId, setPrevPlanId] = useState(plan?.id ?? null);
  if ((plan?.id ?? null) !== prevPlanId) {
    setPrevPlanId(plan?.id ?? null);
    setForm(planToForm(plan));
  }

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updatePlan(plan!.id, {
        name: form.name,
        price: Number(form.price),
        maxBranches: Number(form.maxBranches),
        maxStudents: Number(form.maxStudents),
      }),
    onSuccess: () => {
      toast.success("Plan updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      onClose();
    },
    onError: (err: any) => toast.error(err.message || "Failed to update plan."),
  });

  const isValid =
    form.name.trim().length >= 2 &&
    form.price !== "" &&
    Number(form.price) >= 0 &&
    form.maxBranches !== "" &&
    Number(form.maxBranches) > 0 &&
    form.maxStudents !== "" &&
    Number(form.maxStudents) > 0;

  return (
    <AnimatePresence>
      {isOpen && plan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                  <Pencil className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Edit Plan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Update {plan.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isPending}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-5 p-6">
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="size-3.5 text-muted-foreground" />
                    Plan Name
                  </span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Professional, Enterprise"
                  disabled={isPending}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="size-3.5 text-muted-foreground" />
                    Monthly Price
                  </span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="0.00"
                    disabled={isPending}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      Max Branches
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxBranches}
                    onChange={(e) =>
                      setForm({ ...form, maxBranches: e.target.value })
                    }
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-muted-foreground" />
                      Max Students
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.maxStudents}
                    onChange={(e) =>
                      setForm({ ...form, maxStudents: e.target.value })
                    }
                    disabled={isPending}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 p-5">
              <button
                onClick={onClose}
                disabled={isPending}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => mutate()}
                disabled={isPending || !isValid}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                <Pencil className="size-4" />
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
