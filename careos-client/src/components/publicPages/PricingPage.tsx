"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  Users,
  Zap,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface IPlan {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxStudents: number;
  _count?: { tenants: number };
}

interface PricingPageProps {
  initialPlans: IPlan[];
}

/* ── Hero ── */
function PricingHero() {
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
            <Zap className="size-3.5 text-primary" strokeWidth={2} />
            Simple, transparent pricing
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-3xl font-display text-[2.75rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[4rem]"
          >
            Pay for{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">what you use.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-3 bg-primary/10 sm:h-4" />
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-6 max-w-xl text-balance font-body text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            No setup fees. No hidden charges. Start with a 14-day free trial,
            then scale seat by seat and branch by branch.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Plan Card ── */
function PlanCard({
  plan,
  index,
  isPopular,
}: {
  plan: IPlan;
  index: number;
  isPopular?: boolean;
}) {
  const features = [
    `${plan.maxBranches} branch${plan.maxBranches > 1 ? "es" : ""}`,
    `${plan.maxStudents.toLocaleString()} student${plan.maxStudents > 1 ? "s" : ""}`,
    "Unlimited staff accounts",
    "Real-time ratio monitoring",
    "Parent messaging & gallery",
    "Automated billing",
    "Compliance PDF exports",
    "Email support",
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={fadeUp}
      custom={index + 1}
      className={`group relative flex flex-col rounded-[1.5rem] border p-6 transition-all sm:p-7 ${
        isPopular
          ? "border-primary bg-card shadow-xl shadow-primary/5"
          : "border-border bg-card hover:border-primary/20"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
            Most Popular
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/[0.04] blur-[60px]" />
      </div>

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <div className={`flex size-9 items-center justify-center rounded-xl ${isPopular ? "bg-primary/10" : "bg-muted"}`}>
            <Building2 className={`size-4 ${isPopular ? "text-primary" : "text-muted-foreground"}`} strokeWidth={2} />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            {plan.name}
          </h3>
        </div>

        <div className="mt-5 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-foreground sm:text-5xl">
            ${plan.price}
          </span>
          <span className="font-mono text-sm text-muted-foreground">/month</span>
        </div>

        <p className="mt-2 font-body text-sm text-muted-foreground">
          For centers with up to{" "}
          <span className="font-medium text-foreground">{plan.maxBranches}</span>{" "}
          branch{plan.maxBranches > 1 ? "es" : ""} and{" "}
          <span className="font-medium text-foreground">
            {plan.maxStudents.toLocaleString()}
          </span>{" "}
          students.
        </p>

        <ul className="mt-6 space-y-3">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" strokeWidth={2} />
              <span className="font-body text-sm text-muted-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            href="/register"
            className={`group/btn flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
              isPopular
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            Start free trial
            <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Plans Grid ── */
function PlansGrid({ plans }: { plans: IPlan[] }) {
  const sorted = [...plans].sort((a, b) => a.price - b.price);
  const popularIndex = sorted.length >= 2 ? 1 : 0;

  return (
    <section className="relative">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {sorted.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              isPopular={i === popularIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Enterprise CTA ── */
function EnterpriseCTA() {
  return (
    <section className="relative mt-20 sm:mt-28">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="rounded-[1.5rem] border border-border bg-card p-8 sm:p-10"
        >
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
            <ShieldCheck className="size-6 text-primary" strokeWidth={2} />
          </div>
          <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
            Need a custom plan?
          </h3>
          <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
            Running more than 10 branches or 500 students? We offer custom
            enterprise pricing with dedicated onboarding and priority support.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97]"
            >
              Contact sales
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Book a demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ── FAQ ── */
const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Every plan includes a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What happens if I exceed my student limit?",
    a: "We'll notify you when you're close to your limit. You can upgrade instantly without losing any data.",
  },
  {
    q: "Do you offer discounts for non-profits?",
    a: "Yes. Non-profit and community centers receive 30% off any plan. Contact us for verification.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest. We're SOC 2 Type II and COPPA compliant.",
  },
];

function FAQ() {
  return (
    <section className="relative mt-28 sm:mt-36">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <HelpCircle className="size-3.5 text-primary" strokeWidth={2} />
            FAQ
          </span>
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Questions?{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-primary">We have answers.</span>
              <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
            </span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              custom={i + 1}
              className="rounded-[1.25rem] border border-border bg-card p-6 sm:p-7"
            >
              <h3 className="font-display text-base font-semibold text-foreground">
                {faq.q}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Bottom CTA ── */
function BottomCTA() {
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
                Ready to get started?
              </h3>
              <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-primary-foreground/70">
                Start your 14-day free trial today. No credit card required.
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
                href="/demo"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                See how it works
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {["Free 14-day trial", "No credit card", "Cancel anytime"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60"
                >
                  <CheckCircle2 className="size-3.5" strokeWidth={2} />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function PricingPage({ initialPlans }: PricingPageProps) {
  const { data: plans } = useQuery<IPlan[]>({
    queryKey: ["plans"],
    queryFn: async () => initialPlans,
    initialData: initialPlans,
  });

  return (
    <>
      <PricingHero />
      <div className="mt-4">
        <PlansGrid plans={plans || []} />
      </div>
      <EnterpriseCTA />
      <FAQ />
      <BottomCTA />
    </>
  );
}