import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";

type Performer = { id: string; role: string; tenantId: string | null; branchId: string | null };

const assertChildAccess = async (childId: string, performer: Performer) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  
  if (!child || child.tenantId !== performer.tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  if (performer.role === "GUARDIAN") {
    const link = await prisma.childGuardian.findFirst({
      where: { childId, userId: performer.id },
    });
    if (!link) {
      throw new AppError(status.FORBIDDEN, "You do not have access to this child's timeline");
    }
  } else if (performer.role !== "TENANT_OWNER" && child.branchId !== performer.branchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  return child;
};

const logEvent = async (
  childId: string,
  payload: { eventType: string; description?: string },
  performer: Performer
) => {
  if (performer.role === "GUARDIAN") {
    throw new AppError(status.FORBIDDEN, "Guardians are not authorized to log timeline events");
  }

  await assertChildAccess(childId, performer);

  const activeAttendance = await prisma.attendance.findFirst({
    where: {
      childId,
      status: { in: ["CHECKED_IN", "PENDING_CHECKOUT"] },
    },
  });

  if (!activeAttendance) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot log activities for a child who is not currently checked in."
    );
  }

  return prisma.timelineEvent.create({
    data: {
      childId,
      eventType: payload.eventType,
      description: payload.description,
      loggedBy: performer.id,
    },
  });
};

const getDailyTimeline = async (childId: string, date: string, performer: Performer) => {
  await assertChildAccess(childId, performer);

  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw new AppError(status.BAD_REQUEST, "Invalid date format provided");
  }

  const startDate = new Date(targetDate);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);

  return prisma.timelineEvent.findMany({
    where: {
      childId,
      loggedAt: { gte: startDate, lte: endDate },
    },
    orderBy: { loggedAt: "desc" },
  });
};

const getClassroomDailyMatrix = async (classroomId: string, date: string, performer: Performer) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    select: { branchId: true, branch: { select: { tenantId: true } } }
  });

  if (!classroom || classroom.branch.tenantId !== performer.tenantId) {
    throw new AppError(status.NOT_FOUND, "Classroom not found");
  }

  if (performer.role !== "TENANT_OWNER" && classroom.branchId !== performer.branchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  const targetDate = new Date(date);
  const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
  const endDate = new Date(targetDate.setHours(23, 59, 59, 999));

  return prisma.timelineEvent.findMany({
    where: {
      child: { classroomId },
      loggedAt: { gte: startDate, lte: endDate },
    },
    select: {
      childId: true,
      eventType: true,
    }
  });
};

const getBranchAuditStream = async (branchId: string, date: string, performer: Performer) => {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });

  if (!branch || branch.tenantId !== performer.tenantId) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (performer.role !== "TENANT_OWNER" && branchId !== performer.branchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  const targetDate = new Date(date);
  const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
  const endDate = new Date(targetDate.setHours(23, 59, 59, 999));

  return prisma.timelineEvent.findMany({
    where: {
      child: { branchId },
      loggedAt: { gte: startDate, lte: endDate },
    },
    orderBy: { loggedAt: "desc" },
    include: {
      child: { select: { firstName: true, lastName: true, classroom: { select: { name: true } } } },
     
    }
  });
};
export const TimelineService = {
  logEvent,
  getDailyTimeline,
    getClassroomDailyMatrix,
    getBranchAuditStream,
    
};