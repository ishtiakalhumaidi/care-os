"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getMyClassroomById, IClassroom } from "@/services/classroom.services";
import { ArrowLeft, School, Baby, Loader2, Users } from "lucide-react";

export default function TeacherClassroomDetailView({
  classroomId,
}: {
  classroomId: string;
}) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-classroom", classroomId],
    queryFn: () =>
      getMyClassroomById(classroomId).then((res) => res.data as IClassroom),
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
        {(error as Error)?.message || "Failed to load classroom"}
      </div>
    );
  }

  const classroom = data;
  const enrolledCount = classroom._count?.children ?? 0;

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/dashboard/my-classroom"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to classrooms
      </Link>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <School className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{classroom.name}</h2>
            <p className="text-sm text-muted-foreground">
              {classroom.ageGroup} · {classroom.branch?.name}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="text-sm font-medium text-foreground">
              {enrolledCount} / {classroom.legalCapacity}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ratio limit</p>
            <p className="text-sm font-medium text-foreground">1 : {classroom.ratioLimit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teachers assigned</p>
            <p className="text-sm font-medium text-foreground">
              {classroom._count?.teacherAssignments ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
          <Users className="size-4" />
          Teachers in this room
        </h3>
        {!classroom.teacherAssignments || classroom.teacherAssignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other teachers assigned.</p>
        ) : (
          <ul className="divide-y divide-border">
            {classroom.teacherAssignments.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">{a.teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{a.teacher.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold text-foreground">Enrolled children</h3>
        {!classroom.children || classroom.children.length === 0 ? (
          <p className="text-sm text-muted-foreground">No children enrolled in this classroom yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {classroom.children.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3 text-sm">
                {c.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photoUrl} alt={c.firstName} className="size-9 rounded-full object-cover" />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Baby className="size-4" />
                  </div>
                )}
                <span className="font-medium text-foreground">
                  {c.firstName} {c.lastName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}