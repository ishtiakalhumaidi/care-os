/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getTenantInvoicesOverview } from "@/services/billing.services";
import { Loader2, Receipt, CheckCircle2, AlertCircle } from "lucide-react";

export default function TenantInvoicesTable() {
  const { data, isLoading } = useQuery({
    queryKey: ["tenant-invoices"],
    queryFn: getTenantInvoicesOverview,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 border border-border rounded-xl bg-card">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const invoices = data?.data?.data || [];

  if (invoices.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground shadow-sm">
        <Receipt className="size-10 mx-auto mb-3 opacity-20" />
        <p className="text-sm">No invoices generated yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium">Period</th>
              <th className="px-6 py-4 font-medium">Total Billed</th>
              <th className="px-6 py-4 font-medium">Collected</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((invoice: any) => {
         
              const totalCollected = invoice.payments
                ?.filter((p: any) => p.status === "PAID")
                .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
              
              const isFullyPaid = totalCollected >= invoice.amount || invoice.status === "PAID";
              const progress = Math.min(100, (totalCollected / invoice.amount) * 100);

              return (
                <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground">
                      {invoice.child?.firstName} {invoice.child?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{invoice.child?.branch?.name}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">{invoice.billingPeriodId}</td>
                  <td className="px-6 py-4 font-bold text-foreground">${invoice.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-medium">${totalCollected.toFixed(2)}</span>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden max-w-[100px]">
                        <div 
                          className={`h-full rounded-full ${isFullyPaid ? 'bg-emerald-500' : 'bg-primary'}`} 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isFullyPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertCircle className="size-3.5" /> Due
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}