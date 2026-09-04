"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, ArrowRight } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { logoutAction } from "@/actions/auth.actions";
import { authClient } from "@/lib/auth-client";

interface NavClientProps {
  isLoggedIn: boolean;
  dashboardRoute: string;
}

const publicLinks = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export function NavClient({ isLoggedIn, dashboardRoute }: NavClientProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Failed to sign out from Better Auth:", error);
    } finally {
      await logoutAction();
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border/60 bg-background/80 backdrop-blur-xl shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-10 w-fit rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Logo />
          </Link>

          {/* --- Desktop Navigation --- */}
          <div className="hidden items-center gap-1 md:flex">
            {publicLinks.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-lg px-3 py-2 font-body text-sm transition-colors ${
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-muted"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* --- Desktop Actions --- */}
          <div className="hidden items-center gap-3 md:flex">
            <ModeToggle />

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardRoute}
                  className="group inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97]"
                >
                  <LayoutDashboard className="size-4" strokeWidth={2} />
                  Dashboard
                </Link>

                <button
                  onClick={handleSignOut}
                  className="group flex h-10 items-center justify-center rounded-xl border border-input bg-background px-3 transition-colors duration-300 ease-in-out hover:border-destructive hover:bg-destructive"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4 shrink-0 text-foreground transition-colors duration-300 ease-in-out group-hover:text-destructive-foreground" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-foreground opacity-0 transition-all duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:text-destructive-foreground">
                    Sign out
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2.5 font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all active:scale-[0.97]"
                >
                  Start free trial
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>

          {/* --- Mobile Toggle --- */}
          <div className="flex items-center gap-2 md:hidden">
            <ModeToggle />
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="size-4" aria-hidden="true" />
              ) : (
                <Menu className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
              <nav className="flex flex-col gap-1">
                {publicLinks.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`rounded-lg px-3 py-3 font-body text-base transition-colors ${
                        active
                          ? "bg-muted font-medium text-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6">
                {isLoggedIn ? (
                  <>
                    <Link
                      href={dashboardRoute}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      <LayoutDashboard className="size-4" strokeWidth={2} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-3 text-sm font-medium text-foreground"
                    >
                      <LogOut className="size-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-xl border border-border px-5 py-3 text-center font-body text-sm font-medium text-foreground"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      Start free trial
                      <ArrowRight className="size-4" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}