import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";

type Performer = { id: string; role: string; tenantId: string | null; branchId: string | null };

const isStaff = (role: string) =>
  role === "TEACHER" || role === "CENTER_ADMIN" || role === "TENANT_OWNER";

const assertChildAccess = async (childId: string, performer: Performer) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== performer.tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }
  if (child.status !== "ENROLLED") {
    throw new AppError(status.BAD_REQUEST, "Only enrolled children can be checked in or out");
  }
  if (performer.role === "GUARDIAN") {
    const link = await prisma.childGuardian.findFirst({
      where: { childId, userId: performer.id },
    });
    if (!link) {
      throw new AppError(status.FORBIDDEN, "You are not a guardian of this child");
    }
  } else if (performer.role !== "TENANT_OWNER" && child.branchId !== performer.branchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }
  return child;
};

const requestCheckIn = async (childId: string, performer: Performer) => {
  if (performer.role !== "GUARDIAN") {
    throw new AppError(status.FORBIDDEN, "Only a guardian can request check-in");
  }
  await assertChildAccess(childId, performer);

  const openRecord = await prisma.attendance.findFirst({
    where: { childId, status: { not: "CHECKED_OUT" } },
  });
  if (openRecord) {
    throw new AppError(status.CONFLICT, "This child already has an active attendance record today");
  }

  return prisma.attendance.create({
    data: {
      childId,
      status: "PENDING_CHECKIN",
      checkInRequestedAt: new Date(),
      checkInRequestedBy: performer.id,
    },
  });
};

const confirmCheckIn = async (attendanceId: string, performer: Performer) => {
  if (!isStaff(performer.role)) {
    throw new AppError(status.FORBIDDEN, "Only staff can confirm a check-in");
  }
  const record = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { child: true },
  });
  if (!record || record.child.tenantId !== performer.tenantId) {
    throw new AppError(status.NOT_FOUND, "Attendance request not found");
  }
  if (record.status !== "PENDING_CHECKIN") {
    throw new AppError(status.CONFLICT, "This request has already been handled");
  }
  if (performer.role !== "TENANT_OWNER" && record.child.branchId !== performer.branchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: { status: "CHECKED_IN", checkInTime: new Date(), checkedInBy: performer.id },
  });
};

const requestCheckOut = async (
  childId: string,
  performer: Performer,
  reason?: string,
) => {
  await assertChildAccess(childId, performer);

  if (performer.role === "GUARDIAN") {
    const link = await prisma.childGuardian.findFirst({
      where: { childId, userId: performer.id },
    });
    if (!link?.canPickup) {
      throw new AppError(status.FORBIDDEN, "You are not authorized to pick up this child");
    }
  } else if (!isStaff(performer.role)) {
    throw new AppError(status.FORBIDDEN, "Not authorized to request a check-out");
  }

  const record = await prisma.attendance.findFirst({
    where: { childId, status: "CHECKED_IN" },
  });
  if (!record) {
    throw new AppError(status.CONFLICT, "This child is not currently checked in");
  }

  return prisma.attendance.update({
    where: { id: record.id },
    data: {
      status: "PENDING_CHECKOUT",
      checkOutRequestedAt: new Date(),
      checkOutRequestedBy: performer.id,
      checkOutReason: performer.role === "GUARDIAN" ? null : reason,
    },
  });
};

const confirmCheckOut = async (
  attendanceId: string,
  performer: Performer,
  pickedUpByGuardianId: string,
) => {
  if (!isStaff(performer.role)) {
    throw new AppError(status.FORBIDDEN, "Only staff can confirm a check-out");
  }
  const record = await prisma.attendance.findUnique({
    where: { id: attendanceId },
    include: { child: true },
  });
  if (!record || record.child.tenantId !== performer.tenantId) {
    throw new AppError(status.NOT_FOUND, "Attendance request not found");
  }
  if (record.status !== "PENDING_CHECKOUT") {
    throw new AppError(status.CONFLICT, "This request has already been handled");
  }
  if (performer.role !== "TENANT_OWNER" && record.child.branchId !== performer.branchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  const guardianLink = await prisma.childGuardian.findFirst({
    where: { childId: record.childId, userId: pickedUpByGuardianId },
  });
  if (!guardianLink?.canPickup) {
    throw new AppError(status.BAD_REQUEST, "Selected guardian is not authorized to pick up this child");
  }

  return prisma.attendance.update({
    where: { id: attendanceId },
    data: {
      status: "CHECKED_OUT",
      checkOutTime: new Date(),
      checkedOutBy: performer.id,
      pickedUpByGuardianId,
    },
  });
};

const getCurrentAttendance = async (tenantId: string, branchId?: string, classroomId?: string) => {
  return prisma.attendance.findMany({
    where: {
      status: "CHECKED_IN",
      child: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        ...(classroomId ? { classroomId } : {}),
      },
    },
    include: {
      child: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true, classroomId: true },
      },
    },
    orderBy: { checkInTime: "asc" },
  });
};

const getPendingRequests = async (tenantId: string, branchId?: string, classroomId?: string) => {
  return prisma.attendance.findMany({
    where: {
      status: { in: ["PENDING_CHECKIN", "PENDING_CHECKOUT"] },
      child: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        ...(classroomId ? { classroomId } : {}),
      },
    },
    include: {
      child: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          classroomId: true,
          guardians: { include: { user: { select: { id: true, name: true } } } },
        },
      },
    },
    orderBy: { checkInRequestedAt: "asc" },
  });
};


const getChildAttendanceHistory = async (childId: string, performer: Performer) => {
  await assertChildAccess(childId, performer);

  const records = await prisma.attendance.findMany({
    where: { childId },
    orderBy: { createdAt: "desc" },
    take: 30, 
  });

  const guardianIds = Array.from(
    new Set(records.map((r) => r.pickedUpByGuardianId).filter(Boolean))
  ) as string[];

  const guardians = await prisma.user.findMany({
    where: { id: { in: guardianIds } },
    select: { id: true, name: true },
  });

  const guardianMap = new Map(guardians.map((g) => [g.id, g.name]));

  return records.map((record) => ({
    ...record,
    pickedUpByGuardianName: record.pickedUpByGuardianId 
      ? guardianMap.get(record.pickedUpByGuardianId) || "Unknown Guardian" 
      : null,
  }));
};

export const AttendanceService = {
  requestCheckIn,
  confirmCheckIn,
  requestCheckOut,
  confirmCheckOut,
  getCurrentAttendance,
  getPendingRequests,
  getChildAttendanceHistory,
};