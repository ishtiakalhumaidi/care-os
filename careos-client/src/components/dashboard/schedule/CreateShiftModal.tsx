/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Loader2,
  Search,
  User,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  ChevronDown,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { createShift } from "@/services/schedule.services";
import { getUsers } from "@/services/user.services";
import { getClassrooms } from "@/services/classroom.services";

/* ─── types ─── */
interface IFormData {
  userId: string;
  classroomId: string;
  date: string;
  startTime: string;
  endTime: string;
  isSubstitute: boolean;
}

interface IFieldError {
  field: string;
  message: string;
}

/* ─── custom searchable dropdown ─── */
function SearchableSelect({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  isLoading,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
}: {
  label: string;
  icon: any;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string; subLabel?: string }[];
  isLoading: boolean;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.id === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.subLabel?.toLowerCase().includes(q)
    );
  }, [options, search]);

  return (
    <div className="relative" ref={ref}>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </label>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled || isLoading}
        className={`flex w-full items-center justify-between rounded-xl border bg-background px-3 py-2.5 text-left text-sm transition-all ${
          open
            ? "border-primary ring-1 ring-primary/20"
            : "border-input hover:border-muted-foreground/30"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading...
          </span>
        ) : selected ? (
          <span className="truncate">
            <span className="font-medium text-foreground">{selected.label}</span>
            {selected.subLabel && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                ({selected.subLabel})
              </span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] as const }}
            className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl"
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg bg-muted py-2 pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <div className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {emptyText}
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                      value === opt.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="font-medium">{opt.label}</span>
                    {opt.subLabel && (
                      <span className="text-[10px] text-muted-foreground">
                        {opt.subLabel}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── time input with icon ─── */
function TimeField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Clock className="size-3.5" />
        {label}
      </label>
      <div className="relative">
        <input
          type="time"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none transition-all ${
            error
              ? "border-destructive ring-1 ring-destructive/20 focus:border-destructive"
              : "border-input hover:border-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20"
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-destructive">
          <AlertCircle className="size-3" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── main modal ─── */
export default function CreateShiftModal({
  branchId,
  onClose,
}: {
  branchId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<IFormData>({
    userId: "",
    classroomId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "16:00",
    isSubstitute: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  /* ─── data fetching ─── */
  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["users", "branch", branchId, "TEACHER"],
    queryFn: () => getUsers(`branchId=${branchId}&role=TEACHER&isActive=true`),
  });

  const { data: classroomsData, isLoading: isLoadingClassrooms } = useQuery({
    queryKey: ["classrooms", "branch", branchId],
    queryFn: () => getClassrooms(`branchId=${branchId}`),
  });

  const teachers = teachersData?.data || [];
  const classrooms = classroomsData?.data || [];

  const teacherOptions = useMemo(
    () =>
      teachers.map((t: any) => ({
        id: t.id,
        label: t.name,
        subLabel: t.email,
      })),
    [teachers]
  );

  const classroomOptions = useMemo(
    () =>
      classrooms.map((c: any) => ({
        id: c.id,
        label: c.name,
        subLabel: c.ageGroup,
      })),
    [classrooms]
  );

  /* ─── validation (derived value, no effect needed) ─── */
  const errors = useMemo((): IFieldError[] => {
    const errs: IFieldError[] = [];
    if (!formData.userId) errs.push({ field: "userId", message: "Select a teacher" });
    if (!formData.classroomId) errs.push({ field: "classroomId", message: "Select a classroom" });
    if (!formData.date) errs.push({ field: "date", message: "Select a date" });

    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      if (end <= start) {
        errs.push({ field: "endTime", message: "End time must be after start time" });
      }
      // Max 16 hour shift
      const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (diffHours > 16) {
        errs.push({ field: "endTime", message: "Shift cannot exceed 16 hours" });
      }
    }
    return errs;
  }, [formData]);

  /* ─── mutation ─── */
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) => createShift(payload),
    onSuccess: () => {
      toast.success("Shift assigned successfully", {
        icon: <CheckCircle2 className="size-4 text-emerald-500" />,
      });
      queryClient.invalidateQueries({ queryKey: ["schedules", "weekly", branchId] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to assign shift");
    },
  });

  /* ─── submit ─── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      userId: true,
      classroomId: true,
      date: true,
      startTime: true,
      endTime: true,
    });

    if (errors.length > 0) {
      toast.error(errors[0].message);
      return;
    }

    const startIso = new Date(`${formData.date}T${formData.startTime}:00`).toISOString();
    const endIso = new Date(`${formData.date}T${formData.endTime}:00`).toISOString();

    mutate({
      userId: formData.userId,
      classroomId: formData.classroomId,
      startTime: startIso,
      endTime: endIso,
      isSubstitute: formData.isSubstitute,
    });
  };

  /* ─── escape key ─── */
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* ─── derived preview ─── */
  const selectedTeacher = teachers.find((t: any) => t.id === formData.userId);
  const selectedClassroom = classrooms.find((c: any) => c.id === formData.classroomId);

  const shiftDuration = useMemo(() => {
    if (!formData.startTime || !formData.endTime || !formData.date) return null;
    const start = new Date(`${formData.date}T${formData.startTime}`);
    const end = new Date(`${formData.date}T${formData.endTime}`);
    if (end <= start) return null;
    const mins = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h${m > 0 ? ` ${m}m` : ""}`;
  }, [formData]);

  const getFieldError = (field: string) =>
    touched[field] ? errors.find((e) => e.field === field)?.message : undefined;

  const isFormValid = errors.length === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center p-0 sm:p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground sm:text-lg">
                  Assign Shift
                </h2>
                <p className="text-xs text-muted-foreground">
                  Schedule a staff member to a classroom
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            <form
              id="shift-form"
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              {/* ─── Staff & Location ─── */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Assignment Details
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SearchableSelect
                    label="Teacher"
                    icon={User}
                    value={formData.userId}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, userId: val }))
                    }
                    options={teacherOptions}
                    isLoading={isLoadingTeachers}
                    placeholder="Select teacher..."
                    searchPlaceholder="Search teachers..."
                    emptyText="No teachers found"
                    disabled={isPending}
                  />

                  <SearchableSelect
                    label="Classroom"
                    icon={MapPin}
                    value={formData.classroomId}
                    onChange={(val) =>
                      setFormData((prev) => ({ ...prev, classroomId: val }))
                    }
                    options={classroomOptions}
                    isLoading={isLoadingClassrooms}
                    placeholder="Select classroom..."
                    searchPlaceholder="Search classrooms..."
                    emptyText="No classrooms found"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* ─── Timing ─── */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Timing
                </h3>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Calendar className="size-3.5" />
                    Date
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all hover:border-muted-foreground/30 focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TimeField
                    label="Start"
                    value={formData.startTime}
                    onChange={(v) =>
                      setFormData((prev) => ({ ...prev, startTime: v }))
                    }
                    error={getFieldError("endTime") && formData.endTime <= formData.startTime ? undefined : getFieldError("startTime")}
                  />
                  <TimeField
                    label="End"
                    value={formData.endTime}
                    onChange={(v) =>
                      setFormData((prev) => ({ ...prev, endTime: v }))
                    }
                    error={getFieldError("endTime")}
                  />
                </div>

                {/* Duration chip */}
                {shiftDuration && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2"
                  >
                    <Clock className="size-3.5 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      Duration: {shiftDuration}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* ─── Options ─── */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Options
                </h3>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    formData.isSubstitute
                      ? "border-amber-200 bg-amber-50/50 dark:border-amber-900/20 dark:bg-amber-950/20"
                      : "border-border bg-background hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-8 items-center justify-center rounded-lg ${
                        formData.isSubstitute
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Substitute Shift
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mark if covering for another staff member
                      </p>
                    </div>
                  </div>
                  <div
                    className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isSubstitute ? "bg-amber-500" : "bg-muted"
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isSubstitute: !prev.isSubstitute,
                      }))
                    }
                  >
                    <span
                      className={`absolute size-5 rounded-full bg-white shadow-sm transition-transform ${
                        formData.isSubstitute
                          ? "translate-x-5.5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              </div>

              {/* ─── Preview Card ─── */}
              {(selectedTeacher || selectedClassroom) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-xl border border-border bg-muted/30"
                >
                  <div className="border-b border-border bg-muted/50 px-4 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      Shift Preview
                    </p>
                  </div>
                  <div className="space-y-2 p-4">
                    {selectedTeacher && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Staff:</span>
                        <span className="font-semibold text-foreground">
                          {selectedTeacher.name}
                        </span>
                      </div>
                    )}
                    {selectedClassroom && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Room:</span>
                        <span className="font-semibold text-foreground">
                          {selectedClassroom.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">When:</span>
                      <span className="font-semibold text-foreground">
                        {new Date(formData.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                        , {formData.startTime} – {formData.endTime}
                      </span>
                    </div>
                    {shiftDuration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Length:</span>
                        <span className="font-semibold text-primary">
                          {shiftDuration}
                        </span>
                      </div>
                    )}
                    {formData.isSubstitute && (
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        <Sparkles className="size-3" />
                        Substitute
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ─── Validation summary ─── */}
              {Object.keys(touched).length > 0 && !isFormValid && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Please fix the errors above before saving.
                  </span>
                </div>
              )}
            </form>
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
                type="submit"
                form="shift-form"
                disabled={isPending || (!isFormValid && Object.keys(touched).length > 0)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-primary"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Save Shift
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}