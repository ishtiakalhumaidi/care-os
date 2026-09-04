"use client";

import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft, Receipt } from "lucide-react";
import Link from "next/link";

export default function BillingPageHeader() {
  return (
    <>
      {/* Back nav */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <Link
          href="/guardian/dashboard"
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to dashboard
        </Link>
      </motion.div>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <CreditCard className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Tuition &amp; Billing
              </h1>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
                Manage your payments and view invoice history. Split-custody calculations are applied automatically based on your guardian profile settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 shadow-sm">
            <Receipt className="size-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Auto-billing enabled</span>
          </div>
        </div>
      </motion.div>
    </>
  );
}