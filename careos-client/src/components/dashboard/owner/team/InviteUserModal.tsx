/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Mail,
  Building2,
  UserCog,
  Baby,
  Link2,
  Send,
  AlertCircle,
} from "lucide-react";
import { inviteUser, IInviteUserPayload } from "@/services/auth.services";

const inviteSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    role: z.enum(["CENTER_ADMIN", "TEACHER", "GUARDIAN"], {
      required_error: "Please select a role",
    }),
    branchId: z.string().min(1, "Please select a branch"),
    childId: z.string().optional(),
    relationship: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "GUARDIAN") {
      if (data.childId && !data.relationship?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["relationship"],
          message: "Relationship is required when linking to a child",
        });
      }
      if (data.relationship?.trim() && !data.childId?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["childId"],
          message: "Child ID is required when specifying a relationship",
        });
      }
    }
  });

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: { id: string; name: string }[];
}

export default function InviteUserModal({
  isOpen,
  onClose,
  branches,
}: InviteUserModalProps) {
  const [role, setRole] = useState<"CENTER_ADMIN" | "TEACHER" | "GUARDIAN">("TEACHER");
  const [serverError, setServerError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      toast.success("Invitation sent successfully.");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setServerError(null);
      onClose();
    },
    onError: (err: any) => {
      setServerError(err.message || "Failed to send invitation.");
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      role: "TEACHER" as "CENTER_ADMIN" | "TEACHER" | "GUARDIAN",
      branchId: branches[0]?.id || "",
      childId: "",
      relationship: "",
    },
    onSubmit: ({ value }) => {
      setServerError(null);
      const result = inviteSchema.safeParse(value);
      if (!result.success) {
        const first = result.error.errors[0];
        toast.error(first.message);
        return;
      }
      const payload: IInviteUserPayload = {
        email: value.email,
        role: value.role,
        branchId: value.branchId,
      };
      if (value.role === "GUARDIAN" && value.childId?.trim() && value.relationship?.trim()) {
        payload.childId = value.childId.trim();
        payload.relationship = value.relationship.trim();
      }
      mutate(payload);
    },
  });

  if (!isOpen) return null;

  const roleOptions = [
    { value: "CENTER_ADMIN", label: "Center Admin", icon: <Building2 className="size-4" /> },
    { value: "TEACHER", label: "Teacher", icon: <UserCog className="size-4" /> },
    { value: "GUARDIAN", label: "Guardian", icon: <Baby className="size-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Send className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Invite Someone</h3>
              <p className="text-xs text-muted-foreground">
                They&apos;ll receive an email with a secure link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Server Error Banner */}
        {serverError && (
          <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {serverError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-5 p-6"
        >
          {/* Email */}
          <form.Field name="email">
            {(field) => (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                  <Mail className="size-3.5" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  placeholder="person@example.com"
                  className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                />
              </div>
            )}
          </form.Field>

          {/* Role + Branch Row */}
          <div className="grid grid-cols-2 gap-4">
            <form.Field name="role">
              {(field) => (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={field.state.value}
                      onChange={(e) => {
                        const val = e.target.value as typeof role;
                        field.handleChange(val);
                        setRole(val);
                      }}
                      disabled={isPending}
                      className="w-full appearance-none rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                    >
                      {roleOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </form.Field>

            <form.Field name="branchId">
              {(field) => (
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                    <Building2 className="size-3.5" />
                    Branch
                  </label>
                  <div className="relative">
                    <select
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isPending}
                      className="w-full appearance-none rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                    >
                      <option value="">Select branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </form.Field>
          </div>

          {/* Guardian Conditional Section */}
          {role === "GUARDIAN" && (
            <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="mb-3 flex items-center gap-2">
                <Link2 className="size-4 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Link to Existing Child
                </p>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                  Optional
                </span>
              </div>
              <p className="mb-3 text-[11px] leading-relaxed text-amber-700/80 dark:text-amber-400/70">
                Only fill this if this guardian is joining a child already enrolled — e.g., a second parent. Leave blank if they will register their own child.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <form.Field name="childId">
                  {(field) => (
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                        Child ID
                      </label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isPending}
                        placeholder="e.g. CH-2026-001"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="relationship">
                  {(field) => (
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                        Relationship
                      </label>
                      <input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isPending}
                        placeholder="e.g. Mother, Father"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:opacity-50"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isPending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}