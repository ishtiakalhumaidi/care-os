/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { User, Baby, ChevronRight } from "lucide-react";
import ChildGallery from "./ChildGallery";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

/* ─── skeletons ─── */
function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function GallerySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <SkeletonPulse key={i} className="h-10 w-32 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonPulse key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* ─── child tab pill ─── */
function ChildTab({
  child,
  isActive,
  onClick,
}: {
  child: any;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={`group relative flex shrink-0 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
        isActive
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:bg-muted"
      }`}
    >
      <div
        className={`relative flex size-7 items-center justify-center overflow-hidden rounded-full ${
          isActive ? "bg-primary-foreground/20" : "bg-primary/10"
        }`}
      >
        {child.photoUrl ? (
          <Image
            src={child.photoUrl}
            alt={child.firstName}
            fill
            className="object-cover"
          />
        ) : (
          <User
            className={`size-3.5 ${isActive ? "text-primary-foreground" : "text-primary"}`}
          />
        )}
      </div>
      <span>{child.firstName}</span>
      {isActive && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute inset-0 rounded-full border-2 border-primary"
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        />
      )}
    </motion.button>
  );
}

/* ─── empty state ─── */
function EmptyProfileState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
      className="flex min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 size-20 rounded-full bg-muted/50 blur-xl" />
        <div className="relative flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Baby className="size-8" />
        </div>
      </div>
      <h3 className="mt-6 text-lg font-bold text-foreground">
        No children linked
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Your profile is not linked to any children yet. Contact your center administrator to get connected.
      </p>
    </motion.div>
  );
}

/* ─── main component ─── */
export default function GuardianGalleryView({
  childrenProfiles,
  currentUserRole,
}: {
  childrenProfiles: any[];
  currentUserRole: string;
}) {
  const [activeChildId, setActiveChildId] = useState<string | undefined>(
    childrenProfiles[0]?.child?.id
  );

  if (!childrenProfiles || childrenProfiles.length === 0) {
    return <EmptyProfileState />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Child Selector Tabs */}
      {childrenProfiles.length > 1 && (
        <motion.div
          variants={fadeInUp}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        >
          {childrenProfiles.map(({ child }: any) => (
            <ChildTab
              key={child.id}
              child={child}
              isActive={activeChildId === child.id}
              onClick={() => setActiveChildId(child.id)}
            />
          ))}
        </motion.div>
      )}

      {/* Active Child Header */}
      <AnimatePresence mode="wait">
        {activeChildId && (
          <motion.div
            key={activeChildId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ChevronRight className="size-4" />
            <span className="font-medium">
              Showing gallery for{" "}
              <span className="text-foreground">
                {childrenProfiles.find((p: any) => p.child?.id === activeChildId)?.child?.firstName}
              </span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render the Active Gallery */}
      <AnimatePresence mode="wait">
        {activeChildId && (
          <motion.div
            key={activeChildId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <ChildGallery
              childId={activeChildId}
              currentUserRole={currentUserRole}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}