"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Building2,
  Users,
  ListChecks,
  Baby,
  Gauge,
  Clock,
  UtensilsCrossed,
  Moon,
  Activity,
  MessageCircle,
  Camera,
  Bell,
  Wallet,
  Split,
  FileCheck2,
  ShieldCheck,
  Zap,
  ChevronRight,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Curved Arrow SVG Component ── */
function CurvedArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 10 C 10 45, 60 55, 110 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        className="text-border"
      />
      <path
        d="M100 22 L110 30 L100 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  );
}

function CurvedArrowDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 10 C 10 70, 50 90, 30 110"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="6 4"
        strokeLinecap="round"
        className="text-border"
      />
      <path
        d="M22 100 L30 110 L38 100"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  );
}

/* ── Hero ── */
function DemoHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[10%] left-1/2 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[160px]" />
      </div>

      <motion.div style={{ opacity }} className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-36 lg:pt-44">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            <Play className="size-3.5 fill-primary text-primary" strokeWidth={2} />
            Product Demo
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-3xl font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            See CareOS{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">in action.</span>
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
            A 2-minute walkthrough of how CareOS transforms the way modern
            childcare centers operate — from enrollment to daily floor management.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Video Player Placeholder ── */
function VideoPlayer() {
  return (
    <section className="relative">
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="relative"
        >
          {/* Depth layers */}
          <div className="absolute -inset-x-3 -top-3 -bottom-3 -z-10 rounded-[2rem] border border-border/50 bg-muted/30" />
          <div className="absolute -inset-x-1.5 -top-1.5 -bottom-1.5 -z-10 rounded-[1.75rem] border border-border/70 bg-muted/50" />

          {/* Browser chrome */}
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-2xl shadow-primary/[0.04]">
            <div className="flex items-center gap-3 border-b border-border px-5 py-3 sm:px-6">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400/60" />
                <span className="size-2.5 rounded-full bg-amber-400/60" />
                <span className="size-2.5 rounded-full bg-green-400/60" />
              </div>
              <div className="ml-2 flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1">
                <ShieldCheck className="size-3 text-muted-foreground" strokeWidth={2} />
                <span className="font-mono text-[10px] text-muted-foreground">
                  demo.careos.io
                </span>
              </div>
            </div>

            {/* Video placeholder area */}
            <div className="relative flex aspect-video items-center justify-center bg-muted/30">
              {/* Grid pattern background */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Center play button */}
              <div className="relative flex flex-col items-center gap-4">
                <button
                  className="group flex size-20 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 sm:size-24"
                  aria-label="Play demo video"
                >
                  <Play className="ml-1 size-8 fill-primary-foreground text-primary-foreground sm:size-10" />
                </button>
                <div className="text-center">
                  <p className="font-display text-lg font-semibold text-foreground">
                    Watch the demo
                  </p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    2 min 14 sec
                  </p>
                </div>
              </div>

              {/* Corner label */}
              <div className="absolute bottom-4 right-4 rounded-lg border border-border bg-card/80 px-3 py-1.5 backdrop-blur-sm">
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                  </span>
                  Video placeholder
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Step Walkthrough ── */
const steps = [
  {
    phase: "Phase 1",
    title: "Set up your center",
    desc: "Create your tenant, define classrooms, and set legal ratio limits. Invite staff and guardians with role-based access.",
    icon: Building2,
    features: [
      { icon: Building2, text: "Tenant & branch registration" },
      { icon: Users, text: "Staff / guardian invitation flow" },
      { icon: ListChecks, text: "Enrollment waitlist setup" },
      { icon: Baby, text: "Child profile & medical forms" },
    ],
    visual: "setup",
  },
  {
    phase: "Phase 2",
    title: "Run the daily floor",
    desc: "Teachers log meals, naps, and activities in one tap. Parents check in via kiosk. Ratios update in real time.",
    icon: Gauge,
    features: [
      { icon: Baby, text: "Kiosk check-in / check-out" },
      { icon: Gauge, text: "Live ratio dashboard" },
      { icon: UtensilsCrossed, text: "Meal, nap & activity logger" },
      { icon: Clock, text: "Staff timesheets & schedules" },
    ],
    visual: "daily",
  },
  {
    phase: "Phase 3",
    title: "Engage parents",
    desc: "Direct messaging with read receipts, encrypted photo gallery, and emergency broadcasts — all in one feed.",
    icon: MessageCircle,
    features: [
      { icon: MessageCircle, text: "Direct messaging & read receipts" },
      { icon: Camera, text: "Encrypted photo & video gallery" },
      { icon: Bell, text: "Emergency broadcasts" },
      { icon: Activity, text: "Daily activity feed" },
    ],
    visual: "engage",
  },
  {
    phase: "Phase 4",
    title: "Get paid & stay compliant",
    desc: "Automated tuition billing, split-custody payments, and one-click compliance PDFs for state inspections.",
    icon: Wallet,
    features: [
      { icon: Wallet, text: "Automated tuition invoicing" },
      { icon: Split, text: "Split-custody payment routing" },
      { icon: FileCheck2, text: "One-click compliance PDFs" },
      { icon: ShieldCheck, text: "Document vault & e-signatures" },
    ],
    visual: "compliance",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[0];
  index: number;
}) {
  const Icon = step.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      custom={index + 1}
      className="relative"
    >
      <div
        className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 ${
          isEven ? "" : "lg:flex-row-reverse"
        }`}
      >
        {/* Text side */}
        <div className={`lg:col-span-5 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
              {step.phase}
            </span>
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-foreground sm:text-3xl">
            {step.title}
          </h3>
          <p className="mt-3 font-body text-base leading-relaxed text-muted-foreground">
            {step.desc}
          </p>
          <ul className="mt-5 space-y-2.5">
            {step.features.map((f) => {
              const FIcon = f.icon;
              return (
                <li key={f.text} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" strokeWidth={2} />
                  <span className="font-body text-sm text-muted-foreground">{f.text}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Visual side */}
        <div className={`lg:col-span-7 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-5 shadow-lg sm:p-6">
            {/* Mini mockup per step */}
            {step.visual === "setup" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-3">
                  <Building2 className="size-4 text-primary" strokeWidth={2} />
                  <span className="font-body text-sm font-medium text-foreground">Sunshine Academy</span>
                  <span className="ml-auto rounded-full bg-green-500/10 px-2 py-0.5 font-mono text-[9px] text-green-500">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {["Downtown", "Riverside"].map((b) => (
                    <div key={b} className="rounded-xl border border-border bg-background/60 p-3">
                      <p className="font-body text-xs font-medium text-foreground">{b}</p>
                      <p className="mt-1 font-mono text-[9px] text-muted-foreground">3 rooms · 24 staff</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
                  <Users className="size-4 text-muted-foreground" strokeWidth={2} />
                  <span className="font-body text-xs text-muted-foreground">Invite staff & guardians →</span>
                </div>
              </div>
            )}

            {step.visual === "daily" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Live Ratios</span>
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    <span className="font-mono text-[9px] text-green-500">Live</span>
                  </span>
                </div>
                {[
                  { room: "Sunflower Room", ratio: "1:4", pct: 75, ok: true },
                  { room: "Little Explorers", ratio: "1:6", pct: 100, ok: false },
                  { room: "Toddler Cove", ratio: "1:3", pct: 60, ok: true },
                ].map((r) => (
                  <div key={r.room} className="flex items-center gap-3">
                    <span className="w-28 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.room}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${r.ok ? "bg-primary" : "bg-secondary"}`}
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                    <span className={`w-10 text-right font-mono text-xs font-semibold ${r.ok ? "text-primary" : "text-secondary"}`}>
                      {r.ratio}
                    </span>
                  </div>
                ))}
                <div className="mt-2 rounded-xl border border-border bg-background/60 p-3">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="size-3.5 text-muted-foreground" strokeWidth={2} />
                    <span className="font-body text-xs text-foreground">Lunch logged</span>
                    <span className="ml-auto font-mono text-[9px] text-muted-foreground">Ava R. · 12:41 PM</span>
                  </div>
                </div>
              </div>
            )}

            {step.visual === "engage" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Activity Feed</span>
                  <span className="font-mono text-[9px] text-green-500">Now</span>
                </div>
                {[
                  { icon: Camera, label: "Photo uploaded", who: "Sunflower Room", time: "1:08 PM" },
                  { icon: MessageCircle, label: "Message from Sarah K.", who: "Parent", time: "1:05 PM" },
                  { icon: Bell, label: "Emergency drill reminder", who: "Admin", time: "12:30 PM" },
                ].map((ev) => {
                  const EIcon = ev.icon;
                  return (
                    <div key={ev.label} className="flex items-center gap-2.5 rounded-lg border border-border bg-background/60 px-3 py-2">
                      <EIcon className="size-3.5 text-muted-foreground" strokeWidth={2} />
                      <span className="font-body text-xs text-foreground">{ev.label}</span>
                      <span className="ml-auto font-mono text-[9px] text-muted-foreground">{ev.time}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {step.visual === "compliance" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Collected this month</p>
                    <p className="mt-1 font-display text-2xl font-bold text-foreground">$31,240</p>
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10">
                    <Zap className="size-5 text-green-500" strokeWidth={2} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {["Attendance — Aug", "Ratio Log — Q3", "Immunizations", "Staff Records"].map((doc) => (
                    <div key={doc} className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2">
                      <FileCheck2 className="size-3.5 text-muted-foreground" strokeWidth={2} />
                      <span className="font-body text-[11px] text-muted-foreground">{doc}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
                  <Split className="size-4 text-muted-foreground" strokeWidth={2} />
                  <span className="font-body text-xs text-muted-foreground">Split custody: 60% / 40% auto-billed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Walkthrough() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[10%] h-[30vh] w-[30vh] rounded-full bg-primary/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-16 text-center sm:mb-20"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <Zap className="size-3.5 text-primary" strokeWidth={2} />
            How it works
          </span>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            From setup to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">first enrollment</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>{" "}
            in one afternoon.
          </h2>
        </motion.div>

        <div className="space-y-16 sm:space-y-24">
          {steps.map((step, i) => (
            <div key={step.phase}>
              <StepCard step={step} index={i} />

              {/* Curved arrow between steps (not after last) */}
              {i < steps.length - 1 && (
                <div className="mt-10 flex justify-center lg:mt-16">
                  <CurvedArrow className="hidden h-12 w-24 text-border lg:block" />
                  <CurvedArrowDown className="h-16 w-10 text-border lg:hidden" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Bottom CTA ── */
function BottomCTA() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="relative overflow-hidden rounded-[1.5rem] bg-primary"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-[20%] -top-[20%] h-[60vh] w-[60vh] rounded-full bg-primary-foreground/[0.03] blur-[100px]" />
            <div className="absolute -bottom-[10%] -left-[10%] h-[40vh] w-[40vh] rounded-full bg-primary-foreground/[0.02] blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-center gap-8 p-8 text-center sm:p-10 lg:p-14">
            <div>
              <h3 className="font-display text-3xl font-bold leading-[1.1] text-primary-foreground sm:text-4xl">
                Ready to try it yourself?
              </h3>
              <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-primary-foreground/70">
                Start your 14-day free trial. No credit card required.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-8 py-3.5 text-sm font-semibold text-primary transition-all active:scale-[0.97]"
              >
                Start free trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Explore features
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {["Free 14-day trial", "No credit card", "Setup in under an hour"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60"
                >
                  <CheckCircle2 className="size-3.5" strokeWidth={2} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Page Export ── */
export default function DemoPage() {
  return (
    <>
      <DemoHero />
      <VideoPlayer />
      <Walkthrough />
      <BottomCTA />
    </>
  );
}