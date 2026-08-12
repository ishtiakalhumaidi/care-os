"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { logoutAction } from "@/actions/auth.actions";
import { authClient } from "@/lib/auth-client";

interface NavClientProps {
  isLoggedIn: boolean;
  dashboardRoute: string;
}

export function NavClient({ isLoggedIn, dashboardRoute }: NavClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Failed to sign out from Better Auth:", error);
    } finally {
      await logoutAction();
    }
  };

  return (
    <header className="relative z-20 bg-background border-b border-border shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
         <Link
          href="/"
          className="relative z-10 w-fit rounded-lg outline-none  focus-visible:ring-2 focus-visible:ring-background/40"
        >
          <Logo />
        </Link>
        </div>

        {/* --- Desktop Navigation --- */}
        <div className="hidden md:flex md:items-center md:gap-6">
          <ModeToggle />
          
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardRoute}
                className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>

              {/* Animated Desktop Logout Button */}
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
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* --- Mobile Menu Toggle --- */}
        <div className="flex items-center gap-4 md:hidden">
          <ModeToggle />
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* --- Mobile Navigation Dropdown --- */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardRoute}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="size-4" />
                  Go to Dashboard
                </Link>
                {/* Standard Full-Width Mobile Logout Button */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}