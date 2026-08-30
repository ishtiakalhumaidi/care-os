"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  ArrowRight,
  Megaphone,
  MessageSquareText,
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  CheckCheck,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Data — pulled straight from the Sprint 3 table in README.md, not filler.
// ---------------------------------------------------------------------------

const tickerModules = [
  { label: "Direct Messaging", done: true },
  { label: "Read Receipts", done: true },
  { label: "Emergency Broadcasts", done: true },
  { label: "Encrypted Gallery", done: false },
  { label: "Billing Portal", done: false },
  { label: "Split-Custody Payments", done: false },
  { label: "Compliance PDF Generator", done: false },
  { label: "Document Vault", done: false },
];

const sprintPhases = [
  {
    tag: "Sprint 1",
    title: "Tenant & Enrollment",
    status: "complete" as const,
  },
  {
    tag: "Sprint 2",
    title: "The Daily Operational Loop",
    status: "complete" as const,
  },
  {
    tag: "Sprint 3",
    title: "Engagement, Billing & Compliance",
    status: "current" as const,
    items: [
      { label: "Real-time chat, role-aware inbox", done: true },
      { label: "Seen indicators, unread badges", done: true },
      { label: "Priority-tagged alert composer", done: true },
      { label: "Signed-URL gallery security", done: false },
      { label: "Guardian billing portal", done: false },
      { label: "Compliance PDF generator", done: false },
    ],
  },
];

