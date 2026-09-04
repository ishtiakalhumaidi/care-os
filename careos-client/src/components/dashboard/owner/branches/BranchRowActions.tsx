/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { deleteBranch, IBranch } from "@/services/branch.services";
import EditBranchModal from "./EditBranchModal";
import { getApiErrorMessage } from "@/lib/errorUtils";

export default function BranchRowActions({ branch }: { branch: IBranch }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const isLocked = !branch.isActive && !branch.deletedAt;
  const isDeleted = !!branch.deletedAt;

  const { mutate: removeBranch, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteBranch(branch.id),
    onSuccess: () => {
      toast.success("Branch deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to delete branch."));
    },
  });

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        {isLocked && (
          <span
            className="mr-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            title="Locked by subscription plan. Upgrade or delete other branches to unlock."
          >
            <Lock className="size-3" />
            Plan locked
          </span>
        )}

        {!isDeleted && !isLocked && (
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Edit Branch"
          >
            <Pencil className="size-4" />
          </button>
        )}

        <button
          onClick={() => setIsDeleteOpen(true)}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Delete Branch"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <EditBranchModal
        key={branch.id}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        branch={branch}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => !isDeleting && setIsDeleteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      Delete Branch
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Are you sure you want to delete{" "}
                      <span className="font-medium text-foreground">
                        {branch.name}
                      </span>
                      ? This will free up a plan slot and cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                    className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => removeBranch()}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {isDeleting && <Loader2 className="size-4 animate-spin" />}
                    {isDeleting ? "Deleting..." : "Delete Branch"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}