"use client";

import { motion, Variants } from "framer-motion";
import { Wallet, Split, FileCheck2, ArrowRight, Circle } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function RevenueAndCompliance() {
  return (
    <section className="mt-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={0}
        className="mb-8 flex items-center gap-3"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
        </span>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Money and paperwork,{" "}
          <span className="text-primary">handled automatically.</span>
        </h2>
      </motion.div>
      <p className="mb-10 max-w-xl font-body text-sm leading-relaxed text-muted-foreground">
        The part of running a center that never shows up in a tour. Sprint 3
        turns tuition collection and licensing paperwork from a monthly fire
        drill into background infrastructure.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Billing Portal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={1}
          className="flex flex-col rounded-3xl border border-border bg-card p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="size-4 text-primary" strokeWidth={2} />
              <h3 className="font-display text-base font-semibold text-foreground">
                Billing Portal
              </h3>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              In Progress
            </span>
          </div>
          <div className="space-y-2.5 rounded-xl bg-background/60 p-4">
            {[
              { label: "September tuition", amount: "$1,240.00", status: "Paid" },
              { label: "Extended care add-on", amount: "$180.00", status: "Due Sep 12" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-foreground">{row.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{row.status}</p>
                </div>
                <p className="font-mono text-sm font-semibold text-foreground">{row.amount}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
            Guardians see every invoice and payment method in one place —
            fewer late payments, fewer awkward front-desk conversations.
          </p>
        </motion.div>

        {/* Split Custody */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={2}
          className="flex flex-col rounded-3xl border border-border bg-card p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Split className="size-4 text-secondary" strokeWidth={2} />
              <h3 className="font-display text-base font-semibold text-foreground">
                Split-Custody Payments
              </h3>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              In Progress
            </span>
          </div>
          <div className="rounded-xl bg-background/60 p-4">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Primary Guardian</span>
              <span>60%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full w-[60%] rounded-full bg-primary" />
            </div>
            <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Secondary Guardian</span>
              <span>40%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full w-[40%] rounded-full bg-secondary" />
            </div>
          </div>
          <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
            Co-parenting arrangements are common — CareOS bills each guardian
            their agreed share automatically instead of your team manually
            splitting invoices.
          </p>
        </motion.div>

        {/* Compliance PDF */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={3}
          className="flex flex-col rounded-3xl border border-border bg-card p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-primary" strokeWidth={2} />
              <h3 className="font-display text-base font-semibold text-foreground">
                Compliance PDF Generator
              </h3>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              In Progress
            </span>
          </div>
          <div className="space-y-2 rounded-xl bg-background/60 p-4">
            {["Attendance summary — August", "Ratio compliance log — Q3"].map((doc) => (
              <div
                key={doc}
                className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5"
              >
                <span className="font-body text-xs text-muted-foreground">{doc}</span>
                <Circle className="size-3 text-muted-foreground/40" strokeWidth={2} />
              </div>
            ))}
          </div>
          <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
            One click produces the exact attendance and ratio documentation
            your local licensing board asks for at inspection.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={4}
        className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground"
      >
        Track live rollout status on the roadmap
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </motion.div>
    </section>
  );
}