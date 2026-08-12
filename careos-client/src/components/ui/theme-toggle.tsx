"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const THEMES = [
  { mode: "light" as const, Icon: Sun, activeColor: "text-primary" },
  { mode: "dark" as const, Icon: Moon, activeColor: "text-primary" },
  { mode: "system" as const, Icon: Monitor, activeColor: "text-secondary" },
];

function subscribe() {
  return () => {};
}

function useMounted() {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!mounted) {
    return (
      <div className={className}>
        <div className="hidden h-12 w-[120px] animate-pulse rounded-full border border-border bg-muted/50 md:block" />
        <div className="block h-10 w-10 animate-pulse rounded-full border border-border bg-muted/50 md:hidden" />
      </div>
    );
  }

  const activeTheme = theme || "system";
  const activeIndex = THEMES.findIndex((t) => t.mode === activeTheme);
  const ActiveIcon = THEMES[Math.max(activeIndex, 0)].Icon;

  return (
    <div className={className}>
 
      <div className="relative hidden h-12 w-fit items-center rounded-full border border-border bg-muted/30 p-1 shadow-sm md:flex">
        <motion.div
          className="absolute z-0 rounded-full bg-background shadow-sm border border-border/50"
          layout
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          initial={false}
          style={{ top: 4, bottom: 4, width: 40, left: 4 }}
          animate={{ x: Math.max(activeIndex, 0) * 40 }}
        />

        {THEMES.map(({ mode, Icon, activeColor }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={cn(
              "relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTheme === mode
                ? activeColor 
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`${mode} mode`}
            aria-pressed={activeTheme === mode}
          >
            <Icon className="h-4 w-4" strokeWidth={activeTheme === mode ? 2.5 : 2} />
          </button>
        ))}
      </div>

    
      <div className="relative md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/30 text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Toggle theme menu"
        >
          <ActiveIcon className="h-4 w-4" strokeWidth={2} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 z-50 flex w-12 flex-col gap-1 rounded-full border border-border bg-background p-1 shadow-lg">
            {THEMES.map(({ mode, Icon, activeColor }) => (
              <button
                key={mode}
                onClick={() => {
                  setTheme(mode);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  activeTheme === mode
                    ? cn("bg-muted", activeColor) // <-- Applies text-secondary to the Monitor in mobile dropdown
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label={`${mode} mode`}
              >
                <Icon className="h-4 w-4" strokeWidth={activeTheme === mode ? 2.5 : 2} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}