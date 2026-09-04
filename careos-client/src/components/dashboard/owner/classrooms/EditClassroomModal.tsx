/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X, School, ChevronDown } from "lucide-react";
import {
  updateClassroom,
  IUpdateClassroomPayload,
  IClassroom,
} from "@/services/classroom.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

const classroomSchema = z.object({
  name: z.string().min(2, "Classroom name must be at least 2 characters"),
  ageGroup: z.string().min(2, "Age group description is required"),
  legalCapacity: z.coerce.number().int().positive("Capacity must be greater than 0"),
  ratioLimit: z.coerce.number().int().positive("Ratio limit must be greater than 0"),
  branchId: z.string().uuid("Please select a branch"),
});

const validateWithZod = (schema: z.ZodTypeAny) => ({ value }: { value: any }) => {
  const result = schema.safeParse(value);
  if (!result.success) return result.error.errors[0].message;
  return undefined;
};

interface EditClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: IClassroom;
  branches: { id: string; name: string }[];
}

export default function EditClassroomModal({
  isOpen,
  onClose,
  classroom,
  branches,
}: EditClassroomModalProps) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: IUpdateClassroomPayload) => updateClassroom(classroom.id, data),
    onSuccess: () => {
      toast.success("Classroom updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["classrooms"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to update classroom."));
    },
  });

  const form = useForm({
    defaultValues: {
      name: classroom.name,
      ageGroup: classroom.ageGroup,
      legalCapacity: classroom.legalCapacity,
      ratioLimit: classroom.ratioLimit,
      branchId: classroom.branchId,
    },
    onSubmit: ({ value }) => {
      mutate(value as IUpdateClassroomPayload);
    },
  });

  if (!isOpen) return null;

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
            <div className="flex w-full max-w-lg flex-col max-h-[90vh] overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <School className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      Edit Classroom
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Update {classroom.name} details.
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

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-left">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                  }}
                  className="space-y-6"
                >
                  {/* Assignment */}
                  <div className="space-y-4">
                    <p className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Assignment
                    </p>
                    <form.Field
                      name="branchId"
                      validators={{ onChange: validateWithZod(classroomSchema.shape.branchId) }}
                    >
                      {(field) => (
                        <div className="space-y-1.5">
                          <label className="block text-left text-sm font-medium text-foreground">
                            Branch
                          </label>
                          <div className="relative">
                            <select
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(e.target.value)}
                              disabled={isPending}
                              className="h-11 w-full appearance-none rounded-xl border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                            >
                              {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          </div>
                          {field.state.meta.errors[0] && (
                            <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Details */}
                  <div className="space-y-4">
                    <p className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Classroom Details
                    </p>
                    <form.Field
                      name="name"
                      validators={{ onChange: validateWithZod(classroomSchema.shape.name) }}
                    >
                      {(field) => (
                        <div className="space-y-1.5">
                          <label className="block text-left text-sm font-medium text-foreground">
                            Classroom Name
                          </label>
                          <input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isPending}
                            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                          />
                          {field.state.meta.errors[0] && (
                            <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>

                    <form.Field
                      name="ageGroup"
                      validators={{ onChange: validateWithZod(classroomSchema.shape.ageGroup) }}
                    >
                      {(field) => (
                        <div className="space-y-1.5">
                          <label className="block text-left text-sm font-medium text-foreground">
                            Age Group
                          </label>
                          <input
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            disabled={isPending}
                            className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                          />
                          {field.state.meta.errors[0] && (
                            <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                          )}
                        </div>
                      )}
                    </form.Field>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Capacity */}
                  <div className="space-y-4">
                    <p className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Capacity & Ratios
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <form.Field
                        name="legalCapacity"
                        validators={{ onChange: validateWithZod(classroomSchema.shape.legalCapacity) }}
                      >
                        {(field) => (
                          <div className="space-y-1.5">
                            <label className="block text-left text-sm font-medium text-foreground">
                              Max Capacity
                            </label>
                            <input
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(Number(e.target.value))}
                              disabled={isPending}
                              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                            />
                            {field.state.meta.errors[0] && (
                              <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                            )}
                          </div>
                        )}
                      </form.Field>

                      <form.Field
                        name="ratioLimit"
                        validators={{ onChange: validateWithZod(classroomSchema.shape.ratioLimit) }}
                      >
                        {(field) => (
                          <div className="space-y-1.5">
                            <label className="block text-left text-sm font-medium text-foreground">
                              Staff Ratio Limit
                            </label>
                            <input
                              type="number"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(Number(e.target.value))}
                              disabled={isPending}
                              className="h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50"
                            />
                            {field.state.meta.errors[0] && (
                              <p className="text-xs text-destructive">{field.state.meta.errors[0]}</p>
                            )}
                          </div>
                        )}
                      </form.Field>
                    </div>
                  </div>
                </form>
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
                  type="submit"
                  onClick={() => form.handleSubmit()}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}