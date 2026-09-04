"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Gauge,
  Baby,
  Wallet,
  Building2,
  Activity,
  Users,
  FileCheck,
  Clock,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  UtensilsCrossed,
  Moon,
  Star,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   CareOS — HeroBanner (Premium, Minimal, Industry-Standard)
   Inspired by Linear, Vercel, Stripe. Tight typography, generous
   whitespace, floating product visual, subtle ambient depth.
   ──────────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.35 + i * 0.12, duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  }),
};

const socialProof = [
  { value: "200+", label: "Centers" },
  { value: "14,000+", label: "Children" },
  { value: "48", label: "States" },
  { value: "99.9%", label: "Uptime" },
];

export default function HeroBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yVisual = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const yGlow = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* ── Ambient background (extremely subtle) ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[10%] left-1/2 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[160px]" />
        <div className="absolute bottom-[5%] right-[15%] h-[35vh] w-[35vh] rounded-full bg-secondary/[0.02] blur-[120px]" />
      </div>

      <motion.div style={{ opacity }} className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-36 lg:pt-44">
          {/* ── Top: Copy (centered, spacious) ── */}
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Trusted by 200+ childcare centers nationwide
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={1}
              className="font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
            >
              The complete platform{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">for modern childcare</span>
                <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 sm:h-4" />
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-xl text-balance font-body text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Enrollment, live ratios, automated billing, parent messaging, and
              state compliance — all in one place. No spreadsheets. No guesswork.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={3}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/15 transition-all hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.97]"
              >
                Start free trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Play className="size-4 fill-foreground" />
                See how it works
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={4}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            >
              {[
                { icon: ShieldCheck, label: "SOC 2 Type II" },
                { icon: FileCheck, label: "State Audit Ready" },
                { icon: Users, label: "COPPA Compliant" },
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

          {/* ── Bottom: Product Visual (floating, layered) ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            custom={0}
            className="relative mx-auto mt-16 max-w-5xl sm:mt-20"
          >
            <motion.div style={{ y: yVisual }} className="relative">
              {/* Back layer (depth) */}
              <motion.div
                style={{ y: yGlow }}
                className="absolute -inset-x-4 -top-4 -bottom-4 -z-20 rounded-[2.5rem] border border-border/50 bg-muted/30"
              />
              <motion.div
                style={{ y: yGlow }}
                className="absolute -inset-x-2 -top-2 -bottom-2 -z-10 rounded-[2rem] border border-border/70 bg-muted/50"
              />

              {/* Main card */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-primary/[0.04]">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b border-border px-5 py-3 sm:px-6">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400/60" />
                    <span className="size-2.5 rounded-full bg-amber-400/60" />
                    <span className="size-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <div className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1">
                    <ShieldCheck className="size-3 text-muted-foreground" strokeWidth={2} />
                    <span className="font-mono text-[10px] text-muted-foreground">
                      dashboard.careos.io
                    </span>
                  </div>
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                      </span>
                      <span className="font-mono text-[9px] text-green-500">Live</span>
                    </span>
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="p-5 sm:p-7">
                  {/* KPI row */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: "Enrolled", value: "142", icon: Baby, trend: "+4" },
                      { label: "Staff On Duty", value: "24", icon: Users, trend: "+2" },
                      { label: "Revenue", value: "$31.2K", icon: TrendingUp, trend: "+8%" },
                    ].map((k) => {
                      const Icon = k.icon;
                      return (
                        <div
                          key={k.label}
                          className="rounded-2xl border border-border bg-background/60 p-4 sm:p-5"
                        >
                          <div className="flex items-center gap-1.5">
                            <Icon className="size-3.5 text-muted-foreground" strokeWidth={2} />
                            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                              {k.label}
                            </span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <p className="font-display text-xl font-bold text-foreground sm:text-2xl">
                              {k.value}
                            </p>
                            <span className="font-mono text-[10px] text-green-500">
                              {k.trend}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Two-column layout: Ratios + Activity */}
                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Left: Ratio compliance */}
                    <div className="space-y-2.5">
                      <div className="mb-2 flex items-center gap-2">
                        <Gauge className="size-3.5 text-primary" strokeWidth={2} />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Live Ratios
                        </span>
                      </div>
                      {[
                        { room: "Sunflower Room", kids: 12, limit: 16, ratio: "1:4", status: "ok" as const },
                        { room: "Little Explorers", kids: 18, limit: 18, ratio: "1:6", status: "warn" as const },
                        { room: "Toddler Cove", kids: 9, limit: 12, ratio: "1:3", status: "ok" as const },
                      ].map((r) => (
                        <div
                          key={r.room}
                          className="flex items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-body text-[13px] font-medium text-foreground">
                                {r.room}
                              </p>
                              <span
                                className={`font-mono text-xs font-semibold ${
                                  r.status === "warn" ? "text-secondary" : "text-primary"
                                }`}
                              >
                                {r.ratio}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                                <div
                                  className={`h-full rounded-full ${
                                    r.status === "warn" ? "bg-secondary" : "bg-primary"
                                  }`}
                                  style={{ width: `${(r.kids / r.limit) * 100}%` }}
                                />
                              </div>
                              <span className="font-mono text-[9px] text-muted-foreground">
                                {r.kids}/{r.limit}
                              </span>
                            </div>
                          </div>
                          {r.status === "ok" ? (
                            <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
                          ) : (
                            <span className="flex size-5 items-center justify-center rounded-full bg-secondary/10">
                              <span className="size-2 rounded-full bg-secondary" />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Right: Activity feed */}
                    <div className="rounded-2xl border border-border bg-background/60 p-4 sm:p-5">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="size-3.5 text-primary" strokeWidth={2} />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Activity Feed
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-green-500">Now</span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { icon: UtensilsCrossed, action: "Lunch logged", who: "Ava R.", time: "12:41 PM" },
                          { icon: Moon, action: "Nap started", who: "Leo M.", time: "12:55 PM" },
                          { icon: MessageCircle, action: "Parent message", who: "Sarah K.", time: "1:08 PM" },
                          { icon: Clock, action: "Check-in", who: "Mia K.", time: "1:14 PM" },
                        ].map((ev) => {
                          const Icon = ev.icon;
                          return (
                            <div key={ev.action + ev.who} className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <Icon className="size-3.5 text-muted-foreground" strokeWidth={2} />
                                <span className="font-body text-xs text-foreground">{ev.action}</span>
                              </div>
                              <span className="font-mono text-[9px] text-muted-foreground">
                                {ev.who} · {ev.time}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <motion.div
                initial={{ opacity: 0, x: 24, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-3 top-8 hidden rounded-2xl border border-border bg-card p-3 shadow-xl sm:block lg:-right-10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-green-500/10">
                    <CheckCircle2 className="size-4 text-green-500" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-body text-[11px] font-medium text-foreground">Audit passed</p>
                    <p className="font-mono text-[9px] text-muted-foreground">All ratios compliant</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -24, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 1.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -left-3 bottom-20 hidden rounded-2xl border border-border bg-card p-3 shadow-xl sm:block lg:-left-10"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                    <Wallet className="size-4 text-primary" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-body text-[11px] font-medium text-foreground">$14,200 billed</p>
                    <p className="font-mono text-[9px] text-muted-foreground">Auto-collected today</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-4 left-1/2 hidden -translate-x-1/2 rounded-2xl border border-border bg-card px-4 py-2.5 shadow-xl sm:flex items-center gap-2"
              >
                <Star className="size-3.5 text-amber-500" strokeWidth={2} />
                <span className="font-body text-[11px] text-foreground">4.9/5</span>
                <span className="font-mono text-[9px] text-muted-foreground">from 200+ centers</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ── Social proof bar ── */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={5}
            className="mx-auto mt-20 max-w-3xl border-t border-border pt-10 sm:mt-24"
          >
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {socialProof.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                    {s.value}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}