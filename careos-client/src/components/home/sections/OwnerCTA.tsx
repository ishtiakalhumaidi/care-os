"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { value: "3", suffix: "/8", label: "Sprint 3 modules shipped" },
  { value: "4", suffix: "", label: "role-based dashboards" },
  { value: "11", suffix: "", label: "backend domain modules" },
  { value: "v0.7.0", suffix: "", label: "current build" },
];

export default function OwnerCTA() {
  return (
    <section className="mt-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={0}
        className="mb-10 grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-4"
      >
        {stats.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <p className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              {s.value}
              <span className="text-muted-foreground">{s.suffix}</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={1}
        className="relative overflow-hidden rounded-3xl bg-primary"
      >
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between lg:p-10">
          <div>
            <h3 className="font-display text-2xl font-bold text-primary-foreground sm:text-3xl">
              Run your center on one system.
            </h3>
            <p className="mt-2 max-w-md font-body text-sm text-primary-foreground/70">
              Set up your tenant, invite your staff, and start filling seats
              in the same afternoon.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-5 py-3 text-sm font-medium text-primary transition-transform active:scale-[0.98]"
            >
              Initialize Tenant
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Sign In
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}