"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, School, Loader2, Users, MessageSquare } from "lucide-react";
import { getMyClassroomById, IClassroom } from "@/services/classroom.services";
import { startDirectMessage, startClassroomMessage } from "@/services/message.services";
import ClassroomAttendanceRoster from "./ClassroomAttendanceRoster";
import { useChat } from "@/components/providers/ChatContext";
import { toast } from "sonner";

export default function ClassroomAttendanceDetailView({
  classroomId,
  currentUserId,
}: {
  classroomId: string;
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();
  const { openDrawer } = useChat();

  const {
    data: classroom,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["my-classroom", classroomId],
    queryFn: () => getMyClassroomById(classroomId).then((res) => res.data as IClassroom),
  });

  // Mutation for Team Chat
  const { mutate: startTeamChat, isPending: isStartingTeam } = useMutation({
    mutationFn: () => startClassroomMessage(classroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      openDrawer();
    },
    onError: () => toast.error("Failed to open team chat"),
  });

  // Mutation for 1-on-1 Direct Message
  const { mutate: startDM, isPending: isStartingDM } = useMutation({
    mutationFn: (targetId: string) => startDirectMessage(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      openDrawer();
    },
    onError: () => toast.error("Failed to start direct message"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !classroom) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
        {(error as Error)?.message || "Failed to load classroom"}
      </div>
    );
  }

  const enrolledCount = classroom._count?.children ?? 0;

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/dashboard/my-classroom"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to classrooms
      </Link>

      {/* Header & Classroom Stats Card */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <School className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {classroom.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {classroom.ageGroup} · {classroom.branch?.name}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {enrolledCount} / {classroom.legalCapacity}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ratio limit</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              1 : {classroom.ratioLimit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teachers assigned</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {classroom._count?.teacherAssignments ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClassroomAttendanceRoster classroomId={classroomId}>
            {classroom.children || []}
          </ClassroomAttendanceRoster>
        </div>

        {/* Right Column: Other Assigned Teachers */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Users className="size-4" />
                Teachers in this room
              </h3>
              
              <button 
                onClick={() => startTeamChat()} 
                disabled={isStartingTeam}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isStartingTeam ? "Opening..." : "Message Team"}
              </button>
            </div>
            
            {!classroom.teacherAssignments || classroom.teacherAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other teachers assigned.</p>
            ) : (
              <ul className="divide-y divide-border">
                {classroom.teacherAssignments.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3 text-sm first:pt-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground">{a.teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{a.teacher.email}</p>
                    </div>
                    {/* The Direct Message Button */}
                    {a.teacher.id !== currentUserId && (
                      <button 
                        onClick={() => startDM(a.teacher.id)}
                        disabled={isStartingDM}
                        className="p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors disabled:opacity-50"
                        title="Send Direct Message"
                      >
                        <MessageSquare className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}