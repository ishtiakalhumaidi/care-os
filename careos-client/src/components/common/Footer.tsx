"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Logo } from "./logo";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Compliance", href: "/compliance" },
  { label: "Integrations", href: "/integrations" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
  { label: "Partners", href: "/partners" },
];

const resourceLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "Help Center", href: "/help" },
  { label: "API Reference", href: "/api" },
  { label: "Status", href: "/status" },
  { label: "Changelog", href: "/changelog" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
];

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const socials = [
  { icon: TwitterIcon, href: "https://twitter.com/careos", label: "Twitter" },
  { icon: LinkedInIcon, href: "https://linkedin.com/company/careos", label: "LinkedIn" },
  { icon: GitHubIcon, href: "https://github.com/careos", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="relative mt-28 border-t border-border bg-background sm:mt-36">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        {/* ── Main footer ── */}
        <div className="grid grid-cols-1 gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 lg:py-20">
          {/* Brand column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={0}
            className="lg:col-span-4"
          >
            <Logo className="mb-5" />
            <p className="max-w-xs font-body text-sm leading-relaxed text-muted-foreground">
              The complete platform for modern childcare centers. Enrollment, ratios,
              billing, and compliance — all in one place.
            </p>

            <div className="mt-6 space-y-2.5">
              <a
                href="mailto:hello@careos.io"
                className="flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="size-4 text-primary" strokeWidth={2} />
                hello@careos.io
              </a>
              <a
                href="tel:+18005551234"
                className="flex items-center gap-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="size-4 text-primary" strokeWidth={2} />
                + (880) 15551-12341
              </a>
              <span className="flex items-center gap-2 font-body text-sm text-muted-foreground">
                <MapPin className="size-4 text-primary" strokeWidth={2} />
                Dhaka, Bangladesh
              </span>
            </div>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </motion.div>

          {/* Product */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={1}
            className="lg:col-span-2"
          >
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Product
            </h4>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={2}
            className="lg:col-span-2"
          >
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Company
            </h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={3}
            className="lg:col-span-2"
          >
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Resources
            </h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={4}
            className="lg:col-span-2"
          >
            <h4 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="group inline-flex items-center gap-1 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                    <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={2} />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 sm:flex-row">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} CareOS, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              "SOC 2 Type II",
              "COPPA Compliant",
              "State Audit Ready",
            ].map((badge) => (
              <span
                key={badge}
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}