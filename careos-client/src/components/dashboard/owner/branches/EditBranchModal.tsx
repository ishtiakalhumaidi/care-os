/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, X, Building2 } from "lucide-react";
import {
  updateBranch,
  IUpdateBranchPayload,
  IBranch,
} from "@/services/branch.services";

export default function EditBranchModal({
  isOpen,
  onClose,
  branch,
}: {
  isOpen: boolean;
  onClose: () => void;
  branch: IBranch | null;
}) {
  const queryClient = useQueryClient();

  // Lazy init from props — safe because key={branch.id} remounts this component
  const [form, setForm] = useState(() => ({
    name: branch?.name || "",
    address: branch?.address || "",
    city: branch?.city || "",
    state: branch?.state || "",
    postalCode: branch?.postalCode || "",
    country: branch?.country || "",
    contactEmail: branch?.contactEmail || "",
    contactPhone: branch?.contactPhone || "",
    licenseNumber: branch?.licenseNumber || "",
    openTime: branch?.openTime || "",
    closeTime: branch?.closeTime || "",
  }));

  const { mutate, isPending } = useMutation({
    mutationFn: () => updateBranch(branch!.id, form as IUpdateBranchPayload),
    onSuccess: () => {
      toast.success("Branch updated.");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      onClose();
    },
    onError: (err: any) =>
      toast.error(err.message || "Failed to update branch."),
  });

  if (!isOpen || !branch) return null;

  const isValid = form.name.length >= 2 && form.address.length >= 5;
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => !isPending && onClose()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="flex w-full max-w-xl flex-col max-h-[90vh] overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      Edit Branch
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Update {branch.name} details.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isPending && onClose()}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body — text-left forces LTR alignment regardless of global dir */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Basic Information
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-left text-sm font-medium text-foreground">
                        Branch Name
                      </label>
                      <input
                        value={form.name}
                        onChange={set("name")}
                        disabled={isPending}
                        placeholder="e.g., Downtown Campus"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-left text-sm font-medium text-foreground">
                        Address
                      </label>
                      <input
                        value={form.address}
                        onChange={set("address")}
                        disabled={isPending}
                        placeholder="123 Education St, Suite 100"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={form.city}
                        onChange={set("city")}
                        disabled={isPending}
                        placeholder="City"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                      <input
                        value={form.state}
                        onChange={set("state")}
                        disabled={isPending}
                        placeholder="State / Region"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                      <input
                        value={form.postalCode}
                        onChange={set("postalCode")}
                        disabled={isPending}
                        placeholder="Postal Code"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                      <input
                        value={form.country}
                        onChange={set("country")}
                        disabled={isPending}
                        placeholder="Country"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-4">
                    <p className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Contact Details
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="block text-left text-sm font-medium text-foreground">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={form.contactEmail}
                          onChange={set("contactEmail")}
                          disabled={isPending}
                          placeholder="branch@careos.sys"
                          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-left text-sm font-medium text-foreground">
                          Contact Phone
                        </label>
                        <input
                          value={form.contactPhone}
                          onChange={set("contactPhone")}
                          disabled={isPending}
                          placeholder="+1 (555) 000-0000"
                          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="space-y-4">
                    <p className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      License & Hours
                    </p>
                    <div className="space-y-1.5">
                      <label className="block text-left text-sm font-medium text-foreground">
                        License Number
                      </label>
                      <input
                        value={form.licenseNumber}
                        onChange={set("licenseNumber")}
                        disabled={isPending}
                        placeholder="LIC-2024-001"
                        className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-left text-sm font-medium text-foreground">
                          Opens
                        </label>
                        <input
                          type="time"
                          value={form.openTime}
                          onChange={set("openTime")}
                          disabled={isPending}
                          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-left text-sm font-medium text-foreground">
                          Closes
                        </label>
                        <input
                          type="time"
                          value={form.closeTime}
                          onChange={set("closeTime")}
                          disabled={isPending}
                          className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-border px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => !isPending && onClose()}
                  disabled={isPending}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => mutate()}
                  disabled={isPending || !isValid}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}