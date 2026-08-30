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
} from "lucide-react";
import { toast } from "sonner";
import LinkGuardianModal from "./LinkGuardianModal";
import ApproveChildModal from "./ApproveChildModal";
import RejectChildModal from "./RejectChildModal";
import SuspendChildModal from "./SuspendChildModal";
import GuardianAttendanceHistory from "../guardian/GuardianAttendanceHistory";
import Image from "next/image";
import Link from "next/link";

export default function ChildDetailView({
  childId,
  basePath,
}: {
  childId: string;
  basePath: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isAssignClassroomOpen, setIsAssignClassroomOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState("");
  const { openDrawer } = useChat();

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
      toast.success("Guardian removed.");
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: reactivate, isPending: isReactivating } = useMutation({
    mutationFn: () => reactivateChild(childId),
    onSuccess: () => {
      toast.success("Child reactivated.");
      queryClient.invalidateQueries({ queryKey: ["children"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to reactivate."),
  });

  const { data: branchClassrooms } = useQuery({
    queryKey: ["classrooms", "for-assign", child?.branchId],
    queryFn: () => getClassrooms(`branchId=${child!.branchId}&limit=100`),
    enabled: isAssignClassroomOpen && !!child,
  });

  const { mutate: assign, isPending: isAssigning } = useMutation({
    mutationFn: () => assignClassroom(childId, selectedClassroomId),
    onSuccess: () => {
      toast.success("Classroom assigned.");
      queryClient.invalidateQueries({ queryKey: ["children", childId] });
      setIsAssignClassroomOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading || !child) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Loading student…</p>
      </div>
    );
  }

  const latestRecord = attendanceHistory?.[0];
  const isCheckedIn = Boolean(latestRecord && !latestRecord.checkOutTime);

  const statusStyles: Record<string, string> = {
    ENROLLED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    APPLIED: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    WAITLISTED: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    SUSPENDED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    REJECTED: "bg-destructive/10 text-destructive",
  };

  const initials = `${child.firstName?.[0] ?? ""}${child.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Back nav */}
      <button
        onClick={() => router.push(basePath)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to students
      </button>

      {/* Profile / Header Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          {/* Identity */}
          <div className="flex items-center gap-4">
            {child.photoUrl ? (
              <Image
                src={child.photoUrl}
                alt={child.firstName}
                className="size-16 shrink-0 rounded-full border border-border object-cover sm:size-20"
                width={80}
                height={80}
              />
            ) : (
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground sm:size-20">
                <Baby className="size-7 sm:size-8" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                  {child.firstName} {child.lastName}
                </h2>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusStyles[child.status] ?? "bg-muted text-foreground"
                  }`}
                >
                  {child.status}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                ID: {child.childCode}
              </p>
              <p className="text-sm text-muted-foreground">
                {child.branch?.name || "N/A"}
                {child.classroom && ` · ${child.classroom.name}`}
              </p>
              {isCheckedIn && latestRecord && (
                <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  <DoorOpen className="size-3" />
                  Checked in since{" "}
                  {new Date(latestRecord.checkInTime!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-5 py-3 sm:px-6">
          {child.status === "APPLIED" && (
            <>
              <button
                onClick={() => setIsApproveOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Check className="size-3.5" /> Approve
              </button>
              <button
                onClick={() => setIsRejectOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <XIcon className="size-3.5" /> Reject
              </button>
            </>
          )}

          {child.status === "ENROLLED" && (
            <button
              onClick={() => setIsSuspendOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 px-3 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
            >
              <PauseCircle className="size-3.5" /> Suspend
            </button>
          )}

          {child.status === "SUSPENDED" && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => reactivate()}
                disabled={isReactivating}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
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
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {child.classroomId ? "Reassign Classroom" : "Assign Classroom"}
                </button>
              )}

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openDrawer(child.id)}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <MessageSquare className="size-3.5" /> Message Guardians
                </button>
                <Link
                  href={`${basePath}/${childId}/gallery`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Images className="size-3.5" /> View Gallery
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Classroom assignment panel */}
        {isAssignClassroomOpen && (
          <div className="flex flex-col gap-2 border-t border-border px-5 py-3 sm:flex-row sm:items-center sm:px-6">
            <select
              value={selectedClassroomId}
              onChange={(e) => setSelectedClassroomId(e.target.value)}
              disabled={isAssigning}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-auto sm:flex-1"
            >
              <option value="">Select classroom</option>
              {(branchClassrooms?.data || []).map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c._count?.children ?? 0}/{c.legalCapacity})
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => assign()}
                disabled={isAssigning || !selectedClassroomId}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 sm:flex-none"
              >
                {isAssigning ? "Assigning…" : "Confirm"}
              </button>
              <button
                onClick={() => setIsAssignClassroomOpen(false)}
                className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Medical / allergy alert */}
        {(child.medicalNotes || child.allergies) && (
          <div className="border-t border-border bg-amber-500/5 px-5 py-4 sm:px-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="grid flex-1 grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {child.allergies && (
                  <div>
                    <p className="font-medium text-foreground">Allergies</p>
                    <p className="text-muted-foreground">{child.allergies}</p>
                  </div>
                )}
                {child.medicalNotes && (
                  <div>
                    <p className="font-medium text-foreground">Medical notes</p>
                    <p className="text-muted-foreground">{child.medicalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Linked Guardians */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Guardians</h3>
            <button
              onClick={() => setIsLinkOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <UserPlus className="size-3.5" /> Link
            </button>
          </div>

          {!child.guardians || child.guardians.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-10 text-center">
              <p className="text-sm text-muted-foreground">No guardians linked yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {child.guardians.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                      {g.user.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {g.user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {g.user.email} · {g.relationship}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {g.isPrimary && (
                      <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary sm:inline">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={() => removeGuardian(g.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${g.user.name}`}
                      title="Remove guardian"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Attendance Timeline */}
        {child.status === "ENROLLED" && (
          <div className="lg:col-span-3">
            <GuardianAttendanceHistory childId={child.id} />
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkGuardianModal isOpen={isLinkOpen} onClose={() => setIsLinkOpen(false)} child={child} />
      <ApproveChildModal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} child={child} />
      <RejectChildModal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} child={child} />
      <SuspendChildModal isOpen={isSuspendOpen} onClose={() => setIsSuspendOpen(false)} child={child} />
    </div>
  );
}