/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  RotateCcw,
} from "lucide-react";
import {
  getInvitations,
  revokeInvitation,
  IInvitation,
} from "@/services/auth.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

const statusConfig: Record<
  IInvitation["status"],
  { label: string; icon: React.ReactNode; className: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    icon: <Clock className="size-3.5" />,
    className: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-900",
    dot: "bg-amber-500",
  },
  ACCEPTED: {
    label: "Accepted",
    icon: <CheckCircle2 className="size-3.5" />,
    className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900",
    dot: "bg-emerald-500",
  },
  EXPIRED: {
    label: "Expired",
    icon: <AlertCircle className="size-3.5" />,
    className: "text-slate-600 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-950/30 dark:border-slate-800",
    dot: "bg-slate-400",
  },
};

/* ─── Skeleton Row ─── */
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-muted" />
          <div className="h-4 w-32 rounded-md bg-muted" />
        </div>
      </td>
      <td className="px-4 py-4"><div className="h-4 w-20 rounded-md bg-muted" /></td>
      <td className="px-4 py-4"><div className="h-5 w-16 rounded-full bg-muted" /></td>
      <td className="px-4 py-4"><div className="h-4 w-24 rounded-md bg-muted" /></td>
      <td className="px-4 py-4 text-right"><div className="ml-auto h-8 w-20 rounded-md bg-muted" /></td>
    </tr>
  );
}

/* ─── Empty State ─── */
function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <Mail className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">No invitations yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Invite your first team member using the button above.
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function InvitationsList() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => getInvitations("limit=50"),
  });

  const invitations: IInvitation[] = data?.data || [];

  const {
    mutate: revoke,
    isPending,
    variables,
  } = useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => {
      toast.success("Invitation revoked.");
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to revoke invitation."));
    },
  });

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Recipient
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sent
              </th>
              <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : invitations.length === 0 ? (
              <EmptyState />
            ) : (
              invitations.map((invite) => {
                const cfg = statusConfig[invite.status];
                return (
                  <tr
                    key={invite.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {invite.email[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-foreground">
                          {invite.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground capitalize">
                      {invite.role.replace("_", " ").toLowerCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.className}`}
                      >
                        <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {format(new Date(invite.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {invite.status === "PENDING" ? (
                        <button
                          onClick={() => revoke(invite.id)}
                          disabled={isPending && variables === invite.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                        >
                          {isPending && variables === invite.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Ban className="size-3.5" />
                          )}
                          Revoke
                        </button>
                      ) : invite.status === "EXPIRED" ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <RotateCcw className="size-3.5" />
                          Resend
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          Joined
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}