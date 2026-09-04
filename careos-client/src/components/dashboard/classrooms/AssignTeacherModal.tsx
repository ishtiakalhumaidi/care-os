/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Loader2,
  X,
  UserPlus,
  Search,
  User,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { assignTeacher } from "@/services/classroom.services";
import { getUsers } from "@/services/user.services";
import { getApiErrorMessage } from "@/lib/errorUtils";

interface IUserSummary {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function AssignTeacherModal({
  isOpen,
  onClose,
  classroomId,
  branchId,
}: {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  branchId: string;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IUserSummary | null>(null);

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ["users", "branch", branchId, "TEACHER", "active"],
    queryFn: () => getUsers(`branchId=${branchId}&role=TEACHER&isActive=true&limit=100`),
    enabled: isOpen,
  });

  const teachers: IUserSummary[] = teachersData?.data || [];

  const filtered = search.trim()
    ? teachers.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.email.toLowerCase().includes(search.toLowerCase())
      )
    : teachers;

  const { mutate, isPending } = useMutation({
    mutationFn: () => assignTeacher(classroomId, selected!.id),
    onSuccess: () => {
      toast.success("Teacher assigned successfully", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      setSelected(null);
      setSearch("");
      onClose();
    },
    onError: (err: any) =>
      toast.error(getApiErrorMessage(err, "Failed to assign teacher.")),
  });

  /* ─── escape key ─── */
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleClose = useCallback(() => {
    if (isPending) return;
    setSelected(null);
    setSearch("");
    onClose();
  }, [isPending, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="flex w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <UserPlus className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Assign Teacher
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Select a staff member for this classroom
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isPending}
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
                  placeholder="Search teachers by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              {/* Selected pill */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
                      <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
                        <User className="size-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {selected.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selected.email}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelected(null)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* List */}
              <div className="mt-4 space-y-1">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Loading teachers...
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ShieldAlert className="size-8 text-muted-foreground/30" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">
                      {search.trim()
                        ? "No teachers match your search"
                        : "No available teachers"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/70">
                      {search.trim()
                        ? "Try a different search term"
                        : "All teachers may already be assigned"}
                    </p>
                  </div>
                ) : (
                  filtered.map((teacher, idx) => {
                    const isSelected = selected?.id === teacher.id;
                    return (
                      <motion.button
                        key={teacher.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: idx * 0.03,
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1] as const,
                        }}
                        type="button"
                        onClick={() => setSelected(teacher)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                          isSelected
                            ? "bg-primary/10 ring-1 ring-primary/20"
                            : "hover:bg-muted"
                        }`}
                      >
                        {teacher.image ? (
                          <img
                            src={teacher.image}
                            alt={teacher.name}
                            className="size-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                            <User className="size-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold ${
                              isSelected
                                ? "text-primary"
                                : "text-foreground"
                            }`}
                          >
                            {teacher.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {teacher.email}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="size-4 shrink-0 text-primary" />
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isPending}
                  className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => mutate()}
                  disabled={isPending || !selected}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      Assign Teacher
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}