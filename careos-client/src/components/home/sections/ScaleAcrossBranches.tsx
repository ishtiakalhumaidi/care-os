"use client";

import { motion, Variants } from "framer-motion";
import { MapPin, CalendarClock, ListChecks, ArrowRight } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
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
  const max = funnel[0].count;

  return (
    <section className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Funnel */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={0}
        className="lg:col-span-5"
      >
        <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 sm:p-7">
          <div className="mb-1 flex items-center gap-2">
            <ListChecks className="size-4 text-primary" strokeWidth={2} />
            <h3 className="font-display text-lg font-semibold text-foreground">
              Enrollment Pipeline
            </h3>
          </div>
          <p className="mb-6 font-body text-sm text-muted-foreground">
            Full seats mean nothing if the pipeline behind them is a shared
            spreadsheet nobody trusts.
          </p>
          <div className="space-y-4">
            {funnel.map((f) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>{f.label}</span>
                  <span>{f.count}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(f.count / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Branches + schedule */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={1}
        className="lg:col-span-7"
      >
        <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 sm:p-7">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-secondary" strokeWidth={2} />
              <h3 className="font-display text-lg font-semibold text-foreground">
                Multi-Branch Overview
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              3 locations
            </span>
          </div>
          <p className="mb-6 font-body text-sm text-muted-foreground">
            Add a branch without adding a second admin system.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {branches.map((b) => (
              <div
                key={b.name}
                className="rounded-xl border border-border bg-background/60 p-4"
              >
                <p className="font-body text-sm font-medium text-foreground">{b.name}</p>
                <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
                  <span>{b.kids} kids</span>
                  <span>{b.staff} staff</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-3">
            <CalendarClock className="size-4 flex-shrink-0 text-muted-foreground" strokeWidth={2} />
            <p className="font-body text-sm text-muted-foreground">
              Staff schedules and classroom rotations sync automatically
              across every branch you add.
            </p>
          </div>

          <div className="mt-auto flex items-center gap-2 pt-6 font-mono text-xs text-muted-foreground">
            Scale seat by seat, branch by branch
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}