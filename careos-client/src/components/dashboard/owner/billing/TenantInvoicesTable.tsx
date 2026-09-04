/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenantInvoicesOverview } from "@/services/billing.services";
import {
  Loader2,
  Receipt,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-28 rounded-md bg-muted" />
            <div className="h-3 w-16 rounded-md bg-muted" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded-md bg-muted" /></td>
      <td className="px-6 py-4"><div className="h-4 w-16 rounded-md bg-muted" /></td>
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-16 rounded-md bg-muted" />
          <div className="h-1.5 w-20 rounded-full bg-muted" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-5 w-16 rounded-full bg-muted" /></td>
    </tr>
  );
}

export default function TenantInvoicesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenant-invoices"],
    queryFn: getTenantInvoicesOverview,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billed</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collected</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const invoices = data?.data?.data || [];

  const totalBilled = invoices.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const totalCollected = invoices.reduce((s: number, i: any) => {
    const paid = i.payments?.filter((p: any) => p.status === "PAID").reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
    return s + paid;
  }, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted">
          <Receipt className="size-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-foreground">No invoices yet</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Create your first tuition invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
            <DollarSign className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">
              ${totalBilled.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Total Billed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">
              ${totalCollected.toFixed(2)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Collected</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10">
            {collectionRate >= 80 ? (
              <TrendingUp className="size-4 text-blue-600" />
            ) : (
              <TrendingDown className="size-4 text-amber-600" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{collectionRate}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Collection Rate</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Period
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Billed
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collected
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice: any) => {
                const paid = invoice.payments
                  ?.filter((p: any) => p.status === "PAID")
                  .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
                const isFullyPaid = paid >= invoice.amount || invoice.status === "PAID";
                const progress = Math.min(100, (paid / invoice.amount) * 100);
                const isOverdue = !isFullyPaid && new Date(invoice.dueDate) < new Date();

                return (
                  <tr
                    key={invoice.id}
                    className="group transition-colors hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {(invoice.child?.firstName?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {invoice.child?.firstName} {invoice.child?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.child?.branch?.name || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {invoice.billingPeriodId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-medium text-foreground">
                          ${paid.toFixed(2)}
                        </span>
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isFullyPaid ? "bg-emerald-500" : isOverdue ? "bg-red-500" : "bg-primary"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isFullyPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                          <CheckCircle2 className="size-3.5" />
                          Paid
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/30 dark:text-red-400">
                          <AlertCircle className="size-3.5" />
                          Overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                          <AlertCircle className="size-3.5" />
                          Due
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
          Showing {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
        </div>
      </div>
    </div>
  );
}