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

const clockIn = async (userId: string, role: string, branchId: string | null, shiftId?: string) => {
  const activeTimesheet = await prisma.timesheet.findFirst({
    where: { userId, clockOutTime: null },
  });

  if (activeTimesheet) {
    throw new AppError(status.CONFLICT, "You are already clocked in");
  }

  if (role === "TEACHER" && branchId) {
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    
    if (branch && branch.openTime && branch.closeTime) {
      const now = new Date();
      const currentHHMM = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

      if (currentHHMM < branch.openTime || currentHHMM > branch.closeTime) {
        throw new AppError(
          status.FORBIDDEN, 
          `The branch is currently closed (Hours: ${branch.openTime} - ${branch.closeTime}). Only Admins can clock in for overtime.`
        );
      }
    }
  }

  if (shiftId) {
    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.userId !== userId) {
      throw new AppError(status.BAD_REQUEST, "Invalid shift selected");
    }
  }

  return prisma.timesheet.create({
    data: {
      userId,
      shiftId,
      clockInTime: new Date(),
    },
  });
};

const clockOut = async (userId: string) => {
  const activeTimesheet = await prisma.timesheet.findFirst({
    where: { userId, clockOutTime: null },
  });

  if (!activeTimesheet) {
    throw new AppError(status.CONFLICT, "You are not currently clocked in");
  }

  return prisma.timesheet.update({
    where: { id: activeTimesheet.id },
    data: { clockOutTime: new Date() },
  });
};

const getCurrentTimesheet = async (userId: string) => {
  return prisma.timesheet.findFirst({
    where: { userId, clockOutTime: null },
    include: { shift: { include: { classroom: { select: { name: true } } } } },
  });
};

const getMyTimesheetHistory = async (userId: string, limit: number = 30) => {
  return prisma.timesheet.findMany({
    where: { userId },
    orderBy: { clockInTime: "desc" },
    take: limit,
    include: { shift: { include: { classroom: { select: { name: true } } } } },
  });
};

export const ScheduleService = {
  createShift,
  getBranchWeeklySchedule,
  getMyUpcomingShifts,
  clockIn,
  clockOut,
  getCurrentTimesheet,
  getMyTimesheetHistory,
};