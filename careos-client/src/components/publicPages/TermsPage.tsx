"use client";

import { motion, Variants } from "framer-motion";
import { FileText, Scale, Gavel, AlertTriangle, Mail } from "lucide-react";

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
    icon: Scale,
    title: "Acceptance of Terms",
    content: `By accessing or using the CareOS platform, website, and services (collectively, "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Services.

These Terms apply to all visitors, users, and others who access or use the Services, including center owners, administrators, teachers, staff members, and guardians.`
  },
  {
    icon: FileText,
    title: "Description of Services",
    content: `CareOS provides a cloud-based software platform designed for childcare centers, daycares, and early childhood education facilities. Our Services include enrollment management, attendance tracking, billing and payment processing, parent communication tools, staff scheduling, compliance reporting, and related features.

We reserve the right to modify, suspend, or discontinue any part of the Services at any time, with or without notice. We will not be liable to you or any third party for any modification, suspension, or discontinuation.`
  },
  {
    icon: Gavel,
    title: "User Accounts and Responsibilities",
    content: `To use certain features of the Services, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated.

You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.

Center owners and administrators are responsible for managing user access within their organization and ensuring that all users comply with these Terms.`
  },
  {
    icon: AlertTriangle,
    title: "Prohibited Conduct",
    content: `You agree not to use the Services for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Services. Prohibited activities include but are not limited to:

• Attempting to gain unauthorized access to any part of the Services
• Interfering with or disrupting the integrity or performance of the Services
• Using the Services to store or transmit malicious code or harmful content
• Violating the privacy rights of children, parents, or staff members
• Reverse engineering, decompiling, or disassembling any aspect of the Services`
  },
  {
    icon: Scale,
    title: "Payment and Billing",
    content: `Subscription fees are billed in advance on a monthly or annual basis, depending on your selected plan. All fees are non-refundable except as required by law or as explicitly stated in our refund policy.

You are responsible for all taxes associated with your use of the Services. We may suspend or terminate your account if payment is not received within 7 days of the due date.

Prices are subject to change. We will provide at least 30 days notice of any price increase before it takes effect.`
  },
  {
    icon: FileText,
    title: "Data Ownership and Intellectual Property",
    content: `You retain ownership of all data, content, and materials that you upload, submit, or transmit through the Services ("Your Content"). By using the Services, you grant us a limited license to access, process, and store Your Content solely for the purpose of providing and improving the Services.

All intellectual property rights in the Services, including software, designs, logos, and documentation, are owned by CareOS, Inc. and are protected by copyright, trademark, and other intellectual property laws.`
  },
  {
    icon: Scale,
    title: "Limitation of Liability",
    content: `To the maximum extent permitted by law, CareOS, Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or in connection with your use of the Services.

Our total liability for any claims arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim.`
  },
  {
    icon: Mail,
    title: "Governing Law and Contact",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.

If you have any questions about these Terms, please contact us at:

CareOS, Inc.
San Francisco, CA
Email: legal@careos.io`
  },
];

export default function TermsPage() {
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
            <Scale className="size-3.5 text-primary" strokeWidth={2} />
            Legal
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Terms of Service
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
            Last updated: September 2026. Please read carefully.
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
          custom={9}
          className="mt-12 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          © 2026 CareOS, Inc. All rights reserved.
        </motion.p>
      </div>
    </section>
  );
}