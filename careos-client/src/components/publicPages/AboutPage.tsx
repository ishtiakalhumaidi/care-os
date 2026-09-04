"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Target,
  Users,
  Baby,
  TrendingUp,
  Zap,
  MapPin,
  Mail,
  Globe,
  Star,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Hero ── */
function AboutHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[10%] left-1/2 h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[160px]" />
      </div>

      <motion.div style={{ opacity }} className="relative z-10">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-36 lg:pt-44">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
          >
            <Heart className="size-3.5 text-primary" strokeWidth={2} />
            Built with care
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-3xl font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            We build software for{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">the people who care</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 sm:h-4" />
            </span>{" "}
            for our children.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-xl text-balance font-body text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            CareOS was born from a simple belief: the people running childcare
            centers deserve tools as thoughtful as the care they provide.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Story ── */
function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const yGlow = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section ref={ref} className="relative">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          style={{ y: yGlow }}
          className="absolute left-[5%] top-[20%] h-[30vh] w-[30vh] rounded-full bg-primary/[0.02] blur-[100px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Our Story
            </span>
            <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              It started with a{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-primary">spreadsheet</span>
                <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
              </span>{" "}
              and a problem.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={1}
            className="space-y-5"
          >
            <p className="font-body text-base leading-relaxed text-muted-foreground">
              In 2023, we watched a center director spend three hours every Sunday
              reconciling attendance logs, tuition payments, and staff schedules
              across four different apps and two paper binders.
            </p>
            <p className="font-body text-base leading-relaxed text-muted-foreground">
              The software available to her was either built for schools (too rigid)
              or generic business tools (too shallow). Nothing understood the unique
              rhythm of a childcare center: the ratios, the pickups, the parent trust.
            </p>
            <p className="font-body text-base leading-relaxed text-muted-foreground">
              So we built CareOS — an operating system designed from the ground up
              for the people who run modern childcare. Not a patchwork of tools.
              One platform that handles enrollment, compliance, billing, and parent
              communication with the same care the centers give their children.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Values ── */
const values = [
  {
    icon: Heart,
    title: "Care first",
    desc: "Every feature decision starts with the question: does this make life easier for the director, teacher, or parent?",
  },
  {
    icon: ShieldCheck,
    title: "Trust by design",
    desc: "Security and compliance aren't afterthoughts. They're built into the workflow so no one has to remember them.",
  },
  {
    icon: Target,
    title: "Outcome obsessed",
    desc: "We measure success by the hours we save directors, not by features shipped. Less admin, more care.",
  },
  {
    icon: Users,
    title: "Built together",
    desc: "Our roadmap is shaped by the 200+ centers running on CareOS. If they need it, we build it.",
  },
];

function Values() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-12 max-w-2xl sm:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            What We Believe
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Values that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">shape every decision.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <motion.div
                key={v.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                custom={i + 1}
                className="group relative overflow-hidden rounded-[1.5rem] border border-border bg-card p-6 transition-colors hover:border-primary/20 sm:p-7"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-primary/[0.04] blur-[50px]" />
                </div>
                <div className="relative">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-4 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                    {v.title}
                  </h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                    {v.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Stats ── */
const stats = [
  { value: "200+", label: "Childcare centers" },
  { value: "14,000+", label: "Children enrolled" },
  { value: "48", label: "US states" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "4.9/5", label: "Average rating" },
  { value: "24/7", label: "Support coverage" },
];

function Stats() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="rounded-[1.5rem] border border-border bg-card p-8 sm:p-10 lg:p-12"
        >
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-bold text-foreground sm:text-4xl">
                  {s.value}
                </p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Testimonial ── */
function Testimonial() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="size-5 fill-amber-500 text-amber-500" strokeWidth={1.5} />
            ))}
          </div>
          <blockquote className="mt-6 font-display text-2xl font-semibold leading-snug text-foreground sm:text-3xl">
            &ldquo;CareOS didn&apos;t just replace our spreadsheets. It gave us back
            our Sundays. Our director now spends time with the children instead
            of the paperwork.&rdquo;
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted font-display text-sm font-bold text-foreground">
              MK
            </div>
            <div className="text-left">
              <p className="font-body text-sm font-medium text-foreground">Maria Kim</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Director, Little Sprouts Academy
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── Contact / CTA ── */
function ContactCTA() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="relative overflow-hidden rounded-[1.5rem] bg-primary"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-[20%] -top-[20%] h-[60vh] w-[60vh] rounded-full bg-primary-foreground/[0.03] blur-[100px]" />
            <div className="absolute -bottom-[10%] -left-[10%] h-[40vh] w-[40vh] rounded-full bg-primary-foreground/[0.02] blur-[80px]" />
          </div>

          <div className="relative flex flex-col items-center gap-8 p-8 text-center sm:p-10 lg:p-14">
            <div>
              <h3 className="font-display text-3xl font-bold leading-[1.1] text-primary-foreground sm:text-4xl">
                Want to learn more?
              </h3>
              <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-primary-foreground/70">
                Whether you&apos;re a single-room center or a multi-state franchise,
                we&apos;d love to show you how CareOS fits.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground px-8 py-3.5 text-sm font-semibold text-primary transition-all active:scale-[0.97]"
              >
                Start free trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                <Mail className="size-4" />
                Contact us
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {[
                { icon: MapPin, label: "San Francisco, CA" },
                { icon: Mail, label: "hello@careos.io" },
                { icon: Globe, label: "careos.io" },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60"
                  >
                    <Icon className="size-3.5" strokeWidth={2} />
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <Story />
      <Values />
      <Stats />
      <Testimonial />
      <ContactCTA />
    </>
  );
}