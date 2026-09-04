"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Baby,
  Search,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
} from "lucide-react";

interface IUnassignedChild {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  dateOfBirth?: string;
}

export default function AddChildToClassroomModal({
  isOpen,
  onClose,
  unassignedChildren,
  isLoading,
  isSubmitting,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  unassignedChildren: IUnassignedChild[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSelect: (childId: string) => void;
}) {
  const [search, setSearch] = useState("");

  
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen && search !== "") {
      setSearch("");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return unassignedChildren;
    const q = search.toLowerCase();
    return unassignedChildren.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q)
    );
  }, [unassignedChildren, search]);

  const handleSelect = (childId: string) => {
    onSelect(childId);
    setSearch("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <UserPlus className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Add Child to Classroom
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select from unassigned enrolled children
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search children by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Count */}
              <p className="mt-3 text-xs text-muted-foreground">
                {filtered.length} child{filtered.length !== 1 ? "ren" : ""}{" "}
                available
              </p>

              {/* List */}
              <div className="mt-3 space-y-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Loading children...
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                    <ShieldAlert className="size-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {search.trim()
                        ? "No children match your search"
                        : "No unassigned children"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search.trim()
                        ? "Try a different search term"
                        : "All enrolled children are already in classrooms"}
                    </p>
                  </div>
                ) : (
                  filtered.map((child, idx) => (
                    <motion.button
                      key={child.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.03,
                        duration: 0.3,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSelect(child.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-muted disabled:opacity-50"
                    >
                      {child.photoUrl ? (
                        <img
                          src={child.photoUrl}
                          alt={child.firstName}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                          <Baby className="size-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {child.firstName} {child.lastName}
                        </p>
                        {child.dateOfBirth && (
                          <p className="text-xs text-muted-foreground">
                            Born{" "}
                            {new Date(child.dateOfBirth).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      ) : (
                        <CheckCircle2 className="size-4 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground" />
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}