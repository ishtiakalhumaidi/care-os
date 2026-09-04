"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  Gauge,
  Clock3,
  UtensilsCrossed,
  Moon,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yGlow = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={ref} className="relative mt-28 sm:mt-36">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: yGlow }}
          className="absolute right-[5%] top-[10%] h-[30vh] w-[30vh] rounded-full bg-primary/[0.025] blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ── Copy ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="flex flex-col justify-center lg:col-span-4"
          >
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live Operations
            </span>
            <h2 className="text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              Know what&apos;s happening{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">without walking the floor.</span>
                <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
              </span>
            </h2>
            <p className="mt-5 max-w-sm text-balance font-body text-base leading-relaxed text-muted-foreground">
              Ratio breaches are the single most common licensing violation.
              CareOS flags them the moment a room drifts over its legal limit.
            </p>
            <ul className="mt-8 space-y-3.5">
              {[
                "Per-room ratio cards refresh in real time",
                "Teachers log meals, naps & activities in one tap",
                "Offline kiosk sync — no lost check-ins on bad wifi",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" strokeWidth={2} />
                  <span className="font-body text-sm text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Live Ratio cards ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={1}
            className="lg:col-span-4"
          >
            <div className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-6 sm:p-7">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <Gauge className="size-4 text-primary" strokeWidth={2} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Live Ratio Dashboard
                </h3>
              </div>
              <div className="space-y-3">
                {rooms.map((r) => (
                  <div
                    key={r.name}
                    className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3.5"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{r.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {r.kids} children
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className={`font-mono text-sm font-semibold ${r.status === "warn" ? "text-secondary" : "text-primary"}`}>
                          {r.ratio}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground/70">limit {r.limit}</p>
                      </div>
                      {r.status === "ok" ? (
                        <CheckCircle2 className="size-4 text-primary" strokeWidth={2} />
                      ) : (
                        <AlertCircle className="size-4 text-secondary" strokeWidth={2} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Timeline logger ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={2}
            className="lg:col-span-4"
          >
            <div className="flex h-full flex-col rounded-[1.5rem] border border-border bg-card p-6 sm:p-7">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                  <Clock3 className="size-4 text-secondary" strokeWidth={2} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  Teacher Timeline
                </h3>
              </div>
              <div className="relative flex-1 space-y-5 pl-5">
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
        </div>
      </div>
    </section>
  );
}