/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  CheckCircle2,
  Receipt,
  AlertCircle,
  Calendar,
  DollarSign,
  TrendingDown,
  ShieldCheck,
  Baby,
  Building2,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getGuardianInvoices, payGuardianInvoice } from "@/services/billing.services";
import DownloadReportButton from "@/components/ui/DownloadReportButton";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/* ─── skeletons ─── */
function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function BillingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((c) => (
        <div key={c} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border bg-muted/30 px-5 py-4 sm:px-6">
            <SkeletonPulse className="h-5 w-48" />
            <SkeletonPulse className="mt-2 h-3 w-32" />
          </div>
          <div className="space-y-3 p-5 sm:p-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
                <div className="flex-1 space-y-2">
                  <SkeletonPulse className="h-4 w-32" />
                  <SkeletonPulse className="h-3 w-48" />
                </div>
                <SkeletonPulse className="h-10 w-28" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── progress bar ─── */
function PaymentProgress({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Payment Progress</span>
        <span className={pct >= 100 ? "text-emerald-600 dark:text-emerald-400" : ""}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : "bg-primary"}`}
        />
      </div>
    </div>
  );
}

/* ─── invoice card ─── */
function InvoiceCard({
  invoice,
  onPay,
  isCheckingOut,
  isLoadingThis,
}: {
  invoice: any;
  onPay: () => void;
  isCheckingOut: boolean;
  isLoadingThis: boolean;
}) {
  const isPaid = invoice.isFullyPaid;
  const dueDate = new Date(invoice.dueDate);
  const isOverdue = !isPaid && dueDate < new Date();

  return (
    <motion.div
      variants={fadeInUp}
      className={`group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-sm sm:p-5 ${
        isPaid
          ? "border-border bg-background"
          : isOverdue
          ? "border-destructive/30 bg-destructive/[0.02]"
          : "border-border bg-background hover:border-primary/20"
      }`}
    >
      {/* Status stripe */}
      <div
        className={`absolute left-0 top-0 h-full w-1 ${
          isPaid ? "bg-emerald-500" : isOverdue ? "bg-destructive" : "bg-amber-500"
        }`}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <FileText className="size-4 text-muted-foreground" />
              {invoice.billingPeriodId}
            </div>
            {isPaid ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Paid
              </span>
            ) : isOverdue ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                <AlertCircle className="size-3" />
                Overdue
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <Calendar className="size-3" />
                Due {dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              Due {dueDate.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />
              Total Invoice: ${invoice.totalInvoiceAmount.toFixed(2)}
            </span>
          </div>

          {!isPaid && invoice.myPaidAmount > 0 && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-3.5" />
              You have paid ${invoice.myPaidAmount.toFixed(2)} toward this invoice
            </motion.p>
          )}

          <PaymentProgress paid={invoice.myPaidAmount} total={invoice.myPaidAmount + invoice.remainingBalance} />
        </div>

        {/* Right: Balance + Action */}
        <div className="flex items-center gap-4 sm:border-l sm:border-border sm:pl-5">
          <div className="min-w-[6rem]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Your Balance</p>
            <p className={`text-2xl font-bold tracking-tight ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
              ${invoice.remainingBalance.toFixed(2)}
            </p>
          </div>

          {isPaid ? (
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              Paid
            </div>
          ) : (
            <button
              onClick={onPay}
              disabled={isCheckingOut}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoadingThis ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              {isLoadingThis ? "Processing…" : "Pay Now"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── child billing section ─── */
function ChildBillingSection({
  childData,
  onPay,
  isCheckingOut,
  loadingInvoiceId,
  index,
}: {
  childData: any;
  onPay: (invoiceId: string, amount: number) => void;
  isCheckingOut: boolean;
  loadingInvoiceId: string | null;
  index: number;
}) {
  const sortedInvoices = [...childData.invoices].sort((a: any, b: any) => {
    if (a.isFullyPaid !== b.isFullyPaid) return a.isFullyPaid ? 1 : -1;
    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
  });

  const totalDue = sortedInvoices
    .filter((inv: any) => !inv.isFullyPaid)
    .reduce((sum: number, inv: any) => sum + inv.remainingBalance, 0);

  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Baby className="size-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground sm:text-lg">{childData.childName}</h3>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="size-3" />
              {childData.branchName || "Unassigned Branch"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {totalDue > 0 && (
            <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
              <TrendingDown className="size-3" />
              ${totalDue.toFixed(2)} due
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <AlertCircle className="size-3" />
            Your Split: {childData.splitPercentage}%
          </div>
          <DownloadReportButton label="History" reportType="BILLING" />
        </div>
      </div>

      {/* Invoices */}
      <div className="p-4 sm:p-6">
        {sortedInvoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
            <Receipt className="size-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-muted-foreground">No invoices on file</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Invoices will appear here when generated by the center</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            <AnimatePresence>
              {sortedInvoices.map((invoice: any) => (
                <InvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  onPay={() => onPay(invoice.id, invoice.remainingBalance)}
                  isCheckingOut={isCheckingOut}
                  isLoadingThis={loadingInvoiceId === invoice.id && isCheckingOut}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─── main component ─── */
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

  if (isLoading) return <BillingSkeleton />;

  const linkedChildren = response?.data || [];

  if (linkedChildren.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
      >
        <div className="relative">
          <div className="absolute inset-0 size-20 rounded-full bg-muted/50 blur-xl" />
          <div className="relative flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Receipt className="size-8" />
          </div>
        </div>
        <h3 className="mt-6 text-lg font-bold text-foreground">No billing records found</h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          You are not linked to any active child profiles. Contact your center administrator if you believe this is an error.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {linkedChildren.map((childData: any, idx: number) => (
        <ChildBillingSection
          key={childData.childId}
          childData={childData}
          index={idx}
          onPay={(invoiceId, amount) => {
            setLoadingInvoiceId(invoiceId);
            handleCheckout({ invoiceId, amount });
          }}
          isCheckingOut={isCheckingOut}
          loadingInvoiceId={loadingInvoiceId}
        />
      ))}
    </motion.div>
  );
}