"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Baby, Loader2 } from "lucide-react";
import { getMyChildById, IChild } from "@/services/child.services";
import { getChildAttendanceHistory } from "@/services/attendance.services";
import AttendanceStatusButton from "@/components/dashboard/shared/AttendanceStatusButton";
import ManagePickupsCard from "./ManagePickupsCard";
import GuardianAttendanceHistory from "./GuardianAttendanceHistory"; // <-- New Import

export default function GuardianChildDetailView({ childId }: { childId: string }) {
  const { data, isLoading, isError, error } = useQuery<IChild>({
    queryKey: ["my-child", childId],
    queryFn: () => getMyChildById(childId).then((res) => res.data),
  });

  const { data: attendanceHistory } = useQuery({
    queryKey: ["attendance", "history", childId],
    queryFn: () => getChildAttendanceHistory(childId).then((res) => res.data),
    enabled: !!data && data.status === "ENROLLED",
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        {(error as Error)?.message || "Failed to load child details"}
      </div>
    );
  }

  const latestRecord = attendanceHistory?.[0];
  const canPickup = data?.viewerLink?.canPickup ?? true;
  const isCheckedIn = Boolean(latestRecord && !latestRecord.checkOutTime);

  return (
    <div className="space-y-6">
      <Link
        href="/guardian/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          {data.photoUrl ? (
            <Image
              src={data.photoUrl}
              alt={data.firstName}
              width={72}
              height={72}
              className="size-18 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="flex size-18 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Baby className="size-8" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {data.firstName} {data.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">ID: {data.childCode}</p>
            {data.branch && (
              <p className="mt-1 text-xs text-muted-foreground">
                {data.branch.name}
                {data.classroom && ` · ${data.classroom.name}`}
              </p>
            )}
            {isCheckedIn && latestRecord && (
              <p className="mt-1 text-xs text-primary">
                Checked in since{" "}
                {new Date(latestRecord.checkInTime!).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {data.status === "ENROLLED" && (
          <div className="shrink-0">
            <AttendanceStatusButton
              childId={childId}
              status={latestRecord?.status}
              reason={latestRecord?.checkOutReason}
              canPickup={canPickup}
              invalidateKeys={[["attendance", "history", childId]]}
            />
          </div>
        )}
      </div>

      {/* Medical Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Medical notes</h3>
          <p className="mt-2 text-sm text-muted-foreground">{data.medicalNotes || "None on file"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Allergies</h3>
          <p className="mt-2 text-sm text-muted-foreground">{data.allergies || "None on file"}</p>
        </div>
      </div>

      {/* Dashboard Bottom Grid: Pickups on the left, History on the right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ManagePickupsCard 
          childId={childId} 
          guardians={data.guardians || []} 
          viewerLink={data.viewerLink} 
        />
        
        {/* The New Component Rendered Here */}
        {data.status === "ENROLLED" && (
          <GuardianAttendanceHistory childId={childId} />
        )}
      </div>
    </div>
  );
}