"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  Radar,
  Wallet,
  Building2,
  Users2,
  ShieldCheck,
  FileCheck2,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Gauge,
  Baby,
  MessageSquare,
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

const benefits = [
  {
    icon: Radar,
    title: "Live ratio compliance",
    desc: "Real-time teacher-to-child ratios per room. Catch a licensing violation before an inspector does.",
    stat: "0 surprise citations",
    span: "lg:col-span-7",
  },
  {
    icon: Wallet,
    title: "Revenue you can see",
    desc: "Tuition, split-custody billing, and payment status in one dashboard. No more chasing invoices.",
    stat: "Auto-collected",
    span: "lg:col-span-5",
  },
  {
    icon: Building2,
    title: "One login, every branch",
    desc: "Run two rooms or ten locations from a single account with branch-level rollups.",
    stat: "Multi-branch",
    span: "lg:col-span-4",
  },
  {
    icon: Users2,
    title: "Staffing without guesswork",
    desc: "Shift schedules and clocked hours show exactly what labor costs look like this week.",
    stat: "Live timesheets",
    span: "lg:col-span-4",
  },
  {
    icon: ShieldCheck,
    title: "RBAC out of the box",
    desc: "Owners, admins, teachers, and guardians each see only what their role needs.",
    stat: "4 role tiers",
    span: "lg:col-span-4",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready paperwork",
    desc: "Generate attendance and ratio compliance PDFs for licensing in one click.",
    stat: "Compliance PDFs",
    span: "lg:col-span-12",
  },
];

export default function OwnerCommandCenter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative mt-28 sm:mt-36">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: yBg }}
          className="absolute -left-[10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-primary/[0.025] blur-[120px]"
        />
        <motion.div
          style={{ y: yBg }}
          className="absolute -right-[10%] top-[60%] h-[35vh] w-[35vh] rounded-full bg-secondary/[0.02] blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ── Section header ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-16 max-w-2xl sm:mb-20"
        >
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Built for Center Owners
          </span>
          <h2 className="text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Everything you need to run{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">the business,</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>{" "}
            not just the classroom.
          </h2>
          <p className="mt-5 max-w-md text-balance font-body text-base leading-relaxed text-muted-foreground">
            Every module maps to a real cost center: compliance risk, staff hours,
            or tuition revenue.
          </p>
        </motion.div>

        {/* ── Bento grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i + 1}
                className={`group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7 ${b.span}`}
              >
                {/* Subtle hover glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.04] blur-[60px]" />
                </div>

                <div className="relative">
                  {/* Top row: icon + stat */}
                  <div className="flex items-start justify-between">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                      <Icon className="size-5" strokeWidth={2} />
                    </div>
                    <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent-foreground">
                      {b.stat}
                    </span>
                  </div>

                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                    {b.title}
                  </h3>
                  <p className="mt-2 max-w-sm font-body text-sm leading-relaxed text-muted-foreground">
                    {b.desc}
                  </p>

                  <ArrowUpRight
                    className="absolute bottom-0 right-0 size-4 text-muted-foreground/20 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary/60"
                    strokeWidth={2}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom trust bar ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          custom={7}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-10 sm:mt-20"
        >
          {[
            { icon: Gauge, label: "Real-time ratios" },
            { icon: Baby, label: "Kiosk check-in" },
            { icon: MessageSquare, label: "Parent messaging" },
            { icon: TrendingUp, label: "Revenue tracking" },
            { icon: Clock, label: "Staff timesheets" },
            { icon: CheckCircle2, label: "Audit-ready PDFs" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                <Icon className="size-3.5 text-primary" strokeWidth={2} />
                {item.label}
              </span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}