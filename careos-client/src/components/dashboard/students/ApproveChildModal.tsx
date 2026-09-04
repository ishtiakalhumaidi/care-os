/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  X,
  CheckCircle2,
  UserCheck,
  Search,
  ShieldAlert,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { approveChild, IChild } from "@/services/child.services";
import { getClassrooms } from "@/services/classroom.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

interface ApproveChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: IChild;
}

export default function ApproveChildModal({
  isOpen,
  onClose,
  child,
}: ApproveChildModalProps) {
  const queryClient = useQueryClient();
  const [classroomId, setClassroomId] = useState("");
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: classroomsData, isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ["classrooms", "for-approval", child.branchId],
    queryFn: () => getClassrooms(`branchId=${child.branchId}&limit=100`),
    enabled: isOpen,
  });

  const classrooms = classroomsData?.data || [];
  const filtered = search.trim()
    ? classrooms.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : classrooms;

  const selected = classrooms.find((c: any) => c.id === classroomId);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      approveChild(child.id, classroomId ? { classroomId } : {}),
    onSuccess: () => {
      toast.success(`${child.firstName} ${child.lastName} enrolled`, {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["children"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, "Failed to approve application."));
    },
  });

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
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
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
              <UserCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Approve Application
              </h2>
              <p className="text-xs text-muted-foreground">
                {child.firstName} {child.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">
            Enroll <strong>{child.firstName}</strong> at{" "}
            {child.branch?.name || "this branch"}.
          </p>

          {/* Custom searchable dropdown */}
          <div className="mt-5" ref={dropdownRef}>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <GraduationCap className="size-3.5" />
              Assign Classroom{" "}
              <span className="font-normal normal-case text-muted-foreground/60">
                (optional)
              </span>
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={isPending || isLoadingClassrooms}
              className={`flex w-full items-center justify-between rounded-xl border bg-background px-4 py-2.5 text-left text-sm transition-all ${
                dropdownOpen
                  ? "border-primary ring-1 ring-primary/20"
                  : "border-input hover:border-muted-foreground/30"
              }`}
            >
              {isLoadingClassrooms ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading...
                </span>
              ) : selected ? (
                <span className="font-medium text-foreground">
                  {selected.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Assign later</span>
              )}
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
                  className="absolute z-50 mt-1.5 w-[calc(100%-2.5rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:w-[26rem]"
                >
                  <div className="border-b border-border p-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Search classrooms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg bg-muted py-2 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {filtered.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        {search.trim()
                          ? "No classrooms match"
                          : "No classrooms available"}
                      </div>
                    ) : (
                      filtered.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setClassroomId(c.id);
                            setDropdownOpen(false);
                            setSearch("");
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                            classroomId === c.id
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="font-medium">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {c._count?.children ?? 0}/{c.legalCapacity ?? "∞"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isLoadingClassrooms && classrooms.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                No classrooms exist yet — assign one later.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-sm px-5 py-4 sm:px-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => mutate()}
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Approve & Enroll
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}