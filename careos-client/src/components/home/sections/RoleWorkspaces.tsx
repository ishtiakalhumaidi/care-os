"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, Variants, AnimatePresence } from "framer-motion";
import {
  Building2,
  UserCog,
  GraduationCap,
  Baby,
  LayoutDashboard,
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
      "Waitlist to enrollment approval queue",
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
          className="absolute left-[10%] top-[30%] h-[35vh] w-[35vh] rounded-full bg-primary/[0.02] blur-[120px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-12 max-w-2xl sm:mb-16"
        >
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Role-Based Access
          </span>
          <h2 className="max-w-lg text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            One tenant.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">Four right answers.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>
          </h2>
          <p className="mt-5 max-w-md font-body text-base leading-relaxed text-muted-foreground">
            You don&apos;t configure permissions — you invite a person to a
            role, and CareOS shows them exactly what that role needs.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={1}
          className="overflow-hidden rounded-[1.5rem] border border-border bg-card"
        >
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-border p-2 sm:p-3">
            {roles.map((r) => {
              const Icon = r.icon;
              const isActive = r.key === active;
              return (
                <button
                  key={r.key}
                  onClick={() => setActive(r.key)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="lg:col-span-6"
              >
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {current.headline}
                </h3>
                <ul className="mt-6 space-y-3.5">
                  {current.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" strokeWidth={2} />
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
      </div>
    </section>
  );
}