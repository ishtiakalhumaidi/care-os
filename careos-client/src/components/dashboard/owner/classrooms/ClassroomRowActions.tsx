/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteClassroom, IClassroom } from "@/services/classroom.services";
import EditClassroomModal from "./EditClassroomModal";
import { getApiErrorMessage } from "@/lib/errorUtils";

export default function ClassroomRowActions({
  classroom,
  branches,
}: {
  classroom: IClassroom;
  branches: { id: string; name: string }[];
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: removeClassroom, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteClassroom(classroom.id),
    onSuccess: () => {
      toast.success("Classroom deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      setIsDeleteOpen(false);
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to delete classroom."));
      setIsDeleteOpen(false);
    },
  });

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Edit Classroom"
        >
          <Pencil className="size-4" />
        </button>
        <button
          onClick={() => setIsDeleteOpen(true)}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title="Delete Classroom"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {/* key forces remount → fresh form state, no useEffect needed */}
      <EditClassroomModal
        key={classroom.id}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        classroom={classroom}
        branches={branches}
      />

      {/* Delete Confirmation */}
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
                      Delete Classroom
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Are you sure you want to delete{" "}
                      <span className="font-medium text-foreground">
                        {classroom.name}
                      </span>
                      ? Classrooms with assigned children or staff cannot be
                      deleted — reassign them first.
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
                    onClick={() => removeClassroom()}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                  >
                    {isDeleting && <Loader2 className="size-4 animate-spin" />}
                    {isDeleting ? "Deleting..." : "Delete Classroom"}
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