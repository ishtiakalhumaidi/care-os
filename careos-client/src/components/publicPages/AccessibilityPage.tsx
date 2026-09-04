"use client";

import { motion, Variants } from "framer-motion";
import { Eye, Keyboard, Monitor, Headphones, Mail, CheckCircle2 } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const commitments = [
  {
    icon: Eye,
    title: "Visual Accessibility",
    items: [
      "High contrast mode support",
      "Scalable text up to 200% without loss of functionality",
      "Color-blind friendly palettes and indicators",
      "Screen reader compatible markup (ARIA labels)",
    ],
  },
  {
    icon: Keyboard,
    title: "Keyboard & Motor Accessibility",
    items: [
      "Full keyboard navigation support",
      "Visible focus indicators on all interactive elements",
      "Logical tab order throughout the interface",
      "No time limits on critical actions",
    ],
  },
  {
    icon: Monitor,
    title: "Responsive & Flexible",
    items: [
      "Responsive design for all screen sizes",
      "Compatible with assistive technologies",
      "Consistent navigation and layout patterns",
      "Error prevention and recovery mechanisms",
    ],
  },
  {
    icon: Headphones,
    title: "Content Accessibility",
    items: [
      "Clear, simple language throughout",
      "Descriptive link text and button labels",
      "Form labels and instructions",
      "Alternative text for icons and visual elements",
    ],
  },
];

export default function AccessibilityPage() {
  return (
    <section className="relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[5%] left-1/2 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-primary/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <Eye className="size-3.5 text-primary" strokeWidth={2} />
            Commitment
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Accessibility
          </h1>
          <p className="mx-auto mt-4 max-w-lg font-body text-sm leading-relaxed text-muted-foreground">
            CareOS is committed to ensuring digital accessibility for people with
            disabilities. We continually improve the user experience and apply
            relevant accessibility standards.
          </p>
        </motion.div>

        {/* Status badge */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
          className="mb-10 flex items-center justify-center gap-3 rounded-[1.25rem] border border-border bg-card p-4"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-green-500/10">
            <CheckCircle2 className="size-4 text-green-500" strokeWidth={2} />
          </div>
          <div className="text-left">
            <p className="font-body text-sm font-medium text-foreground">
              WCAG 2.1 Level AA Compliant
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Target standard
            </p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {commitments.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i + 2}
                className="rounded-[1.25rem] border border-border bg-card p-6 sm:p-8"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-primary" strokeWidth={2} />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {c.title}
                  </h2>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-primary" strokeWidth={2} />
                      <span className="font-body text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={7}
          className="mt-10 rounded-[1.25rem] border border-border bg-card p-6 sm:p-8"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Mail className="size-4 text-primary" strokeWidth={2} />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Feedback
            </h2>
          </div>
          <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
            We welcome your feedback on the accessibility of CareOS. If you encounter
            any accessibility barriers or have suggestions for improvement, please
            contact us at{" "}
            <a href="mailto:accessibility@careos.io" className="text-primary underline underline-offset-2">
              accessibility@careos.io
            </a>
            . We aim to respond within 48 hours.
          </p>
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={8}
          className="mt-12 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          © 2026 CareOS, Inc. All rights reserved.
        </motion.p>
      </div>
    </section>
  );
}