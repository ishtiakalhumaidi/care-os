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
import { getChildAttendanceHistory } from "@/services/attendance.services"; // <-- New import
import {
  Baby,
  ArrowLeft,
  UserPlus,
  Check,
  X as XIcon,
  PauseCircle,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";
import LinkGuardianModal from "./LinkGuardianModal";
import ApproveChildModal from "./ApproveChildModal";
import RejectChildModal from "./RejectChildModal";
import SuspendChildModal from "./SuspendChildModal";
import GuardianAttendanceHistory from "../guardian/GuardianAttendanceHistory"; // <-- Reusing this component directly!
import Image from "next/image";

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

  const { data: child, isLoading } = useQuery({
    queryKey: ["children", childId],
    queryFn: () => getChildById(childId).then((res) => res.data as IChild),
  });

  // Pull history for the status header
  const { data: attendanceHistory } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () => getChildAttendanceHistory(childId).then((res) => res.data),
    enabled: !!child && child.status === "ENROLLED",
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
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const latestRecord = attendanceHistory?.[0];
  const isCheckedIn = Boolean(latestRecord && !latestRecord.checkOutTime);

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(basePath)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to students
      </button>

      {/* Header Profile Card */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {child.photoUrl ? (
            <Image
              src={child.photoUrl}
              alt={child.firstName}
              className="size-20 rounded-full object-cover border border-border"
              width={80}
              height={80}
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Baby className="size-8" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {child.firstName} {child.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">
              ID: {child.childCode}
            </p>
            <p className="text-sm text-muted-foreground">
              {child.branch?.name || "N/A"}
              {child.classroom && ` · ${child.classroom.name}`}
            </p>
            {isCheckedIn && latestRecord && (
              <p className="mt-1 text-xs font-medium text-primary">
                Checked in since{" "}
                {new Date(latestRecord.checkInTime!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {child.status}
          </span>
          {child.status === "APPLIED" && (
            <>
              <button
                onClick={() => setIsApproveOpen(true)}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
              >
                <Check className="size-3.5" /> Approve
              </button>
              <button
                onClick={() => setIsRejectOpen(true)}
                className="flex items-center gap-1 rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
              >
                <XIcon className="size-3.5" /> Reject
              </button>
            </>
          )}
          {child.status === "ENROLLED" && (
            <button
              onClick={() => setIsSuspendOpen(true)}
              className="flex items-center gap-1 rounded-md bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            >
              <PauseCircle className="size-3.5" /> Suspend
            </button>
          )}
          {(child.status === "ENROLLED" || child.status === "WAITLISTED") && (
            <div className="flex items-center">
              {isAssignClassroomOpen ? (
                <div className="flex items-center gap-2 ml-2">
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    disabled={isAssigning}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs"
                  >
                    <option value="">Select classroom</option>
                    {(branchClassrooms?.data || []).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c._count?.children ?? 0}/{c.legalCapacity})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => assign()}
                    disabled={isAssigning || !selectedClassroomId}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {isAssigning ? "Assigning..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setIsAssignClassroomOpen(false)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAssignClassroomOpen(true)}
                  className="flex items-center gap-1 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                >
                  {child.classroomId
                    ? "Reassign Classroom"
                    : "Assign Classroom"}
                </button>
              )}
            </div>
          )}
          {child.status === "SUSPENDED" && (
            <>
              <span className="text-xs text-muted-foreground mr-2">
                {child.suspensionReason}
              </span>
              <button
                onClick={() => reactivate()}
                disabled={isReactivating}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
              >
                <PlayCircle className="size-3.5" /> Reactivate
              </button>
            </>
          )}
        </div>

        {(child.medicalNotes || child.allergies) && (
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-md">
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
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Linked Guardians */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Guardians
            </h3>
            <button
              onClick={() => setIsLinkOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="size-3.5" /> Link Guardian
            </button>
          </div>
          {!child.guardians || child.guardians.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No guardians linked yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {child.guardians.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{g.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {g.user.email} · {g.relationship}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {g.isPrimary && (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={() => removeGuardian(g.id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Display Attendance Timeline if Enrolled */}
        {child.status === "ENROLLED" && (
          <GuardianAttendanceHistory childId={child.id} />
        )}
      </div>

      {/* Modals */}
      <LinkGuardianModal
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        child={child}
      />
      <ApproveChildModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        child={child}
      />
      <RejectChildModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        child={child}
      />
      <SuspendChildModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        child={child}
      />
    </div>
  );
}
