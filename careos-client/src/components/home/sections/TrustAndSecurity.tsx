"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import {
  ShieldCheck,
  FolderLock,
  KeyRound,
  ScanFace,
  Lock,
  Eye,
  Fingerprint,
  FileKey,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const pillars = [
  {
    icon: KeyRound,
    title: "Strict access control",
    desc: "Every route checks role and branch scope. A teacher in Room A can't see Room B's roster, full stop.",
  },
  {
    icon: FolderLock,
    title: "Encrypted gallery",
    desc: "Photos and videos are served through signed, time-limited URLs — visible only to a child's authorized guardians.",
  },
  {
    icon: ScanFace,
    title: "Pickup authorization",
    desc: "Only guardians explicitly approved during enrollment can check out a child at the kiosk.",
  },
  {
    icon: ShieldCheck,
    title: "Document vault",
    desc: "Immunization records and enrollment contracts are uploaded, signed, and stored per child — audit-ready.",
  },
];

export default function TrustAndSecurity() {
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
          className="absolute left-[5%] top-[10%] h-[35vh] w-[35vh] rounded-full bg-primary/[0.02] blur-[120px]"
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* ── Left: Copy ── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              custom={0}
              className="relative flex flex-col justify-center border-b border-border p-8 sm:p-10 lg:col-span-5 lg:border-b-0 lg:border-r"
            >
              <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Trust & Security
              </span>
              <h2 className="max-w-sm text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
                The liability you don&apos;t see is{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">the one that ends a center.</span>
                  <span className="absolute -bottom-1 left-0 right-0 h-2.5 bg-primary/10 sm:h-3" />
                </span>
              </h2>
              <p className="mt-5 max-w-sm font-body text-base leading-relaxed text-muted-foreground">
                A single unauthorized pickup or leaked photo is a licensing
                incident — and a parent you never win back. CareOS builds the
                safeguard into the workflow so no one has to remember it.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { icon: Lock, label: "SOC 2 Type II" },
                  { icon: Eye, label: "End-to-end encryption" },
                  { icon: Fingerprint, label: "Biometric-ready" },
                  { icon: FileKey, label: "Audit trail" },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <span
                      key={t.label}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                    >
                      <Icon className="size-3 text-primary" strokeWidth={2} />
                      {t.label}
                    </span>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Right: Pillars ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-7">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    variants={fadeUp}
                    custom={i + 1}
                    className="group border-b border-border p-7 transition-colors hover:bg-muted/30 sm:p-8 [&:nth-child(odd)]:sm:border-r"
                  >
                    <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-muted text-primary">
                      <Icon className="size-4" strokeWidth={2} />
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                      {p.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}