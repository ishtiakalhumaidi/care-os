"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Images ,
  Receipt
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
  { name: "Settings", href: "/owner/settings", icon: Settings },
];

const centerAdminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/center-admin/dashboard", icon: LayoutDashboard },
  { name: "Broadcasts", href: "/center-admin/dashboard/broadcasts", icon: Megaphone },
  { name: "Classrooms", href: "/center-admin/dashboard/classrooms-management", icon: School },
  { name: "Students", href: "/center-admin/dashboard/students-management", icon: Baby },
  { name: "Guardian Requests", href: "/center-admin/dashboard/guardian-requests", icon: UserCheck },
  { name: "Team", href: "/center-admin/dashboard/team-management", icon: UserPlus },
  { name: "Invoicing", href: "/admin/dashboard/billing", icon: Receipt },
];

const teacherNavigation: NavItem[] = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { name: "My Classroom", href: "/teacher/dashboard/my-classroom", icon: School },
  { name: "Alerts", href: "/teacher/dashboard/alerts", icon: BellRing }
];

const guardianNavigation: NavItem[] = [
  { name: "Dashboard", href: "/guardian/dashboard", icon: LayoutDashboard },
  { name: "Alerts", href: "/guardian/dashboard/alerts", icon: BellRing },
  { name: "Gallery", href: "/guardian/dashboard/gallery", icon: Images }, 
  { name: "Tuition & Billing", href: "/guardian/dashboard/billing", icon: CreditCard },
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
      const isActive = isRoot ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
      const Icon = item.icon;

      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          {item.name}
        </Link>
      );
    });
  };

  const SidebarContent = (
    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4 custom-scrollbar">
      <nav className="flex-1 space-y-1 px-4">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
            Management
          </p>
          {renderNavItems(primaryNav)}
        </div>

        <div className="mt-8">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
            System
          </p>
          {renderNavItems(sharedNavigation)}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <aside className="fixed inset-y-0 left-0 w-64 bg-background flex flex-col shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border">
              <Link href="/" className="outline-none" onClick={() => setIsOpen(false)}>
                <Logo />
              </Link>
              <button type="button" className="-m-2 p-2 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                <span className="sr-only">Close sidebar</span>
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}

      <aside className="hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
          <Link href="/" className="relative z-10 w-fit rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-background/40">
            <Logo />
          </Link>
        </div>
        {SidebarContent}
      </aside>
    </>
  );
}