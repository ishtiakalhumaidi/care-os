"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building,
  School,
  Users,
  Baby,
  Settings,
  UserCircle,
  UserPlus,
  Building2,
  X,
  Layers,
  CreditCard,
  UserCheck,
  Megaphone,
  BellRing,
  Images,
  Receipt,
  FileText,
  FileDown,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/common/logo";
import { useSidebar } from "../providers/SidebarContext";

type NavItem = { name: string; href: string; icon: React.ElementType };

const superAdminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Tenants", href: "/admin/dashboard/tenants-management", icon: Building2 },
  { name: "Plans", href: "/admin/dashboard/plans-management", icon: Layers },
];

const ownerNavigation: NavItem[] = [
  { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { name: "Broadcasts", href: "/owner/dashboard/broadcasts", icon: Megaphone },
  { name: "Branches", href: "/owner/dashboard/branches-management", icon: Building },
  { name: "Classrooms", href: "/owner/dashboard/classrooms-management", icon: School },
  { name: "Students", href: "/owner/dashboard/students-management", icon: Baby },
  { name: "Guardian Requests", href: "/owner/dashboard/guardian-requests", icon: UserCheck },
  { name: "Team", href: "/owner/dashboard/team-management", icon: UserPlus },
  { name: "Billing & Plan", href: "/owner/dashboard/billing", icon: CreditCard },
  { name: "Compliance & Audits", href: "/owner/dashboard/compliance", icon: FileDown },
  { name: "Settings", href: "/owner/settings", icon: Settings },
];

const centerAdminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/center-admin/dashboard", icon: LayoutDashboard },
  { name: "Broadcasts", href: "/center-admin/dashboard/broadcasts", icon: Megaphone },
  { name: "Classrooms", href: "/center-admin/dashboard/classrooms-management", icon: School },
  { name: "Students", href: "/center-admin/dashboard/students-management", icon: Baby },
  { name: "Guardian Requests", href: "/center-admin/dashboard/guardian-requests", icon: UserCheck },
  { name: "Team", href: "/center-admin/dashboard/team-management", icon: UserPlus },
  { name: "Invoicing", href: "/center-admin/dashboard/billing", icon: Receipt },
];

const teacherNavigation: NavItem[] = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { name: "My Classroom", href: "/teacher/dashboard/my-classroom", icon: School },
  { name: "Alerts", href: "/teacher/dashboard/alerts", icon: BellRing },
];

const guardianNavigation: NavItem[] = [
  { name: "Dashboard", href: "/guardian/dashboard", icon: LayoutDashboard },
  { name: "Alerts", href: "/guardian/dashboard/alerts", icon: BellRing },
  { name: "Gallery", href: "/guardian/dashboard/gallery", icon: Images },
  { name: "Tuition & Billing", href: "/guardian/dashboard/billing", icon: CreditCard },
  { name: "Documents", href: "/guardian/dashboard/documents", icon: FileText },
];

const sharedNavigation: NavItem[] = [
  { name: "My Profile", href: "/my-profile", icon: UserCircle },
];

const navigationByRole: Record<string, NavItem[]> = {
  SUPER_ADMIN: superAdminNavigation,
  TENANT_OWNER: ownerNavigation,
  CENTER_ADMIN: centerAdminNavigation,
  TEACHER: teacherNavigation,
  GUARDIAN: guardianNavigation,
};

export default function DashboardSidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const { isOpen, setIsOpen } = useSidebar();
  const primaryNav = navigationByRole[role || ""] || [];

  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isDashboardRoot = item.href.endsWith("/dashboard");
      const isRoot = isDashboardRoot || item.href === "/my-profile" || item.href === "/settings";
      const isActive = isRoot
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;

      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {isActive && (
            <motion.span
              layoutId="sidebar-active"
              className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
          <Icon
            className={cn(
              "size-5 shrink-0 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
            )}
            aria-hidden="true"
          />
          <span>{item.name}</span>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-dot"
              className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}
        </Link>
      );
    });
  };

  const SidebarContent = (
    <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-4">
      <nav className="flex-1 space-y-6 px-3">
        <div>
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Management
          </p>
          <div className="space-y-0.5">{renderNavItems(primaryNav)}</div>
        </div>

        <div>
          <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            System
          </p>
          <div className="space-y-0.5">{renderNavItems(sharedNavigation)}</div>
        </div>
      </nav>

      {/* Bottom user card */}
      <div className="mt-auto px-3 pt-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserCircle className="size-4" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-body text-xs font-medium text-foreground">
                {role?.toLowerCase().replace("_", " ") || "User"}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {role || "Guest"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-2xl lg:hidden flex flex-col"
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-border/60">
                <Link href="/" className="outline-none" onClick={() => setIsOpen(false)}>
                  <Logo />
                </Link>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
     <aside className="hidden h-full w-64 flex-col border-r border-border/60 bg-background lg:flex">
        <div className="flex h-16 shrink-0 items-center px-5 border-b border-border/60">
          <Link href="/" className="relative z-10 w-fit rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <Logo />
          </Link>
        </div>
        {SidebarContent}
      </aside>
    </>
  );
}