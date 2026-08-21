import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";

const createShift = async (payload: any, tenantId: string, adminBranchId?: string) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: payload.classroomId },
    include: { branch: true },
  });

  if (!classroom || classroom.branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Classroom not found");
  }

  if (adminBranchId && classroom.branchId !== adminBranchId) {
    throw new AppError(status.FORBIDDEN, "You can only schedule shifts for your own branch");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.tenantId !== tenantId) {
    throw new AppError(status.BAD_REQUEST, "Invalid staff member");
  }

  const overlapping = await prisma.shift.findFirst({
    where: {
      userId: payload.userId,
      OR: [
        { startTime: { lt: new Date(payload.endTime) }, endTime: { gt: new Date(payload.startTime) } }
      ]
    }
  });

  if (overlapping) {
    throw new AppError(status.CONFLICT, "Teacher already has a shift scheduled during this time");
  }

  return prisma.shift.create({ data: payload });
};

const getBranchWeeklySchedule = async (branchId: string, startDate: string, endDate: string, tenantId: string) => {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch || branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  return prisma.shift.findMany({
    where: {
      classroom: { branchId },
      startTime: { gte: new Date(startDate) },
      endTime: { lte: new Date(endDate) },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      classroom: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  });
};

const getMyUpcomingShifts = async (userId: string) => {
  const now = new Date();
  
  return prisma.shift.findMany({
    where: {
      userId,
      endTime: { gt: now },
    },
    include: {
      classroom: { select: { id: true, name: true, branch: { select: { name: true } } } },
    },
    orderBy: { startTime: "asc" },
    take: 10, 
  });
};

export const ScheduleService = {
  createShift,
  getBranchWeeklySchedule,
  getMyUpcomingShifts,
};