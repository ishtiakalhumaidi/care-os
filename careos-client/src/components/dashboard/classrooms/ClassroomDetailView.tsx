/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  School,
  UserPlus,
  Baby,
  Plus,
  CheckCircle2,
  Circle,
  History,
  Activity,
  Utensils,
  Moon,
  MessageSquare,
  Loader2,
  Users,
  GraduationCap,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Trash2,
  MessageCircle,
  Send,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  getClassroomById,
  unassignTeacher,
  IClassroom,
} from "@/services/classroom.services";
import {
  assignClassroom,
  getChildren,
  unassignClassroom,
} from "@/services/child.services";
import { getCurrentAttendance } from "@/services/attendance.services";
import { getClassroomDailyMatrix } from "@/services/timeline.services";
import {
  startDirectMessage,
  startClassroomMessage,
} from "@/services/message.services";
import AssignTeacherModal from "./AssignTeacherModal";
import AddChildToClassroomModal from "./AddChildToClassroomModal";
import TeacherChildHistoryModal from "../teacher/TeacherChildHistoryModal";
import TeacherTimelineLoggerModal from "../timeline/TeacherTimelineLoggerModal";
import { useChat } from "@/components/providers/ChatContext";

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

function ClassroomSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonPulse className="h-8 w-32" />
      <SkeletonPulse className="h-40 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonPulse className="h-64 w-full" />
        </div>
        <div className="lg:col-span-1">
          <SkeletonPulse className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

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
  const [viewingHistoryFor, setViewingHistoryFor] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [loggingActivityFor, setLoggingActivityFor] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const { data: classroom, isLoading } = useQuery({
    queryKey: ["classrooms", classroomId],
    queryFn: () =>
      getClassroomById(classroomId).then((res) => res.data as IClassroom),
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

  const presentRecords = attendanceData?.data || [];
  const presentByChild = new Map(
    presentRecords.map((r: any) => [r.childId, r])
  );

  const matrixByChild = new Map<string, Record<string, number>>();
  (matrixData || []).forEach(
    (event: { childId: string; eventType: string }) => {
      if (!matrixByChild.has(event.childId)) {
        matrixByChild.set(event.childId, {});
      }
      const childRecords = matrixByChild.get(event.childId)!;
      childRecords[event.eventType] =
        (childRecords[event.eventType] || 0) + 1;
    }
  );

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

  const { mutate: removeTeacher } = useMutation({
    mutationFn: (userId: string) => unassignTeacher(classroomId, userId),
    onSuccess: () => {
      toast.success("Teacher removed");
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { data: branchChildren, isLoading: isLoadingUnassigned } = useQuery({
    queryKey: ["children", "branch-enrolled", classroom?.branchId],
    queryFn: () =>
      getChildren(
        `branchId=${classroom!.branchId}&status=ENROLLED&limit=200`
      ),
    enabled: isAddChildOpen && !!classroom,
  });

  const unassignedChildren = {
    data: (branchChildren?.data || []).filter((c: any) => !c.classroomId),
  };

  const { mutate: addChild, isPending: isAddingChild } = useMutation({
    mutationFn: (childId: string) => assignClassroom(childId, classroomId),
    onSuccess: () => {
      toast.success("Child added to classroom");
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({
        queryKey: ["children", "branch-enrolled", classroom?.branchId],
      });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const { mutate: removeChild, isPending: isRemovingChild } = useMutation({
    mutationFn: (childId: string) => unassignClassroom(childId),
    onSuccess: () => {
      toast.success("Child removed from classroom");
      queryClient.invalidateQueries({ queryKey: ["classrooms", classroomId] });
      queryClient.invalidateQueries({
        queryKey: ["children", "branch-enrolled", classroom?.branchId],
      });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading || !classroom) {
    return <ClassroomSkeleton />;
  }

  const enrolledCount = classroom._count?.children ?? 0;
  const capacity = classroom.legalCapacity ?? 0;
  const isFull = capacity > 0 && enrolledCount >= capacity;
  const utilization =
    capacity > 0 ? Math.round((enrolledCount / capacity) * 100) : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-[1400px] space-y-6 pb-10"
    >
      {/* Back button */}
      <motion.div variants={fadeInUp} custom={0}>
        <button
          onClick={() => router.push(basePath)}
          className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to classrooms
        </button>
      </motion.div>

      {/* Header Card */}
      <motion.div
        variants={fadeInUp}
        custom={1}
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm sm:size-16">
              <School className="size-7 sm:size-8" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                {classroom.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <GraduationCap className="size-3.5" />
                {classroom.ageGroup || "Mixed Age Group"}
                <span className="mx-1">·</span>
                <MapPin className="size-3.5" />
                {classroom.branch?.name}
              </p>

              {/* Ratio chip */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                  <Users className="size-3" />
                  Ratio 1:{classroom.ratioLimit}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    isFull
                      ? "bg-destructive/10 text-destructive"
                      : utilization > 80
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  <TrendingUp className="size-3" />
                  {enrolledCount}/{capacity || "∞"}
                  {isFull && " Full"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  <UserPlus className="size-3" />
                  {classroom._count?.teacherAssignments ?? 0} teacher
                  {(classroom._count?.teacherAssignments ?? 0) !== 1
                    ? "s"
                    : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Utilization ring */}
          {capacity > 0 && (
            <div className="flex items-center gap-4">
              <div className="relative flex size-20 items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-muted"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <motion.path
                    initial={{ strokeDasharray: "0, 100" }}
                    animate={{
                      strokeDasharray: `${Math.min(utilization, 100)}, 100`,
                    }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
                    className={
                      isFull
                        ? "text-destructive"
                        : utilization > 80
                        ? "text-amber-500"
                        : "text-primary"
                    }
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-lg font-bold text-foreground">
                    {utilization}%
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Full
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Children */}
        <motion.div
          variants={fadeInUp}
          custom={2}
          className="xl:col-span-8"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Baby className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Enrolled Children
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {enrolledCount} child{enrolledCount !== 1 ? "ren" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddChildOpen(true)}
                disabled={isFull}
                title={isFull ? "Classroom is at capacity" : undefined}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-3.5" />
                Add Child
              </button>
            </div>

            {!classroom.children || classroom.children.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                  <Baby className="size-6 text-muted-foreground/50" />
                </div>
                <p className="mt-4 text-sm font-medium text-foreground">
                  No children enrolled yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add children to start tracking attendance and activities
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {classroom.children.map((c: any, idx: number) => {
                  const isPresent = presentByChild.has(c.id);
                  const childMatrix: Record<string, number> =
                    matrixByChild.get(c.id) || {};

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.04,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1] as const,
                      }}
                      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/20 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Child info */}
                      <div
                        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                        onClick={() =>
                          router.push(`${studentsBasePath}/${c.id}`)
                        }
                      >
                        {c.photoUrl ? (
                          <img
                            src={c.photoUrl}
                            alt={c.firstName}
                            className="size-11 rounded-full object-cover ring-2 ring-border"
                          />
                        ) : (
                          <div className="flex size-11 items-center justify-center rounded-full bg-muted ring-2 ring-border">
                            <Baby className="size-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-bold text-foreground">
                              {c.firstName} {c.lastName}
                            </span>
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 className="size-2.5" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                <Circle className="size-2.5" />
                                Absent
                              </span>
                            )}
                          </div>

                          {/* Activity matrix */}
                          {isPresent && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span
                                title={`${childMatrix["MEAL"] || 0} meals`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  childMatrix["MEAL"]
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Utensils className="size-3" />
                                {childMatrix["MEAL"] > 0 &&
                                  childMatrix["MEAL"]}
                              </span>
                              <span
                                title={`${childMatrix["NAP"] || 0} naps`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  childMatrix["NAP"]
                                    ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Moon className="size-3" />
                                {childMatrix["NAP"] > 0 && childMatrix["NAP"]}
                              </span>
                              <span
                                title={`${
                                  childMatrix["BATHROOM"] || 0
                                } bathroom breaks`}
                                className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  childMatrix["BATHROOM"]
                                    ? "bg-sky-500/10 text-sky-700 dark:text-sky-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                <Baby className="size-3" />
                                {childMatrix["BATHROOM"] > 0 &&
                                  childMatrix["BATHROOM"]}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pl-14 sm:pl-0">
                        {isPresent && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLoggingActivityFor(c);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                          >
                            <Activity className="size-3.5" />
                            Log
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingHistoryFor(c);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <History className="size-3.5" />
                          History
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeChild(c.id);
                          }}
                          disabled={isRemovingChild}
                          className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Teachers Sidebar */}
        <motion.div variants={fadeInUp} custom={3} className="xl:col-span-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <UserPlus className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Teachers
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {classroom._count?.teacherAssignments ?? 0} assigned
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Plus className="size-3.5" />
                Assign
              </button>
            </div>

            {!classroom.teacherAssignments ||
            classroom.teacherAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-8 text-center">
                <UserPlus className="size-8 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  No teachers assigned
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Assign staff to manage this classroom
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {classroom.teacherAssignments.map((a: any, idx: number) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: idx * 0.05,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1] as const,
                    }}
                    className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-all hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {a.teacher.image ? (
                        <img
                          src={a.teacher.image}
                          alt={a.teacher.name}
                          className="size-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                          <UserPlus className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {a.teacher.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.teacher.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {a.teacher.id !== currentUserId && (
                        <button
                          onClick={() => startDM(a.teacher.id)}
                          disabled={isStartingDM}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                          title="Message"
                        >
                          <MessageCircle className="size-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeTeacher(a.teacher.id)}
                        className="flex size-8 items-center justify-center rounded-lg text-destructive/70 transition-colors hover:bg-destructive/10"
                        title="Remove"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

           {/* Team chat button */}
{(classroom.teacherAssignments?.length ?? 0) > 0 && (
  <button
    onClick={() => startTeamChat()}
    disabled={isStartingTeam}
    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
  >
    {isStartingTeam ? (
      <Loader2 className="size-4 animate-spin" />
    ) : (
      <Send className="size-4" />
    )}
    {isStartingTeam ? "Opening..." : "Message Team"}
  </button>
)}
          </div>
        </motion.div>
      </div>

      {/* Modals */}
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
      <AnimatePresence>
        {viewingHistoryFor && (
          <TeacherChildHistoryModal
            childId={viewingHistoryFor.id}
            childName={`${viewingHistoryFor.firstName} ${viewingHistoryFor.lastName}`}
            onClose={() => setViewingHistoryFor(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loggingActivityFor && (
          <TeacherTimelineLoggerModal
            childId={loggingActivityFor.id}
            childName={`${loggingActivityFor.firstName} ${loggingActivityFor.lastName}`}
            onClose={() => setLoggingActivityFor(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}