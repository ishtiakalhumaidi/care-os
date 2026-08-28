"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Bell, Menu, Search, User, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth.actions";
import { authClient } from "@/lib/auth-client";
import { getMe } from "@/services/user.services";
import { useSidebar } from "@/components/providers/SidebarContext";
import MessagingDrawer from "../chat/MessagingDrawer";

export default function DashboardNavbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { setIsOpen } = useSidebar();

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile Menu Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="-m-2.5 p-2.5 text-muted-foreground lg:hidden hover:text-foreground transition-colors"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between lg:justify-end">
        <form
          className="relative flex flex-1 lg:max-w-md"
          action="#"
          method="GET"
        >
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm focus:outline-none"
            placeholder="Search..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Real-time Messaging Drawer */}
          {user?.id && (
            <MessagingDrawer
              currentUserId={user.id}
              currentUserRole={user.role}
            />
          )}

          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="size-5" aria-hidden="true" />
          </button>

          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-border"
            aria-hidden="true"
          />

          <ModeToggle />

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
              className="flex items-center gap-2 rounded-full border border-border bg-muted/50 p-1.5 hover:bg-muted transition-colors focus:outline-none"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={28}
                  height={28}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="size-4" />
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 origin-top-right overflow-hidden rounded-xl border border-border bg-popover  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <button
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <LogOut className="size-4 text-muted-foreground transition-colors duration-200 group-hover:text-destructive-foreground" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
