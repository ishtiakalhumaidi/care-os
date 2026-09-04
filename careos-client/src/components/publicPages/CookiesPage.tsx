"use client";

import { motion, Variants } from "framer-motion";
import { Cookie, ShieldCheck, Settings, Trash2, Mail } from "lucide-react";

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
    icon: Cookie,
    title: "What Are Cookies",
    content: `Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the website owners.

CareOS uses cookies and similar technologies to enhance your experience, analyze usage patterns, and ensure the security of our platform.`
  },
  {
    icon: ShieldCheck,
    title: "Types of Cookies We Use",
    content: `We use the following categories of cookies:

• Essential Cookies: These are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.

• Analytics Cookies: These help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our Services.

• Functional Cookies: These enable the website to provide enhanced functionality and personalization, such as remembering your preferences and settings.

• Marketing Cookies: These are used to track visitors across websites to display relevant and engaging advertisements.`
  },
  {
    icon: Settings,
    title: "Managing Your Cookie Preferences",
    content: `You can manage your cookie preferences at any time through your browser settings. Most browsers allow you to refuse or accept cookies, delete existing cookies, or set preferences for certain websites.

Please note that disabling certain cookies may affect the functionality of our Services. Essential cookies cannot be disabled as they are required for the platform to operate.`
  },
  {
    icon: Trash2,
    title: "Third-Party Cookies",
    content: `Some cookies on our platform may be placed by third-party service providers who assist us in operating our website, conducting analytics, or providing advertising services. These third parties have their own privacy and cookie policies.

We do not control these third-party cookies and recommend that you review the privacy policies of these providers for more information about their cookie practices.`
  },
  {
    icon: Mail,
    title: "Contact Us",
    content: `If you have any questions about our Cookie Policy or how we use cookies, please contact us at:

CareOS, Inc.
San Francisco, CA
Email: privacy@careos.io`
  },
];

export default function CookiesPage() {
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
            <Cookie className="size-3.5 text-primary" strokeWidth={2} />
            Legal
          </span>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Cookie Policy
          </h1>
          <p className="mx-auto mt-4 max-w-md font-body text-sm leading-relaxed text-muted-foreground">
            Last updated: September 2026. Transparency in how we use cookies.
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
          custom={6}
          className="mt-12 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
        >
          © 2026 CareOS, Inc. All rights reserved.
        </motion.p>
      </div>
    </section>
  );
}