/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, X, Info } from "lucide-react";
import { inviteUser, IInviteUserPayload } from "@/services/auth.services";

const inviteSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    role: z.enum(["CENTER_ADMIN", "TEACHER", "GUARDIAN"]),
    branchId: z.string().uuid("Please select a branch"),
    childId: z.string().optional(),
    relationship: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.childId && !data.relationship) {
      ctx.addIssue({
        code: "custom",
        path: ["relationship"],
        message: "Relationship is required when a child is specified",
      });
    }
    if (data.relationship && !data.childId) {
      ctx.addIssue({
        code: "custom",
        path: ["childId"],
        message: "Child ID is required when a relationship is specified",
      });
    }
  });

const inputClass =
  "mt-1.5 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  branches: { id: string; name: string }[];
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <Info className="size-3.5 text-muted-foreground cursor-help" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-2 text-xs text-foreground opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export default function InviteUserModal({
  isOpen,
  onClose,
  branches,
}: InviteUserModalProps) {
  const [role, setRole] = useState<"CENTER_ADMIN" | "TEACHER" | "GUARDIAN">(
    "TEACHER",
  );
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      toast.success("Invitation sent.");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to send invitation.");
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
      const result = inviteSchema.safeParse(value);
      if (!result.success) {
        toast.error(result.error.errors[0].message);
        return;
      }
      const payload: IInviteUserPayload = {
        email: value.email,
        role: value.role,
        branchId: value.branchId,
      };
      // Only attach childId/relationship if the admin is linking an
      // already-existing child (e.g. a second guardian for that child)
      if (value.role === "GUARDIAN" && value.childId && value.relationship) {
        payload.childId = value.childId;
        payload.relationship = value.relationship;
      }
      mutate(payload);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Invite Someone
          </h3>
          <button
            onClick={onClose}
            className="rounded-md text-muted-foreground hover:bg-muted p-1"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field name="email">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  className={inputClass}
                  placeholder="person@example.com"
                />
              </div>
            )}
          </form.Field>

          <form.Field name="role">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Role
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => {
                    const value = e.target.value as typeof role;
                    field.handleChange(value);
                    setRole(value);
                  }}
                  disabled={isPending}
                  className={inputClass}
                >
                  <option value="CENTER_ADMIN">Center Admin</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="GUARDIAN">Guardian</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="branchId">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Branch
                </label>
                <select
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isPending}
                  className={inputClass}
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>

          {role === "GUARDIAN" && (
            <div className="space-y-4 rounded-md border border-dashed border-border  p-3">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Existing child (optional)
                </p>
                <InfoTooltip text="Only fill this in if this guardian is joining a child who is already enrolled — for example, a second parent. Otherwise leave blank: the guardian will register their own child after accepting the invite." />
              </div>

              <form.Field name="childId">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Child ID
                    </label>
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isPending}
                      className={inputClass}
                      placeholder="Leave blank for a new child"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="relationship">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-foreground">
                      Relationship
                    </label>
                    <input
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isPending}
                      className={inputClass}
                      placeholder="e.g. Mother, Father, Grandparent"
                    />
                  </div>
                )}
              </form.Field>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isPending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
