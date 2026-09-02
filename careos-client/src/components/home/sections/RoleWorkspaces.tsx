"use client";

import { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Building2,
  UserCog,
  GraduationCap,
  Baby,
  LayoutDashboard,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const roles = [
  {
    key: "owner",
    label: "Owner",
    icon: Building2,
    headline: "Portfolio view across every branch",
    bullets: [
      "Revenue & occupancy rollup by location",
      "Cross-branch staffing and ratio alerts",
      "Subscription plan & billing controls",
    ],
  },
  {
    key: "admin",
    label: "Center Admin",
    icon: UserCog,
    headline: "Day-to-day operations for one center",
    bullets: [
      "Waitlist → enrollment approval queue",
      "Classroom assignment & ratio limits",
      "Staff schedules and invite management",
    ],
  },
  {
    key: "teacher",
    label: "Teacher",
    icon: GraduationCap,
    headline: "The floor tools, nothing else",
    bullets: [
      "Quick-tap meal, nap & activity logging",
      "Class roster with medical/allergy flags",
      "Direct messages to a child's guardians",
    ],
  },
  {
    key: "guardian",
    label: "Guardian",
    icon: Baby,
    headline: "Warmth, not admin overhead",
    bullets: [
      "Daily activity feed with photos",
      "Kiosk check-in / check-out",
      "Invoices, messaging & read receipts",
    ],
  },
];

export default function RoleWorkspaces() {
  const [active, setActive] = useState(roles[0].key);
  const current = roles.find((r) => r.key === active)!;

  return (
    <section className="mt-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={0}
        className="mb-8"
      >
        <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Role-Based Access Control
        </span>
        <h2 className="max-w-lg text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          One tenant. <span className="text-primary">Four right answers.</span>
        </h2>
        <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
          You don&apos;t configure permissions — you invite a person to a
          role, and CareOS shows them exactly what that role needs.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={1}
        className="overflow-hidden rounded-3xl border border-border bg-card"
      >
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = r.key === active;
            return (
              <button
                key={r.key}
                onClick={() => setActive(r.key)}
                className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="role-tab-bg"
                    className="absolute inset-0 rounded-xl bg-muted"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className="relative size-3.5" strokeWidth={2} />
                <span className="relative">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div className="grid grid-cols-1 gap-8 p-7 sm:p-9 lg:grid-cols-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="lg:col-span-6"
            >
              <h3 className="font-display text-xl font-semibold text-foreground">
                {current.headline}
              </h3>
              <ul className="mt-5 space-y-3">
                {current.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span className="font-body text-sm text-muted-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-background/60 p-8 lg:col-span-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-primary">
                <LayoutDashboard className="size-6" strokeWidth={2} />
              </div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {current.label} Dashboard
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}