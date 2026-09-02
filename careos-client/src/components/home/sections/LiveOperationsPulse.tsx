"use client";

import { motion, Variants } from "framer-motion";
import { Gauge, Clock3, UtensilsCrossed, Moon, Activity } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const rooms = [
  { name: "Sunflower Room", ratio: "1:4", limit: "1:6", status: "ok" as const, kids: 12 },
  { name: "Little Explorers", ratio: "1:6", limit: "1:6", status: "warn" as const, kids: 18 },
  { name: "Toddler Cove", ratio: "1:3", limit: "1:4", status: "ok" as const, kids: 9 },
];

const timelineEvents = [
  { icon: UtensilsCrossed, label: "Lunch logged", child: "Ava R.", time: "12:41 PM" },
  { icon: Moon, label: "Nap started", child: "Leo M.", time: "12:55 PM" },
  { icon: Activity, label: "Outdoor play", child: "Sunflower Room", time: "1:10 PM" },
];

export default function LiveOperationsPulse() {
  return (
    <section className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Copy */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={0}
        className="flex flex-col justify-center lg:col-span-4"
      >
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Sprint 2 — Shipped
        </span>
        <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Know what&apos;s happening on the floor{" "}
          <span className="text-primary">without walking the floor.</span>
        </h2>
        <p className="mt-4 max-w-sm text-balance font-body text-sm leading-relaxed text-muted-foreground">
          Ratio breaches are the single most common licensing violation.
          CareOS flags them the moment a room drifts over its legal limit —
          not at the end-of-day headcount.
        </p>
        <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
          {["Per-room ratio cards refresh in real time", "Teachers log meals, naps & activities in one tap", "Offline kiosk sync — no lost check-ins on bad wifi"].map(
            (t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 flex-shrink-0 rounded-full bg-secondary" />
                <span className="font-body text-sm text-muted-foreground">{t}</span>
              </li>
            )
          )}
        </ul>
      </motion.div>

      {/* Live Ratio cards */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={1}
        className="lg:col-span-4"
      >
        <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Gauge className="size-4 text-primary" strokeWidth={2} />
            <h3 className="font-display text-base font-semibold text-foreground">
              Live Ratio Dashboard
            </h3>
          </div>
          <div className="space-y-3">
            {rooms.map((r) => (
              <div
                key={r.name}
                className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3"
              >
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{r.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {r.kids} children
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-mono text-sm font-semibold ${
                      r.status === "warn" ? "text-secondary" : "text-primary"
                    }`}
                  >
                    {r.ratio}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground/70">
                    limit {r.limit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Timeline logger */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        custom={2}
        className="lg:col-span-4"
      >
        <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-2">
            <Clock3 className="size-4 text-secondary" strokeWidth={2} />
            <h3 className="font-display text-base font-semibold text-foreground">
              Teacher Timeline Logger
            </h3>
          </div>
          <div className="relative flex-1 space-y-4 pl-5">
            <div className="absolute bottom-1 left-[7px] top-1 w-px bg-border" />
            {timelineEvents.map((e) => {
              const Icon = e.icon;
              return (
                <div key={e.label} className="relative flex items-start gap-3">
                  <span className="absolute -left-5 mt-0.5 flex size-3.5 items-center justify-center rounded-full border-2 border-card bg-primary" />
                  <Icon className="size-4 flex-shrink-0 text-muted-foreground" strokeWidth={2} />
                  <div>
                    <p className="font-body text-sm text-foreground">{e.label}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {e.child} · {e.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}