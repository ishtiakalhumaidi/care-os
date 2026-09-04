"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  Variants,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Gauge,
  Baby,
  Wallet,
  Building2,
  Activity,
  Users,
  FileText,
  ShieldCheck,
  MessageCircle,
  Camera,
  Clock,
  UtensilsCrossed,
  Moon,
  TrendingUp,
  Split,
  FileCheck2,
  MapPin,
  ListChecks,
  Radar,
  Zap,
  Lock,
  Eye,
  Fingerprint,
  Smartphone,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronRight,
  Star,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────
   CareOS — Features Page (Production-Grade, Premium)
   ──────────────────────────────────────────────────────────────── */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Hero ── */
function FeaturesHero() {
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
        <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-28 sm:pt-36 lg:pt-44">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            <Zap className="size-3.5 text-primary" strokeWidth={2} />
            Everything your center needs
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-3xl font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            One platform.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Every workflow.</span>
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
            From the moment a parent inquires to the moment you close your monthly
            books — CareOS handles the operational layer so you can focus on the children.
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
              See how it works
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Bento Feature Grid ── */
const featureGroups = [
  {
    title: "Live Operations",
    icon: Gauge,
    span: "lg:col-span-7",
    items: [
      { icon: Radar, text: "Real-time ratio monitoring per room" },
      { icon: Baby, text: "Kiosk check-in / check-out with timestamps" },
      { icon: Clock, text: "Offline sync — no lost data on bad wifi" },
      { icon: Activity, text: "Teacher timeline logger (meals, naps, play)" },
    ],
    visual: "ratios",
  },
  {
    title: "Parent Engagement",
    icon: MessageCircle,
    span: "lg:col-span-5",
    items: [
      { icon: MessageCircle, text: "Direct messaging with read receipts" },
      { icon: Camera, text: "Encrypted photo & video gallery" },
      { icon: Bell, text: "Emergency broadcasts to all guardians" },
      { icon: Smartphone, text: "Daily activity feed on any device" },
    ],
    visual: "feed",
  },
  {
    title: "Revenue & Billing",
    icon: Wallet,
    span: "lg:col-span-4",
    items: [
      { icon: Wallet, text: "Automated tuition invoicing" },
      { icon: Split, text: "Split-custody payment routing" },
      { icon: TrendingUp, text: "Revenue forecasting by branch" },
      { icon: BarChart3, text: "Payment status dashboard" },
    ],
    visual: "billing",
  },
  {
    title: "Compliance & Audit",
    icon: FileCheck2,
    span: "lg:col-span-4",
    items: [
      { icon: FileText, text: "One-click compliance PDFs" },
      { icon: FileCheck2, text: "Attendance & ratio logs for state" },
      { icon: CalendarDays, text: "Immunization record tracking" },
      { icon: ShieldCheck, text: "Document vault with e-signatures" },
    ],
    visual: "compliance",
  },
  {
    title: "Multi-Branch Scale",
    icon: Building2,
    span: "lg:col-span-4",
    items: [
      { icon: Building2, text: "One login, unlimited branches" },
      { icon: ListChecks, text: "Enrollment pipeline per location" },
      { icon: MapPin, text: "Cross-branch staffing & ratios" },
      { icon: Users, text: "Centralized guardian database" },
    ],
    visual: "branches",
  },
  {
    title: "Security & Trust",
    icon: Lock,
    span: "lg:col-span-12",
    items: [
      { icon: Lock, text: "Role-based access control (RBAC)" },
      { icon: Eye, text: "Signed, time-limited media URLs" },
      { icon: Fingerprint, text: "Authorized pickup verification" },
      { icon: ShieldCheck, text: "SOC 2 Type II & COPPA compliant" },
    ],
    visual: "security",
  },
];

function FeatureCard({
  group,
  index,
}: {
  group: (typeof featureGroups)[0];
  index: number;
}) {
  const Icon = group.icon;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yGlow = useTransform(scrollYProgress, [0, 1], [15, -15]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      custom={index + 1}
      className={`group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7 ${group.span}`}
    >
      <motion.div
        style={{ y: yGlow }}
        className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.03] blur-[60px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
            <Icon className="size-4 text-primary" strokeWidth={2} />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {group.title}
          </h3>
        </div>

        <ul className="mt-5 space-y-3">
          {group.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <li key={item.text} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" strokeWidth={2} />
                <span className="font-body text-sm text-muted-foreground">
                  {item.text}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Mini visual per card */}
        {group.visual === "ratios" && (
          <div className="mt-6 space-y-2">
            {[
              { room: "Sunflower", pct: 75 },
              { room: "Explorers", pct: 100 },
              { room: "Toddler", pct: 60 },
            ].map((r) => (
              <div key={r.room} className="flex items-center gap-3">
                <span className="w-20 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {r.room}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`h-full rounded-full ${r.pct >= 90 ? "bg-secondary" : "bg-primary"}`}
                  />
                </div>
                <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        )}

        {group.visual === "feed" && (
          <div className="mt-6 rounded-xl border border-border bg-background/60 p-4">
            <div className="space-y-2.5">
              {[
                { label: "Lunch logged", time: "12:41 PM" },
                { label: "Nap started", time: "12:55 PM" },
                { label: "Photo uploaded", time: "1:08 PM" },
              ].map((ev) => (
                <div key={ev.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    <span className="font-body text-xs text-foreground">{ev.label}</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {group.visual === "billing" && (
          <div className="mt-6 rounded-xl border border-border bg-background/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Collected this month
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">
                  $31,240
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-green-500/10">
                <TrendingUp className="size-5 text-green-500" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "78%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-primary"
              />
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">
              78% of families paid on time
            </p>
          </div>
        )}

        {group.visual === "compliance" && (
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[
              { doc: "Attendance — Aug", status: "Ready" },
              { doc: "Ratio Log — Q3", status: "Ready" },
              { doc: "Immunizations", status: "Ready" },
              { doc: "Staff Records", status: "Ready" },
            ].map((d) => (
              <div
                key={d.doc}
                className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2"
              >
                <FileText className="size-3.5 text-muted-foreground" strokeWidth={2} />
                <div>
                  <p className="font-body text-[11px] text-foreground">{d.doc}</p>
                  <p className="font-mono text-[9px] text-green-500">{d.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {group.visual === "branches" && (
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { name: "Downtown", kids: 84, staff: 14 },
              { name: "Riverside", kids: 61, staff: 10 },
              { name: "North Hills", kids: 45, staff: 8 },
            ].map((b) => (
              <div
                key={b.name}
                className="rounded-xl border border-border bg-background/60 p-3 text-center"
              >
                <p className="font-body text-[11px] font-medium text-foreground">{b.name}</p>
                <div className="mt-2 flex justify-center gap-2 font-mono text-[9px] text-muted-foreground">
                  <span>{b.kids}K</span>
                  <span>{b.staff}S</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {group.visual === "security" && (
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "End-to-end encryption",
              "SOC 2 Type II",
              "COPPA Compliant",
              "Biometric-ready",
              "Audit trail",
              "State audit ready",
            ].map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                <ShieldCheck className="size-3 text-primary" strokeWidth={2} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── How It Works ── */
const steps = [
  {
    number: "01",
    title: "Set up your center",
    desc: "Create your tenant, define classrooms, and set legal ratio limits. Takes under 10 minutes.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Invite your team",
    desc: "Send role-based invites to staff and guardians. They see only what their role needs.",
    icon: Users,
  },
  {
    number: "03",
    title: "Start enrolling",
    desc: "Parents apply through your branded waitlist. You approve, assign classrooms, and go live.",
    icon: ListChecks,
  },
  {
    number: "04",
    title: "Run on autopilot",
    desc: "Ratios, billing, messaging, and compliance run in the background. You run the center.",
    icon: Zap,
  },
];

function HowItWorks() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-[35vh] w-[35vh] rounded-full bg-primary/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-16 max-w-2xl text-center sm:mb-20"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            How it works
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            From setup to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">first enrollment</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>{" "}
            in one afternoon.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i + 1}
                className="group relative rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/[0.04] blur-[40px]" />
                </div>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-muted-foreground/30">
                      {step.number}
                    </span>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-4 text-primary" strokeWidth={2} />
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Comparison ── */
const comparisons = [
  { label: "Real-time ratio alerts", careos: true, others: false },
  { label: "Split-custody billing", careos: true, others: false },
  { label: "Multi-branch from one login", careos: true, others: false },
  { label: "Encrypted parent gallery", careos: true, others: false },
  { label: "Auto compliance PDFs", careos: true, others: false },
  { label: "Offline kiosk sync", careos: true, others: false },
  { label: "Role-based dashboards", careos: true, others: true },
  { label: "Basic attendance tracking", careos: true, others: true },
];

function Comparison() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Why CareOS
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Built for centers.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Not patched together.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={1}
          className="overflow-hidden rounded-[1.5rem] border border-border bg-card"
        >
          <div className="grid grid-cols-[1fr_auto_auto] border-b border-border px-6 py-4 sm:px-8">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Feature
            </span>
            <span className="px-4 text-center font-mono text-[10px] uppercase tracking-widest text-primary sm:px-8">
              CareOS
            </span>
            <span className="px-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:px-8">
              Others
            </span>
          </div>
          {comparisons.map((c, i) => (
            <div
              key={c.label}
              className={`grid grid-cols-[1fr_auto_auto] items-center px-6 py-3.5 sm:px-8 ${
                i !== comparisons.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="font-body text-sm text-foreground">{c.label}</span>
              <span className="flex justify-center px-4 sm:px-8">
                {c.careos ? (
                  <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
                ) : (
                  <span className="size-4 rounded-full border border-border" />
                )}
              </span>
              <span className="flex justify-center px-4 sm:px-8">
                {c.others ? (
                  <CheckCircle2 className="size-4 text-muted-foreground" strokeWidth={2} />
                ) : (
                  <span className="size-4 rounded-full border border-border bg-muted" />
                )}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ── Testimonial ── */
function Testimonial() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="size-5 fill-amber-500 text-amber-500" strokeWidth={1.5} />
            ))}
          </div>
          <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
            &ldquo;We went from three spreadsheets and a WhatsApp group to one
            dashboard. Our state inspection took 20 minutes instead of two days.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-foreground">
              JD
            </div>
            <div className="text-left">
              <p className="font-body text-sm font-medium text-foreground">Jane Doe</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Director, Sunshine Academy — 3 locations
              </p>
            </div>
          </div>
        </motion.div>
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
                Ready to run your center on one system?
              </h3>
              <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-primary-foreground/70">
                Start your free 14-day trial. No credit card required. No setup fees.
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
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                See how it works
                <ChevronRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {[
                "Free 14-day trial",
                "No credit card",
                "Setup in under an hour",
              ].map((t) => (
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
export default function FeaturesPage() {
  return (
    <main className="relative z-10 flex flex-1 flex-col px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto w-full max-w-7xl">
        <FeaturesHero />

        {/* Bento Grid */}
        <section className="relative mt-16 sm:mt-20">
          <div className="relative z-10 mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
              {featureGroups.map((group, i) => (
                <FeatureCard key={group.title} group={group} index={i} />
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        <Comparison />
        <Testimonial />
        <BottomCTA />
      </div>
    </main>
  );
}