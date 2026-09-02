/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, CreditCard, CheckCircle2, Receipt, AlertCircle } from "lucide-react";
import { getGuardianInvoices, payGuardianInvoice } from "@/services/billing.services";
import DownloadReportButton from "@/components/ui/DownloadReportButton";

export default function GuardianBillingView() {
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ["guardian-invoices"],
    queryFn: getGuardianInvoices,
  });

  const { mutate: handleCheckout, isPending: isCheckingOut } = useMutation({
    mutationFn: ({ invoiceId, amount }: { invoiceId: string; amount: number }) => 
      payGuardianInvoice(invoiceId, amount),
    onSuccess: (res) => {
      if (res.data?.url) window.location.href = res.data.url;
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to initiate checkout");
      setLoadingInvoiceId(null);
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>;
  }

  const linkedChildren = response?.data || [];

  if (linkedChildren.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-xl text-center">
        <Receipt className="size-10 text-muted-foreground/50 mb-3" />
        <p className="font-medium text-foreground">No billing records found.</p>
        <p className="text-sm text-muted-foreground">You are not linked to any active child profiles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {linkedChildren.map((childData: any) => {
        // Professional Sorting: Unpaid/Due invoices at the top, then sort by newest date
        const sortedInvoices = [...childData.invoices].sort((a, b) => {
          if (a.isFullyPaid !== b.isFullyPaid) {
            return a.isFullyPaid ? 1 : -1; // Push paid invoices to the bottom
          }
          // If both have the same status, show the newest one first
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        });

        return (
          <div key={childData.childId} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-muted/30 px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">{childData.childName}</h3>
                <p className="text-sm text-muted-foreground">Location: {childData.branchName || "Unassigned"}</p>
              </div>
              <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="size-4" />
                Your Responsibility: {childData.splitPercentage}%
              </div>
              <DownloadReportButton label="Download Payment History" reportType="BILLING"/>
            </div>

            {/* Invoices List */}
            <div className="p-5">
              {sortedInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No invoices on file for this student.</p>
              ) : (
                <div className="space-y-4">
                  {sortedInvoices.map((invoice: any) => {
                    const isCurrentlyLoadingThis = isCheckingOut && loadingInvoiceId === invoice.id;
                    
                    return (
                      <div key={invoice.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-lg gap-4">
                        
                        {/* Invoice Math Breakdown */}
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">
                              {invoice.billingPeriodId}
                            </span>
                            {invoice.isFullyPaid ? (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Paid</span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Due</span>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            Due Date: {new Date(invoice.dueDate).toLocaleDateString()} • Total Center Invoice: ${(invoice.totalInvoiceAmount).toFixed(2)}
                          </p>
                          
                          {!invoice.isFullyPaid && invoice.myPaidAmount > 0 && (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                              You have already paid ${(invoice.myPaidAmount).toFixed(2)} toward this invoice.
                            </p>
                          )}
                        </div>

                        {/* Action Area */}
                        <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Your Balance</p>
                            <p className="text-xl font-bold text-foreground">${(invoice.remainingBalance).toFixed(2)}</p>
                          </div>

                          {invoice.isFullyPaid ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-sm px-4">
                              <CheckCircle2 className="size-5" /> Done
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setLoadingInvoiceId(invoice.id);
                                handleCheckout({ invoiceId: invoice.id, amount: invoice.remainingBalance });
                              }}
                              disabled={isCheckingOut}
                              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              {isCurrentlyLoadingThis ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                              Pay Now
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      
    </div>
  );
}