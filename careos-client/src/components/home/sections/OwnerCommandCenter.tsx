"use client";

import { motion, Variants } from "framer-motion";
import {
  Building2,
  Radar,
  Wallet,
  ShieldCheck,
  Users2,
  FileCheck2,
  ArrowUpRight,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const benefits = [
  {
    icon: Radar,
    title: "Ratio compliance, live",
    desc: "See teacher-to-child ratios per room in real time. Catch a licensing violation before an inspector does, not after.",
    stat: "0 surprise citations",
    span: "lg:col-span-7",
  },
  {
    icon: Wallet,
    title: "Revenue you can see",
    desc: "Tuition, split-custody billing, and payment status roll up to one dashboard — no more chasing invoices across spreadsheets.",
    stat: "Sprint 3",
    span: "lg:col-span-5",
  },
  {
    icon: Building2,
    title: "One login, every branch",
    desc: "Run two rooms or ten locations from a single tenant account with branch-level rollups.",
    stat: "Multi-branch",
    span: "lg:col-span-4",
  },
  {
    icon: Users2,
    title: "Staffing without the guesswork",
    desc: "Shift schedules and clocked hours tell you exactly what your labor cost looks like this week.",
    stat: "Live timesheets",
    span: "lg:col-span-4",
  },
  {
    icon: ShieldCheck,
    title: "RBAC out of the box",
    desc: "Owners, admins, teachers, and guardians each see only what their role should. No custom permission work.",
    stat: "4 role tiers",
    span: "lg:col-span-4",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready paperwork",
    desc: "Generate attendance and ratio compliance PDFs for government licensing in one click instead of a week of admin time.",
    stat: "Compliance PDFs",
    span: "lg:col-span-12",
  },
];

export default function OwnerCommandCenter() {
  return (
    <section className="mt-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={0}
        className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Built for Center Owners
          </span>
          <h2 className="max-w-xl text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything you need to run the business,{" "}
            <span className="text-primary">not just the classroom.</span>
          </h2>
        </div>
        <p className="max-w-xs text-balance font-body text-sm leading-relaxed text-muted-foreground">
          Every module below maps to a real cost center: compliance risk,
          staff hours, or tuition revenue.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
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
              className={`group relative overflow-hidden rounded-3xl border border-border bg-card p-6 transition-colors hover:border-primary/30 sm:p-7 ${b.span}`}
            >
              <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-40" />
              <div className="relative flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-primary">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent-foreground">
                  {b.stat}
                </span>
              </div>

              <h3 className="relative mt-5 font-display text-lg font-semibold text-foreground">
                {b.title}
              </h3>
              <p className="relative mt-2 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
                {b.desc}
              </p>

              <ArrowUpRight
                className="absolute bottom-6 right-6 size-4 text-muted-foreground/30 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                strokeWidth={2}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}