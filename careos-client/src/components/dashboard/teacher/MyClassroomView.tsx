/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCurrentAttendance } from "@/services/attendance.services";
import { getMyClassrooms, IClassroom } from "@/services/classroom.services";
import { Loader2, School, ChevronRight, Users } from "lucide-react";

export default function MyClassroomView() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-classrooms"],
    queryFn: getMyClassrooms,
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", "current"],
    queryFn: () => getCurrentAttendance(""),
  });

  if (isLoading) {
    return <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />;
  }

  const classrooms: IClassroom[] = data?.data || [];

  const presentCountByClassroom = new Map<string, number>();
  (attendanceData?.data || []).forEach((record: any) => {
    const classroomId = record.child?.classroomId;
    if (!classroomId) return;
    presentCountByClassroom.set(classroomId, (presentCountByClassroom.get(classroomId) || 0) + 1);
  });

  if (classrooms.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          You haven&apos;t been assigned to a classroom yet. Contact your center admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classrooms.map((classroom) => {
        const enrolledCount = classroom._count?.children ?? 0;
        const presentCount = presentCountByClassroom.get(classroom.id) ?? 0;

        return (
          <Link
            key={classroom.id}
            href={`/teacher/dashboard/my-classroom/${classroom.id}`}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <School className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{classroom.name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {classroom.ageGroup} · {classroom.branch?.name} · {enrolledCount}/
                  {classroom.legalCapacity} children · Ratio 1:{classroom.ratioLimit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Users className="size-3.5" />
                {presentCount} present
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}