"use client";

import { motion, Variants } from "framer-motion";
import { ShieldCheck, Lock, Eye, FileText, Mail } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    content: `We collect information that you provide directly to us when you register for an account, create or modify your profile, set preferences, sign up for our services, or communicate with us. This includes your name, email address, phone number, billing information, and the information about your childcare center such as center name, address, and license number.

We also automatically collect certain information when you use our platform, including your IP address, device information, browser type, operating system, and usage data such as the pages you visit, the time spent on those pages, and the features you use.`
  },
  {
    icon: Lock,
    title: "How We Use Your Information",
    content: `We use the information we collect to provide, maintain, and improve our services, including to process transactions, manage your account, and provide customer support. We also use your information to communicate with you about your account, updates to our services, and promotional offers (which you may opt out of at any time).

Your data helps us understand how our platform is being used so we can enhance functionality, develop new features, and ensure the security and reliability of our systems.`
  },
  {
    icon: ShieldCheck,
    title: "How We Protect Your Information",
    content: `The security of your data is paramount. We implement industry-standard security measures including encryption in transit (TLS 1.3) and at rest (AES-256), strict role-based access controls, and regular security audits. Our infrastructure is hosted on SOC 2 Type II certified data centers.

We maintain comprehensive audit logs of all data access and modifications. In the unlikely event of a data breach, we will notify affected users within 72 hours as required by applicable law.`
  },
  {
    icon: FileText,
    title: "Data Sharing and Disclosure",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share information with trusted service providers who assist us in operating our platform, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.

We may also disclose your information when required by law, to enforce our site policies, or to protect our rights, property, or safety, or that of others.`
  },
  {
    icon: Eye,
    title: "Children's Privacy (COPPA Compliance)",
    content: `CareOS is COPPA compliant. We do not knowingly collect personal information from children under 13 years of age. Our platform is designed for use by childcare center administrators, staff, and parents/guardians. Any information about children stored in our system is entered by authorized adult users and is protected with the highest level of security.

If you believe we have inadvertently collected information from a child under 13, please contact us immediately and we will take steps to delete such information.`
  },
  {
    icon: FileText,
    title: "Your Rights and Choices",
    content: `You have the right to access, correct, or delete your personal information at any time. You can update your account information through your account settings or by contacting us directly. You may also request a copy of the data we hold about you.

You can opt out of receiving promotional communications from us by following the unsubscribe instructions included in those emails or by updating your preferences in your account settings.`
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or our data practices, please contact us at:

CareOS, Inc.
San Francisco, CA
Email: privacy@careos.io

We will respond to your inquiry within 48 hours.`
  },
];

export default function PrivacyPage() {
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
            <ShieldCheck className="size-3.5 text-primary" strokeWidth={2} />
            Legal
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
            Last updated: September 2026. We take your privacy seriously.
          </p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                custom={i + 1}
                className="rounded-[1.25rem] border border-border bg-card p-6 sm:p-8"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="size-4 text-primary" strokeWidth={2} />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {s.title}
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {s.content.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="font-body text-sm leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

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