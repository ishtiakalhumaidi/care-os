"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { value: "200+", suffix: "", label: "Centers running" },
  { value: "14K+", suffix: "", label: "Children enrolled" },
  { value: "48", suffix: "", label: "States served" },
  { value: "99.9%", suffix: "", label: "Platform uptime" },
];

export default function OwnerCTA() {
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
          className="absolute left-1/2 top-[30%] h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[140px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ── Stats bar ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-16 grid grid-cols-2 gap-8 border-y border-border py-10 sm:grid-cols-4 sm:mb-20"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                {s.value}
                <span className="text-muted-foreground">{s.suffix}</span>
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── CTA card ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={1}
          className="relative overflow-hidden rounded-[1.5rem] bg-primary"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-[20%] -top-[20%] h-[60vh] w-[60vh] rounded-full bg-primary-foreground/[0.03] blur-[100px]" />
            <div className="absolute -bottom-[10%] -left-[10%] h-[40vh] w-[40vh] rounded-full bg-primary-foreground/[0.02] blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-start gap-8 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10 lg:p-12">
            <div className="max-w-lg">
              <h3 className="font-display text-3xl font-bold leading-[1.1] text-primary-foreground sm:text-4xl">
                Run your center on one system.
              </h3>
              <p className="mt-4 max-w-md font-body text-base leading-relaxed text-primary-foreground/70">
                Set up your account, invite your staff, and start filling seats
                in the same afternoon. No setup fees, no contracts.
              </p>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {[
                  { icon: CheckCircle2, label: "Free 14-day trial" },
                  { icon: ShieldCheck, label: "No credit card required" },
                  { icon: Zap, label: "Setup in under an hour" },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <span
                      key={t.label}
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60"
                    >
                      <Icon className="size-3.5" strokeWidth={2} />
                      {t.label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-7 py-3.5 text-sm font-semibold text-primary transition-all active:scale-[0.97]"
              >
                Start free trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demo"
                className="flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                See how it works
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Bottom trust ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={2}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {[
            { icon: ShieldCheck, label: "SOC 2 Type II" },
            { icon: Users, label: "COPPA Compliant" },
            { icon: CheckCircle2, label: "State Audit Ready" },
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