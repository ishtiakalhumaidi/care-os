"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  Wallet,
  Split,
  FileCheck2,
  ArrowRight,
  Circle,
  TrendingUp,
  Receipt,
  FileText,
  CheckCircle2,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function RevenueAndCompliance() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yGlow = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section ref={ref} className="relative mt-28 sm:mt-36">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: yGlow }}
          className="absolute right-[10%] top-[15%] h-[30vh] w-[30vh] rounded-full bg-primary/[0.02] blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-12 max-w-2xl sm:mb-16"
        >
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
            </span>
            Revenue & Compliance
          </span>
          <h2 className="max-w-lg text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Money and paperwork,{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">handled automatically.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>
          </h2>
          <p className="mt-5 max-w-md font-body text-base leading-relaxed text-muted-foreground">
            Tuition collection and licensing paperwork from a monthly fire drill
            into background infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* ── Billing Portal ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={1}
            className="group relative flex flex-col rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/[0.04] blur-[50px]" />
            </div>
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                    <Wallet className="size-4 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Billing Portal
                  </h3>
                </div>
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Live
                </span>
              </div>
              <div className="space-y-3 rounded-xl bg-background/60 p-4">
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
              <p className="mt-5 font-body text-sm leading-relaxed text-muted-foreground">
                Guardians see every invoice and payment method in one place —
                fewer late payments, fewer awkward front-desk conversations.
              </p>
            </div>
          </motion.div>

          {/* ── Split Custody ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={2}
            className="group relative flex flex-col rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-secondary/[0.04] blur-[50px]" />
            </div>
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                    <Split className="size-4 text-secondary" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Split-Custody Payments
                  </h3>
                </div>
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Live
                </span>
              </div>
              <div className="rounded-xl bg-background/60 p-4">
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>Primary Guardian</span>
                  <span>60%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "60%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>Secondary Guardian</span>
                  <span>40%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "40%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-secondary"
                  />
                </div>
              </div>
              <p className="mt-5 font-body text-sm leading-relaxed text-muted-foreground">
                Co-parenting arrangements are common — CareOS bills each guardian
                their agreed share automatically.
              </p>
            </div>
          </motion.div>

          {/* ── Compliance PDF ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={3}
            className="group relative flex flex-col rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/[0.04] blur-[50px]" />
            </div>
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                    <FileCheck2 className="size-4 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Compliance Reports
                  </h3>
                </div>
                <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Live
                </span>
              </div>
              <div className="space-y-2 rounded-xl bg-background/60 p-4">
                {["Attendance summary — August", "Ratio compliance log — Q3"].map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="size-3.5 text-muted-foreground" strokeWidth={2} />
                      <span className="font-body text-xs text-muted-foreground">{doc}</span>
                    </div>
                    <Circle className="size-3 text-muted-foreground/40" strokeWidth={2} />
                  </div>
                ))}
              </div>
              <p className="mt-5 font-body text-sm leading-relaxed text-muted-foreground">
                One click produces the exact attendance and ratio documentation
                your licensing board asks for at inspection.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={4}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border pt-10"
        >
          {[
            { icon: Receipt, label: "Auto-invoicing" },
            { icon: TrendingUp, label: "Revenue forecasting" },
            { icon: FileText, label: "State reporting" },
            { icon: CheckCircle2, label: "Audit trail" },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <span
                key={t.label}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                <Icon className="size-3.5 text-primary" strokeWidth={2} />
                {t.label}
              </span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}