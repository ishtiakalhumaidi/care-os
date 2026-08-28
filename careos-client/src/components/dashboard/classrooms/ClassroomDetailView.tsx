/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, School, UserPlus, Baby, Plus, CheckCircle2, Circle, History, 
  Activity, Utensils, Moon, MessageSquare, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getClassroomById, unassignTeacher, IClassroom } from "@/services/classroom.services";
import { assignClassroom, getChildren, unassignClassroom } from "@/services/child.services";
import { getCurrentAttendance } from "@/services/attendance.services";
import { getClassroomDailyMatrix } from "@/services/timeline.services";
import { startDirectMessage, startClassroomMessage } from "@/services/message.services";
import AssignTeacherModal from "./AssignTeacherModal";
import AddChildToClassroomModal from "./AddChildToClassroomModal";
import TeacherChildHistoryModal from "../teacher/TeacherChildHistoryModal";
import TeacherTimelineLoggerModal from "../timeline/TeacherTimelineLoggerModal";
import { useChat } from "@/components/providers/ChatContext";

export default function ClassroomDetailView({
  classroomId,
  basePath,
  studentsBasePath,
  currentUserId,
}: {
  classroomId: string;
  basePath: string;
  studentsBasePath: string;
  currentUserId?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { openDrawer } = useChat();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [viewingHistoryFor, setViewingHistoryFor] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [loggingActivityFor, setLoggingActivityFor] = useState<{ id: string; firstName: string; lastName: string } | null>(null);

  const { data: classroom, isLoading } = useQuery({
    queryKey: ["classrooms", classroomId],
    queryFn: () => getClassroomById(classroomId).then((res) => res.data as IClassroom),
  });

  const { data: attendanceData } = useQuery({
    queryKey: ["attendance", "current", classroomId],
    queryFn: () => getCurrentAttendance(`classroomId=${classroomId}`),
    enabled: !!classroom,
    refetchInterval: 15000,
  });

  const { data: matrixData } = useQuery({
    queryKey: ["timeline", "matrix", classroomId, "today"],
    queryFn: () => getClassroomDailyMatrix(classroomId).then((res) => res.data),
    enabled: !!classroom,
    refetchInterval: 60000,
  });

  // Messaging Mutations
  const { mutate: startTeamChat, isPending: isStartingTeam } = useMutation({
    mutationFn: () => startClassroomMessage(classroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      openDrawer();
    },
    onError: () => toast.error("Failed to open team chat"),
  });

  const { mutate: startDM, isPending: isStartingDM } = useMutation({
    mutationFn: (targetId: string) => startDirectMessage(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-conversations"] });
      openDrawer();
    },
    onError: () => toast.error("Failed to start direct message"),
  });

  const presentRecords = attendanceData?.data || [];
  const presentByChild = new Map(presentRecords.map((r: any) => [r.childId, r]));

  const matrixByChild = new Map<string, Record<string, number>>();

  (matrixData || []).forEach((event: { childId: string; eventType: string }) => {
    if (!matrixByChild.has(event.childId)) {
      matrixByChild.set(event.childId, {});
    }
    const childRecords = matrixByChild.get(event.childId)!;
    childRecords[event.eventType] = (childRecords[event.eventType] || 0) + 1;
  });

  const { mutate: removeTeacher } = useMutation({
    mutationFn: (userId: string) => unassignTeacher(classroomId, userId),
    onSuccess: () => {
      toast.success("Teacher removed.");
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: branchChildren, isLoading: isLoadingUnassigned } = useQuery({
    queryKey: ["children", "branch-enrolled", classroom?.branchId],
    queryFn: () => getChildren(`branchId=${classroom!.branchId}&status=ENROLLED&limit=200`),
    enabled: isAddChildOpen && !!classroom,
  });

  const unassignedChildren = {
    data: (branchChildren?.data || []).filter((c: any) => !c.classroomId),
  };

  const { mutate: addChild, isPending: isAddingChild } = useMutation({
    mutationFn: (childId: string) => assignClassroom(childId, classroomId),
    onSuccess: () => {
      toast.success("Child added to classroom.");
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["children", "branch-enrolled", classroom?.branchId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: removeChild, isPending: isRemovingChild } = useMutation({
    mutationFn: (childId: string) => unassignClassroom(childId),
    onSuccess: () => {
      toast.success("Child removed from classroom.");
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({ queryKey: ["children", "branch-enrolled", classroom?.branchId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading || !classroom) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const enrolledCount = classroom._count?.children ?? 0;
  const isFull = enrolledCount >= classroom.legalCapacity;

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push(basePath)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to classrooms
      </button>

      {/* Classroom Stats Header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <School className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {classroom.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {classroom.ageGroup} · {classroom.branch?.name}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Capacity</p>
            <p className={`text-sm font-medium ${isFull ? "text-destructive" : "text-foreground"}`}>
              {enrolledCount} / {classroom.legalCapacity} {isFull && " (Full)"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ratio limit</p>
            <p className="text-sm font-medium text-foreground">
              1 : {classroom.ratioLimit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teachers assigned</p>
            <p className="text-sm font-medium text-foreground">
              {classroom._count?.teacherAssignments ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Enrolled Children (Takes 2 cols) */}
        <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Enrolled children
            </h3>
            <button
              onClick={() => setIsAddChildOpen(true)}
              disabled={isFull}
              title={isFull ? "This classroom is at capacity" : undefined}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-3.5" /> Add Child
            </button>
          </div>
          {!classroom.children || classroom.children.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No children enrolled in this classroom yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {classroom.children.map((c) => {
                const isPresent = presentByChild.has(c.id);
                const childMatrix: Record<string, number> = matrixByChild.get(c.id) || {};

                return (
                  <li
                    key={c.id}
                    onClick={() => router.push(`${studentsBasePath}/${c.id}`)}
                    className="flex cursor-pointer flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between text-sm hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} alt={c.firstName} className="size-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Baby className="size-5" />
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-foreground text-base">
                          {c.firstName} {c.lastName}
                        </span>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            {isPresent ? (
                              <>
                                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                                Present
                              </>
                            ) : (
                              <>
                                <Circle className="size-3.5" /> Not checked in
                              </>
                            )}
                          </p>

                          {isPresent && (
                            <div className="flex items-center gap-1.5 pl-4 border-l border-border">
                              <span
                                title={`${childMatrix["MEAL"] || 0} Meals logged`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                                  childMatrix["MEAL"]
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Utensils className="size-3.5" />
                                {childMatrix["MEAL"] > 0 && childMatrix["MEAL"]}
                              </span>
                              <span
                                title={`${childMatrix["NAP"] || 0} Naps logged`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                                  childMatrix["NAP"]
                                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Moon className="size-3.5" />
                                {childMatrix["NAP"] > 0 && childMatrix["NAP"]}
                              </span>
                              <span
                                title={`${childMatrix["BATHROOM"] || 0} Bathroom breaks logged`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors ${
                                  childMatrix["BATHROOM"]
                                    ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Baby className="size-3.5" />
                                {childMatrix["BATHROOM"] > 0 && childMatrix["BATHROOM"]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3 sm:mt-0 ml-12 sm:ml-0">
                      {isPresent && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setLoggingActivityFor(c);
                          }}
                          className="flex items-center gap-1.5 rounded-md border border-border bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Activity className="size-3.5" /> Log Activity
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingHistoryFor(c);
                        }}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <History className="size-3.5" /> History
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChild(c.id);
                        }}
                        disabled={isRemovingChild}
                        className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Teachers Assigned (Takes 1 col) */}
        <div className="rounded-lg border border-border bg-card p-6 h-fit">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Teachers
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => startTeamChat()}
                disabled={isStartingTeam}
                className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                {isStartingTeam ? "Opening..." : "Message Team"}
              </button>
              <button
                onClick={() => setIsAssignOpen(true)}
                className="flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="size-3.5" /> Assign
              </button>
            </div>
          </div>
          {!classroom.teacherAssignments || classroom.teacherAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No teacher assigned yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {classroom.teacherAssignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">
                      {a.teacher.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.teacher.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Only show the DM button if the teacher is not the current user */}
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
                    <button
                      onClick={() => removeTeacher(a.teacher.id)}
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
      </div>

      <AssignTeacherModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        classroomId={classroom.id}
        branchId={classroom.branchId}
      />
      <AddChildToClassroomModal
        isOpen={isAddChildOpen}
        onClose={() => setIsAddChildOpen(false)}
        unassignedChildren={unassignedChildren?.data || []}
        isLoading={isLoadingUnassigned}
        isSubmitting={isAddingChild}
        onSelect={(childId) => {
          addChild(childId);
          setIsAddChildOpen(false);
        }}
      />
      {viewingHistoryFor && (
        <TeacherChildHistoryModal
          childId={viewingHistoryFor.id}
          childName={`${viewingHistoryFor.firstName} ${viewingHistoryFor.lastName}`}
          onClose={() => setViewingHistoryFor(null)}
        />
      )}
      {loggingActivityFor && (
        <TeacherTimelineLoggerModal
          childId={loggingActivityFor.id}
          childName={`${loggingActivityFor.firstName} ${loggingActivityFor.lastName}`}
          onClose={() => setLoggingActivityFor(null)}
        />
      )}
    </div>
  );
}