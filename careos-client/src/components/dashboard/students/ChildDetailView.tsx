/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChildById,
  IChild,
  assignClassroom,
  unlinkGuardian,
  reactivateChild,
} from "@/services/child.services";
import { getClassrooms } from "@/services/classroom.services";
import { getChildAttendanceHistory } from "@/services/attendance.services";
import { useChat } from "@/components/providers/ChatContext";
import {
  Baby,
  ArrowLeft,
  UserPlus,
  Check,
  X as XIcon,
  PauseCircle,
  PlayCircle,
  MessageSquare,
  Images,
  AlertTriangle,
  DoorOpen,
  Loader2,
  ShieldAlert,
  Calendar,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  Clock,
  TrendingUp,
  Users,
  Building2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import LinkGuardianModal from "./LinkGuardianModal";
import ApproveChildModal from "./ApproveChildModal";
import RejectChildModal from "./RejectChildModal";
import SuspendChildModal from "./SuspendChildModal";
import GuardianAttendanceHistory from "../guardian/GuardianAttendanceHistory";
import Image from "next/image";
import Link from "next/link";
import GuardianSplitManager from "./GuardianSplitManager";
import AdminDocumentManager from "./AdminDocumentManager";

const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function ChildDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <SkeletonPulse className="h-8 w-32" />
      <div className="space-y-4">
        <SkeletonPulse className="h-48 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <SkeletonPulse className="h-64 w-full rounded-2xl" />
            <SkeletonPulse className="h-48 w-full rounded-2xl" />
          </div>
          <div className="lg:col-span-3">
            <SkeletonPulse className="h-96 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function ChildDetailView({
  childId,
  basePath,
}: {
  childId: string;
  basePath: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openDrawer } = useChat();

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isAssignClassroomOpen, setIsAssignClassroomOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");

  const { data: child, isLoading } = useQuery({
    queryKey: ["children", childId],
    queryFn: () => getChildById(childId).then((res) => res.data as IChild),
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () => getChildAttendanceHistory(childId).then((res) => res.data),
    enabled: !!child && child.status === "ENROLLED",
    refetchInterval: 15000,
  });

  const { mutate: removeGuardian } = useMutation({
    mutationFn: (linkId: string) => unlinkGuardian(childId, linkId),
    onSuccess: () => {
      toast.success("Guardian removed");
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: () => reactivateChild(childId),
    onSuccess: () => {
      toast.success("Child reactivated");
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to reactivate"),
  });

  const { data: branchClassrooms } = useQuery({
    queryKey: ["classrooms", "for-assign", child?.branchId],
    queryFn: () => getClassrooms(`branchId=${child!.branchId}&limit=100`),
    enabled: isAssignClassroomOpen && !!child,
  });

  const { mutate: assign, isPending: isAssigning } = useMutation({
    mutationFn: () => assignClassroom(childId, selectedClassroomId),
    onSuccess: () => {
      toast.success("Classroom assigned");
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
      setIsAssignClassroomOpen(false);
      setSelectedClassroomId("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading || !child) {
    return <ChildDetailSkeleton />;
  }

  const latestRecord = attendanceHistory?.[0];
  const isCheckedIn = Boolean(latestRecord && !latestRecord.checkOutTime);

  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: any; label: string }
  > = {
    ENROLLED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-700 dark:text-emerald-400",
      icon: Check,
      label: "Enrolled",
    },
    APPLIED: {
      bg: "bg-blue-500/10",
      text: "text-blue-700 dark:text-blue-400",
      icon: Calendar,
      label: "Applied",
    },
    WAITLISTED: {
      bg: "bg-violet-500/10",
      text: "text-violet-700 dark:text-violet-400",
      icon: Clock,
      label: "Waitlisted",
    },
    SUSPENDED: {
      bg: "bg-amber-500/10",
      text: "text-amber-700 dark:text-amber-400",
      icon: PauseCircle,
      label: "Suspended",
    },
    REJECTED: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      icon: XIcon,
      label: "Rejected",
    },
    GRADUATED: {
      bg: "bg-sky-500/10",
      text: "text-sky-700 dark:text-sky-400",
      icon: GraduationCap,
      label: "Graduated",
    },
    ARCHIVED: {
      bg: "bg-slate-500/10",
      text: "text-slate-700 dark:text-slate-400",
      icon: Circle,
      label: "Archived",
    },
  };

  const status = statusConfig[child.status] ?? {
    bg: "bg-muted",
    text: "text-foreground",
    icon: Circle,
    label: child.status,
  };
  const StatusIcon = status.icon;

  const initials = `${child.firstName?.[0] ?? ""}${
    child.lastName?.[0] ?? ""
  }`.toUpperCase();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 lg:px-8"
    >
      {/* Back nav */}
      <motion.div variants={fadeInUp} custom={0}>
        <button
          onClick={() => router.push(basePath)}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to students
        </button>
      </motion.div>

      {/* Profile / Header Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-8">
          {/* Identity */}
          <div className="flex items-start gap-4 sm:gap-5">
            {child.photoUrl ? (
              <Image
                src={child.photoUrl}
                alt={child.firstName}
                className="size-16 shrink-0 rounded-full border-2 border-border object-cover shadow-sm sm:size-20"
                width={80}
                height={80}
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-border bg-muted text-muted-foreground shadow-sm sm:size-20">
                <Baby className="size-8" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  {child.firstName} {child.lastName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
                >
                  <StatusIcon className="size-3.5" />
                  {status.label}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                ID: {child.childCode}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <InfoChip
                  icon={Building2}
                  label="Branch"
                  value={child.branch?.name}
                />
                <InfoChip
                  icon={GraduationCap}
                  label="Classroom"
                  value={child.classroom?.name}
                />
                {child.dateOfBirth && (
                  <InfoChip
                    icon={Calendar}
                    label="DOB"
                    value={format(parseISO(child.dateOfBirth), "MMM d, yyyy")}
                  />
                )}
              </div>

              {isCheckedIn && latestRecord && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  <DoorOpen className="size-3.5" />
                  Checked in since{" "}
                  {new Date(latestRecord.checkInTime!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1 rounded-xl border border-border bg-background px-5 py-3 text-center shadow-sm sm:px-6 sm:py-4">
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                {child.guardians?.length ?? 0}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Guardians
              </p>
            </div>
            <div className="flex-1 rounded-xl border border-border bg-background px-5 py-3 text-center shadow-sm sm:px-6 sm:py-4">
              <p className="text-xl font-bold text-foreground sm:text-2xl">
                {attendanceHistory?.length ?? 0}
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
                Visits (30d)
              </p>
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-5 py-3 sm:px-8">
          {child.status === "APPLIED" && (
            <>
              <button
                onClick={() => setIsApproveOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <Check className="size-3.5" /> Approve
              </button>
              <button
                onClick={() => setIsRejectOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                <XIcon className="size-3.5" /> Reject
              </button>
            </>
          )}

          {child.status === "ENROLLED" && (
            <button
              onClick={() => setIsSuspendOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 px-4 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
            >
              <PauseCircle className="size-3.5" /> Suspend
            </button>
          )}

          {child.status === "SUSPENDED" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => reactivate()}
                disabled={isReactivating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
              >
                <PlayCircle className="size-3.5" />
                {isReactivating ? "Reactivating…" : "Reactivate"}
              </button>
              {child.suspensionReason && (
                <span className="text-xs text-muted-foreground">
                  Reason: {child.suspensionReason}
                </span>
              )}
            </div>
          )}

          {(child.status === "ENROLLED" || child.status === "WAITLISTED") && (
            <>
              {!isAssignClassroomOpen && (
                <button
                  onClick={() => setIsAssignClassroomOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {child.classroomId
                    ? "Reassign Classroom"
                    : "Assign Classroom"}
                </button>
              )}

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openDrawer(child.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  <MessageSquare className="size-3.5" /> Message Guardians
                </button>
                <Link
                  href={`${basePath}/${childId}/gallery`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Images className="size-3.5" /> View Gallery
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Classroom assignment panel */}
        <AnimatePresence>
          {isAssignClassroomOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="flex flex-col gap-3 bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:px-8">
                <div className="relative flex-1">
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    disabled={isAssigning}
                    className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
                  >
                    <option value="">Select classroom</option>
                    {(branchClassrooms?.data || []).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c._count?.children ?? 0}/
                        {c.legalCapacity ?? "∞"})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="size-4 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => assign()}
                    disabled={isAssigning || !selectedClassroomId}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 sm:flex-none"
                  >
                    {isAssigning ? (
                      <Loader2 className="mx-auto size-4 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsAssignClassroomOpen(false);
                      setSelectedClassroomId("");
                    }}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted sm:flex-none"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Medical / allergy alert */}
        {(child.medicalNotes || child.allergies) && (
          <div className="border-t border-border bg-amber-500/[0.04] px-5 py-4 sm:px-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="grid flex-1 grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {child.allergies && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Allergies
                    </p>
                    <p className="mt-1 text-amber-800/80 dark:text-amber-400/80">
                      {child.allergies}
                    </p>
                  </div>
                )}
                {child.medicalNotes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                      Medical Notes
                    </p>
                    <p className="mt-1 text-amber-800/80 dark:text-amber-400/80">
                      {child.medicalNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Guardians */}
          <motion.div
            variants={fadeInUp}
            custom={2}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
          >
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Guardians
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {child.guardians?.length ?? 0} linked
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLinkOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <UserPlus className="size-3.5" /> Link
              </button>
            </div>

            {!child.guardians || child.guardians.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
                <Users className="size-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No guardians linked yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Add parents or authorized pickups
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {child.guardians.map((g: any, idx: number) => (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: idx * 0.04,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {g.user.image ? (
                        <img
                          src={g.user.image}
                          alt={g.user.name}
                          className="size-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {g.user.name?.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {g.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {g.user.email}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium text-muted-foreground/70">
                          {g.relationship}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {g.isPrimary && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Primary
                        </span>
                      )}
                      <button
                        onClick={() => removeGuardian(g.id)}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        title="Remove guardian"
                      >
                        <XIcon className="size-3.5" />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Split-Custody Manager */}
          {child.guardians && child.guardians.length > 0 && (
            <GuardianSplitManager
              key={`splits-${child.id}`}
              childId={child.id}
              guardians={child.guardians}
            />
          )}

          {/* Document Manager */}
          <AdminDocumentManager childId={child.id} />
        </div>

        {/* Right Column: Attendance Timeline */}
        {child.status === "ENROLLED" && (
          <motion.div variants={fadeInUp} custom={3} className="lg:col-span-6">
            <GuardianAttendanceHistory childId={child.id} />
          </motion.div>
        )}
      </div>

      {/* Modals — conditionally rendered so they remount fresh */}
      <AnimatePresence>
        {isLinkOpen && (
          <LinkGuardianModal
            isOpen={isLinkOpen}
            onClose={() => setIsLinkOpen(false)}
            child={child}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isApproveOpen && (
          <ApproveChildModal
            isOpen={isApproveOpen}
            onClose={() => setIsApproveOpen(false)}
            child={child}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isRejectOpen && (
          <RejectChildModal
            isOpen={isRejectOpen}
            onClose={() => setIsRejectOpen(false)}
            child={child}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSuspendOpen && (
          <SuspendChildModal
            isOpen={isSuspendOpen}
            onClose={() => setIsSuspendOpen(false)}
            child={child}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}