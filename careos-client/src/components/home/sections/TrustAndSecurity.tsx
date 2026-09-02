"use client";

import { motion, Variants } from "framer-motion";
import { ShieldCheck, FolderLock, KeyRound, ScanFace } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const pillars = [
  {
    icon: KeyRound,
    title: "Strict RBAC",
    desc: "Every route checks role and branch scope. A teacher in Room A can't see Room B's roster, full stop.",
  },
  {
    icon: FolderLock,
    title: "Encrypted Gallery",
    desc: "Photos and videos are served through signed, time-limited URLs — visible only to a child's authorized guardians.",
  },
  {
    icon: ScanFace,
    title: "Pickup Authorization",
    desc: "Only guardians explicitly approved during enrollment can be checked out with a child at the kiosk.",
  },
  {
    icon: ShieldCheck,
    title: "Document Vault",
    desc: "Immunization records and enrollment contracts are uploaded, signed, and stored per child — audit-ready.",
  },
];

export default function TrustAndSecurity() {
  return (
    <section className="mt-20 overflow-hidden rounded-3xl border border-border bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
          className="grid-backdrop relative flex flex-col justify-center border-b border-border p-8 sm:p-10 lg:col-span-5 lg:border-b-0 lg:border-r"
        >
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Trust & Security
          </span>
          <h2 className="text-balance font-display text-3xl font-extrabold tracking-tight text-foreground">
            The liability you don&apos;t see is the one that ends a center.
          </h2>
          <p className="mt-4 max-w-sm font-body text-sm leading-relaxed text-muted-foreground">
            A single unauthorized pickup or leaked photo is a licensing
            incident — and a parent you never win back. CareOS builds the
            safeguard into the workflow so no one has to remember it.
          </p>
        </motion.div>

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
                className="border-b border-border p-7 sm:p-8 [&:nth-child(odd)]:sm:border-r"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-muted text-primary">
                  <Icon className="size-4.5" strokeWidth={2} />
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
    </section>
  );
}