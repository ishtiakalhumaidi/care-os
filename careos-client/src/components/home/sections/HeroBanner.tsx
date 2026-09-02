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
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   CareOS — HeroBanner (Production-Grade, Client-Facing)
   No dev jargon. Built for center owners who need trust & revenue.
   ──────────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const socialProof = [
  { value: "200+", label: "Centers Running" },
  { value: "14K+", label: "Children Enrolled" },
  { value: "48", label: "States Served" },
  { value: "99.9%", label: "Uptime" },
];

const trustPillars = [
  { icon: ShieldCheck, label: "SOC 2 Type II" },
  { icon: FileCheck, label: "State Audit Ready" },
  { icon: Users, label: "COPPA Compliant" },
];

export default function HeroBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -25]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* ── Background ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[15%] left-1/2 h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-primary/[0.035] blur-[140px]" />
        <div className="absolute -bottom-[5%] right-[10%] h-[40vh] w-[40vh] rounded-full bg-secondary/[0.025] blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <motion.div style={{ opacity }} className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:pt-36">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
            {/* ── Left: Copy ── */}
            <div className="lg:col-span-6">
              {/* Micro-badge */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0}
              >
                <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Trusted by 200+ Childcare Centers
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="max-w-xl text-balance font-display text-[2.6rem] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]"
              >
                Run your center.{" "}
                <span className="text-primary">Not the paperwork.</span>
              </motion.h1>

              {/* Subhead */}
              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="mt-6 max-w-md text-balance font-body text-base leading-[1.65] text-muted-foreground sm:text-[1.05rem]"
              >
                Enrollment, live ratio tracking, automated billing, parent
                messaging, and state compliance reports — all in one place. Built
                for the owners who refuse to run their business on spreadsheets
                and WhatsApp groups.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98]"
                >
                  Start Free Trial
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Play className="size-4 fill-foreground" />
                  See How It Works
                </Link>
              </motion.div>

              {/* Social proof bar */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
                className="mt-10 grid grid-cols-2 gap-4 border-t border-border pt-8 sm:grid-cols-4"
              >
                {socialProof.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                      {s.value}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Trust row */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={5}
                className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {trustPillars.map((t) => {
                  const Icon = t.icon;
                  return (
                    <span
                      key={t.label}
                      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      <Icon
                        className="size-3.5 text-primary"
                        strokeWidth={2}
                      />
                      {t.label}
                    </span>
                  );
                })}
              </motion.div>
            </div>

            {/* ── Right: Product Visual ── */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={scaleIn}
              custom={0}
              className="relative lg:col-span-6"
            >
              <motion.div style={{ y: y1 }} className="relative">
                {/* Main dashboard card */}
                <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/[0.06]">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
                    <div className="flex gap-1.5">
                      <span className="size-2.5 rounded-full bg-red-400/70" />
                      <span className="size-2.5 rounded-full bg-amber-400/70" />
                      <span className="size-2.5 rounded-full bg-green-400/70" />
                    </div>
                    <div className="ml-3 flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1">
                      <ShieldCheck className="size-3 text-muted-foreground" strokeWidth={2} />
                      <span className="font-mono text-[10px] text-muted-foreground">
                        dashboard.careos.io
                      </span>
                    </div>
                  </div>

                  {/* Dashboard body */}
                  <div className="p-5 sm:p-6">
                    {/* KPI row */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Enrolled", value: "142", icon: Baby, trend: "+4" },
                        { label: "Staff On Duty", value: "24", icon: Users, trend: "+2" },
                        { label: "Monthly Revenue", value: "$31.2K", icon: TrendingUp, trend: "+8%" },
                      ].map((k) => {
                        const Icon = k.icon;
                        return (
                          <div
                            key={k.label}
                            className="rounded-2xl border border-border bg-background/60 p-4"
                          >
                            <div className="flex items-center gap-1.5">
                              <Icon
                                className="size-3.5 text-muted-foreground"
                                strokeWidth={2}
                              />
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

                    {/* Ratio compliance cards */}
                    <div className="mt-4 space-y-2.5">
                      <div className="mb-2 flex items-center gap-2">
                        <Gauge
                          className="size-3.5 text-primary"
                          strokeWidth={2}
                        />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Live Ratio Compliance
                        </span>
                      </div>
                      {[
                        { room: "Sunflower Room", kids: 12, limit: 16, ratio: "1:4", status: "ok" as const },
                        { room: "Little Explorers", kids: 18, limit: 18, ratio: "1:6", status: "warn" as const },
                        { room: "Toddler Cove", kids: 9, limit: 12, ratio: "1:3", status: "ok" as const },
                      ].map((r) => (
                        <div
                          key={r.room}
                          className="flex items-center gap-4 rounded-xl border border-border bg-background/60 px-4 py-2.5"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-body text-[13px] font-medium text-foreground">
                                {r.room}
                              </p>
                              <span
                                className={`font-mono text-xs font-semibold ${
                                  r.status === "warn"
                                    ? "text-secondary"
                                    : "text-primary"
                                }`}
                              >
                                {r.ratio}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                                <div
                                  className={`h-full rounded-full ${
                                    r.status === "warn"
                                      ? "bg-secondary"
                                      : "bg-primary"
                                  }`}
                                  style={{
                                    width: `${(r.kids / r.limit) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="font-mono text-[9px] text-muted-foreground">
                                {r.kids}/{r.limit}
                              </span>
                            </div>
                          </div>
                          {r.status === "warn" && (
                            <span className="flex size-5 items-center justify-center rounded-full bg-secondary/10">
                              <span className="size-2 rounded-full bg-secondary" />
                            </span>
                          )}
                          {r.status === "ok" && (
                            <CheckCircle2
                              className="size-4 text-primary"
                              strokeWidth={2}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Activity feed */}
                    <div className="mt-4 rounded-2xl border border-border bg-background/60 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity
                            className="size-3.5 text-primary"
                            strokeWidth={2}
                          />
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Live Activity Feed
                          </span>
                        </div>
                        <span className="flex items-center gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                          </span>
                          <span className="font-mono text-[9px] text-green-500">
                            Live
                          </span>
                        </span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { icon: UtensilsCrossed, action: "Lunch logged", who: "Ava R.", time: "12:41 PM" },
                          { icon: Moon, action: "Nap started", who: "Leo M.", time: "12:55 PM" },
                          { icon: MessageCircle, action: "Message from parent", who: "Sarah K.", time: "1:08 PM" },
                          { icon: Clock, action: "Check-in complete", who: "Mia K.", time: "1:14 PM" },
                        ].map((ev) => {
                          const Icon = ev.icon;
                          return (
                            <div
                              key={ev.action + ev.who}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon
                                  className="size-3.5 text-muted-foreground"
                                  strokeWidth={2}
                                />
                                <span className="font-body text-xs text-foreground">
                                  {ev.action}
                                </span>
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

                {/* Decorative depth layers */}
                <motion.div
                  style={{ y: y2 }}
                  className="absolute -right-3 -top-3 -z-10 h-full w-full rounded-[2rem] border border-border/60 bg-muted/40"
                />
                <motion.div
                  style={{ y: y2 }}
                  className="absolute -bottom-3 -left-3 -z-10 h-full w-full rounded-[2rem] border border-border/40 bg-muted/20"
                />

                {/* Floating notification */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -right-2 top-12 hidden rounded-2xl border border-border bg-card p-3 shadow-lg sm:block lg:-right-8"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-green-500/10">
                      <CheckCircle2 className="size-4 text-green-500" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-body text-[11px] font-medium text-foreground">
                        State audit passed
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground">
                        All ratios compliant
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Floating revenue card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -left-2 bottom-16 hidden rounded-2xl border border-border bg-card p-3 shadow-lg sm:block lg:-left-8"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                      <Wallet className="size-4 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-body text-[11px] font-medium text-foreground">
                        Tuition collected
                      </p>
                      <p className="font-mono text-[9px] text-muted-foreground">
                        Auto-billed 47 families
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}