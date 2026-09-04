"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  MapPin,
  CalendarClock,
  ListChecks,
  ArrowRight,
  TrendingUp,
  Users,
  Building2,
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

const funnel = [
  { label: "Waitlisted", count: 34 },
  { label: "Approved", count: 21 },
  { label: "Enrolled", count: 18 },
];

const branches = [
  { name: "Downtown Campus", kids: 84, staff: 14 },
  { name: "Riverside Branch", kids: 61, staff: 10 },
  { name: "North Hills", kids: 45, staff: 8 },
];

export default function ScaleAcrossBranches() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yGlow = useTransform(scrollYProgress, [0, 1], [25, -25]);
  const max = funnel[0].count;

  return (
    <section ref={ref} className="relative mt-28 sm:mt-36">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: yGlow }}
          className="absolute right-[5%] top-[20%] h-[30vh] w-[30vh] rounded-full bg-secondary/[0.02] blur-[100px]"
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
            Multi-Branch Scale
          </span>
          <h2 className="max-w-lg text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Grow from one room to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">ten locations.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>
          </h2>
          <p className="mt-5 max-w-md font-body text-base leading-relaxed text-muted-foreground">
            Add a branch without adding a second admin system. One login,
            one dashboard, one source of truth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ── Funnel ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={1}
            className="lg:col-span-5"
          >
            <div className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-6 sm:p-7">
              <div className="mb-1 flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <ListChecks className="size-4 text-primary" strokeWidth={2} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Enrollment Pipeline
                </h3>
              </div>
              <p className="mb-7 font-body text-sm leading-relaxed text-muted-foreground">
                Full seats mean nothing if the pipeline behind them is a shared
                spreadsheet nobody trusts.
              </p>
              <div className="space-y-5">
                {funnel.map((f) => (
                  <div key={f.label}>
                    <div className="mb-2 flex items-center justify-between font-mono text-xs text-muted-foreground">
                      <span>{f.label}</span>
                      <span className="font-display text-sm font-semibold text-foreground">{f.count}</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(f.count / max) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3">
                  <TrendingUp className="size-4 flex-shrink-0 text-muted-foreground" strokeWidth={2} />
                  <p className="font-body text-sm text-muted-foreground">
                    53% of waitlisted families convert to enrolled within 30 days.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Branches ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={2}
            className="lg:col-span-7"
          >
            <div className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-6 sm:p-7">
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                    <MapPin className="size-4 text-secondary" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Multi-Branch Overview
                  </h3>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  3 locations
                </span>
              </div>
              <p className="mb-6 font-body text-sm leading-relaxed text-muted-foreground">
                Real-time headcount and staffing across every location.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {branches.map((b) => (
                  <div
                    key={b.name}
                    className="rounded-xl border border-border bg-background/60 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="size-3.5 text-muted-foreground" strokeWidth={2} />
                      <p className="font-body text-sm font-medium text-foreground">{b.name}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" strokeWidth={2} />
                        {b.kids} kids
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3" strokeWidth={2} />
                        {b.staff} staff
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-3">
                <CalendarClock className="size-4 flex-shrink-0 text-muted-foreground" strokeWidth={2} />
                <p className="font-body text-sm text-muted-foreground">
                  Staff schedules and classroom rotations sync automatically
                  across every branch.
                </p>
              </div>

              <div className="mt-auto flex items-center gap-2 pt-6 font-mono text-xs text-muted-foreground">
                Scale seat by seat, branch by branch
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}