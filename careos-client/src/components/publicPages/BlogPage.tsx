"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Newspaper, Clock, Bell } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function BlogPage() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[10%] left-1/2 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center px-4 py-28 text-center sm:px-6 sm:py-36">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="flex size-16 items-center justify-center rounded-2xl bg-muted"
        >
          <Newspaper className="size-8 text-primary" strokeWidth={1.5} />
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="mt-8 max-w-2xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          The CareOS{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-primary">Blog</span>
            <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 sm:h-4" />
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="mx-auto mt-5 max-w-lg text-balance font-body text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Insights on running a modern childcare center, compliance best practices,
          and product updates from the CareOS team.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <Clock className="size-3.5 text-secondary" strokeWidth={2} />
            Coming soon
          </div>
          <p className="max-w-sm text-balance font-body text-sm text-muted-foreground">
            We&apos;re building something worth reading. Subscribe to get notified when
            the first article drops.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all active:scale-[0.97]"
          >
            Start free trial
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Bell className="size-4" />
            Notify me
          </Link>
        </motion.div>
      </div>
    </section>
  );
}