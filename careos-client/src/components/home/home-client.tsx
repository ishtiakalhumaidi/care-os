"use client";

import Link from "next/link";
import { ArrowRight, Terminal, Activity, CalendarClock, Users } from "lucide-react";
import { motion, Variants } from "framer-motion"; // <-- Added Variants import

const features = [
  "Touchless Check-In",
  "Live Ratio Matrix",
  "Staff Scheduling",
  "Timeline Feed",
  "Role-Based Routing",
  "Tenant Isolation",
];

const stats = [
  { value: "v0.5.0", label: "Mid-Way Build" },
  { value: "Sprint 2", label: "Current Phase" },
  { value: "60%", label: "Systems Online" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants: Variants = { // <-- Added Variants type
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

export default function HomeClient() {
  return (
    <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid w-full max-w-7xl grid-cols-1 gap-4 md:grid-cols-12 md:gap-6"
      >
        {/* Card 1: Hero Section */}
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.015, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex flex-col items-start justify-center overflow-hidden rounded-[2rem] border border-border/50 bg-card/20 p-8 shadow-2xl shadow-primary/5 backdrop-blur-md transition-shadow hover:border-primary/40 hover:shadow-primary/10 md:col-span-12 lg:col-span-8 lg:p-12"
        >
          {/* Subtle Background Gradient for Hero */}
          <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Sprint 2: Operations Live
            </span>
          </div>
          <h1 className="text-balance font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            The Operating System <br />
            <span className="text-primary/90">for Modern Childcare.</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            The architectural foundation is set. Core center operations, real-time ratio monitoring, and intelligent staff scheduling are now online and ready for testing.
          </p>
        </motion.div>

        {/* Card 2: Login / Auth */}
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group flex flex-col items-center justify-center rounded-[2rem] border border-border/50 bg-card/20 p-8 shadow-2xl shadow-primary/5 backdrop-blur-md transition-shadow hover:border-primary/40 hover:shadow-primary/10 md:col-span-6 lg:col-span-4"
        >
          <div className="mb-8 w-full space-y-2 text-center lg:text-left">
            <h3 className="font-display text-2xl font-semibold text-foreground">Access the Build.</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to explore the newly deployed scheduling and attendance matrices.
            </p>
          </div>
          <div className="flex w-full flex-col items-center gap-4">
            <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/40">
              Sign In to Dashboard
              <ArrowRight className="size-4" />
            </Link>
            <div className="flex w-full items-center gap-4 py-1">
              <div className="h-px flex-1 bg-border/60"></div>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Or</span>
              <div className="h-px flex-1 bg-border/60"></div>
            </div>
            <Link href="/register" className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-3.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring/40">
              Initialize New Tenant
            </Link>
          </div>
        </motion.div>

        {/* Card 3: Interactive Visual Preview */}
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.015, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex min-h-[400px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-border/50 bg-card/20 p-4 shadow-2xl shadow-primary/5 backdrop-blur-md transition-shadow hover:border-primary/40 hover:shadow-primary/10 perspective-[2000px] md:col-span-12 lg:col-span-8 lg:p-8"
        >
          <div className="w-full transition-transform duration-700 group-hover:rotate-x-2 group-hover:-translate-y-1">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/80 bg-background/95">
              <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="h-5 w-32 rounded-md bg-muted/50 sm:w-48" />
                <div className="h-6 w-6 rounded-full bg-primary/20" />
              </div>
              <div className="flex h-full gap-4 p-4">
                <div className="hidden w-48 flex-shrink-0 space-y-3 sm:block">
                  <div className="h-8 w-full rounded-lg bg-primary/10" />
                  <div className="h-8 w-3/4 rounded-lg bg-muted/40" />
                  <div className="h-8 w-5/6 rounded-lg bg-muted/40" />
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <div className="flex h-24 gap-4">
                    <div className="flex-1 space-y-2 rounded-xl border border-border/50 bg-card p-4">
                      <div className="h-4 w-1/3 rounded bg-muted flex items-center gap-2"><Activity className="size-3"/> Live Data</div>
                      <div className="h-8 w-1/2 rounded bg-foreground/10" />
                    </div>
                    <div className="relative flex-1 space-y-2 overflow-hidden rounded-xl border border-secondary/30 bg-secondary/5 p-4">
                      <div className="absolute right-0 top-0 h-full w-1 animate-pulse bg-secondary" />
                      <div className="h-4 w-1/2 rounded bg-secondary/60 flex items-center gap-2"><Users className="size-3"/> Ratios</div>
                      <div className="h-8 w-1/3 rounded bg-secondary/80" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px]">
                <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-6 py-3 font-mono text-sm text-foreground shadow-xl backdrop-blur-xl">
                  <Terminal className="size-4 text-emerald-500" />
                  Command Center Online
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side Column Stack */}
        <div className="flex flex-col gap-4 md:col-span-6 md:gap-6 lg:col-span-4">
          {/* Card 4: Feature Chips */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-1 flex-col justify-center rounded-[2rem] border border-border/50 bg-card/20 p-8 shadow-2xl shadow-primary/5 backdrop-blur-md transition-shadow hover:border-primary/40"
          >
            <h4 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">Active Modules</h4>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <motion.span
                  key={feature}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-default rounded-full border border-border/60 bg-background/50 px-4 py-2 text-[13px] font-medium text-foreground backdrop-blur-md transition-colors hover:border-primary/50 hover:bg-primary/10"
                >
                  {feature}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Card 5: Stats */}
          <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-1 flex-col justify-center rounded-[2rem] border border-border/50 bg-card/20 p-8 shadow-2xl shadow-primary/5 backdrop-blur-md transition-shadow hover:border-primary/40"
          >
            <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <p className="font-display text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <p className="mt-12 text-center font-mono text-xs text-muted-foreground/60">
        Engineered for scale. Documenting all structural decisions in real-time.
      </p>
    </main>
  );
}