const plannedFeatures = [
  "Encrypted Gallery",
  "Billing Portal",
  "Split-Custody Payments",
  "Compliance PDF Generator",
  "Document Vault",
];

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeClient() {
  return (
    <main className="relative z-10 flex flex-1 flex-col px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        {/* ================= HERO — split, not centered ================= */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left: copy */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-secondary" />
              </span>
              Sprint 3 — Parent Engagement Live
            </span>

            <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The operating system{" "}
              <span className="text-primary">for modern childcare.</span>
            </h1>

            <p className="mt-5 max-w-md text-balance font-body text-base leading-relaxed text-muted-foreground">
              Sprint 3 makes CareOS a two-way conversation — broadcast
              alerts, private messaging, and read receipts connecting staff
              and families instantly.
            </p>

            <div className="mt-8 flex items-center gap-6 border-t border-border pt-6">
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  3<span className="text-muted-foreground">/8</span>
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Sprint 3 modules shipped
                </p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div>
                <p className="font-display text-2xl font-bold text-foreground">
                  v0.7.0
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Current build
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: a REAL feature mockup — broadcast composer, not a fake terminal */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="lg:col-span-5"
          >
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-black/[0.03]">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-secondary" strokeWidth={2} />
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                    New Broadcast
                  </span>
                </div>
                <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-secondary">
                  Urgent
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex gap-2">
                  {["Low", "Medium", "Urgent"].map((level) => (
                    <span
                      key={level}
                      className={
                        level === "Urgent"
                          ? "rounded-lg bg-secondary px-3 py-1.5 font-mono text-[11px] font-medium text-white"
                          : "rounded-lg border border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground"
                      }
                    >
                      {level}
                    </span>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-background/60 p-3.5">
                  <p className="font-body text-sm leading-relaxed text-foreground">
                    Early pickup drill at 3:15 PM today — please confirm your
                    authorized pickup contact before 2:45 PM.
                  </p>
                </div>

                <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>Scope: Sunflower Room · 14 guardians</span>
                  <span>4:02 PM</span>
                </div>

                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-transform active:scale-[0.98]">
                  Send Broadcast
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="relative mt-14 overflow-hidden rounded-2xl border border-border bg-card py-3.5"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-card to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-card to-transparent" />
          <div className="flex w-max animate-[ticker_28s_linear_infinite] gap-10">
            {[...tickerModules, ...tickerModules].map((m, i) => (
              <span
                key={i}
                className="flex items-center gap-2 whitespace-nowrap font-mono text-xs text-muted-foreground"
              >
                {m.done ? (
                  <CheckCircle2 className="size-3.5 text-primary" strokeWidth={2} />
                ) : (
                  <Circle className="size-3.5 text-muted-foreground/40" strokeWidth={2} />
                )}
                <span className={m.done ? "text-foreground" : ""}>{m.label}</span>
                <span className="text-muted-foreground/40">·</span>
              </span>
            ))}
          </div>
        </motion.div>
        <style>{`
          @keyframes ticker {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>

        {/* ================= FEATURE SPOTLIGHT — shipped vs. honestly-not-yet ================= */}
        <section className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Messaging thread — shipped, gets the real estate */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
            className="lg:col-span-7"
          >
            <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="size-4 text-primary" strokeWidth={2} />
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Direct Messaging
                  </h3>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                  Shipped
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-end gap-3 rounded-2xl bg-background/60 p-4">
                <div className="flex items-end gap-2.5">
                  <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-[10px] font-semibold text-primary">
                    MS
                  </div>
                  <div className="max-w-[75%] rounded-2xl rounded-bl-sm bg-card border border-border px-3.5 py-2.5">
                    <p className="font-body text-sm text-foreground">
                      Ava napped 45 min and finished her lunch 🥕
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">1:12 PM</p>
                  </div>
                </div>
                <div className="flex items-end justify-end gap-2.5">
                  <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5">
                    <p className="font-body text-sm text-primary-foreground">
                      Thank you! See you at pickup 💛
                    </p>
                    <div className="mt-1 flex items-center justify-end gap-1">
                      <p className="font-mono text-[10px] text-primary-foreground/70">1:14 PM</p>
                      <CheckCheck className="size-3 text-primary-foreground/70" />
                    </div>
                  </div>
                  <div className="flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-secondary/15 font-mono text-[10px] font-semibold text-secondary">
                    JD
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Planned — deliberately shown as unfinished, not padded */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={1}
            className="lg:col-span-5"
          >
            <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">
                Queued for Sprint 3
              </h3>
              <p className="mb-5 font-body text-sm text-muted-foreground">
                Nothing here ships until it&apos;s actually built.
              </p>
              <ul className="space-y-2.5">
                {plannedFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center justify-between rounded-xl border border-dashed border-border px-4 py-3"
                  >
                    <span className="font-body text-sm text-muted-foreground">{f}</span>
                    <Lock className="size-3.5 text-muted-foreground/50" strokeWidth={2} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </section>

        {/* ================= ROADMAP — real progression, not equal boxes ================= */}
        <section className="mt-14">
          <h2 className="mb-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Build Timeline
          </h2>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border lg:grid-cols-12">
            {sprintPhases.map((phase, idx) => (
              <motion.div
                key={phase.tag}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={idx}
                className={
                  phase.status === "current"
                    ? "bg-card p-7 lg:col-span-6"
                    : "bg-card p-7 lg:col-span-3"
                }
              >
                <div className="mb-4 flex items-center gap-2">
                  {phase.status === "complete" ? (
                    <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
                  ) : (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    {phase.tag}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {phase.title}
                </h3>

                {phase.items && (
                  <ul className="mt-5 space-y-2">
                    {phase.items.map((item) => (
                      <li key={item.label} className="flex items-center gap-2.5">
                        {item.done ? (
                          <CheckCircle2 className="size-3.5 flex-shrink-0 text-primary" strokeWidth={2} />
                        ) : (
                          <Circle className="size-3.5 flex-shrink-0 text-muted-foreground/40" strokeWidth={2} />
                        )}
                        <span
                          className={
                            item.done
                              ? "font-body text-sm text-foreground"
                              : "font-body text-sm text-muted-foreground"
                          }
                        >
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ================= ACCESS PANEL — one deliberate action zone ================= */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
          className="mt-14 overflow-hidden rounded-3xl bg-primary"
        >
          <div className="flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
            <div>
              <h3 className="font-display text-2xl font-bold text-primary-foreground">
                Access the build.
              </h3>
              <p className="mt-1 font-body text-sm text-primary-foreground/70">
                Messaging, broadcasts, and read receipts are live now.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-5 py-3 text-sm font-medium text-primary transition-transform active:scale-[0.98]"
              >
                Sign In
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Initialize Tenant
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </motion.section>

        <p className="mt-10 text-center font-mono text-xs text-muted-foreground/60">
          Engineered for scale. Documenting all structural decisions in real-time.
        </p>
      </div>
    </main>
  );
}