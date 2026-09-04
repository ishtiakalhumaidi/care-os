import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import {
  classroomSearchableFields,
  classroomFilterableFields,
  classroomListIncludeConfig,
  classroomDetailIncludeConfig,
} from "./classroom.constant.js";
import type { IAssignTeacherPayload } from "./classroom.interface.js";

const assertBranchActive = (
  branch: { isActive: boolean; deletedAt?: Date | null },
  label = "Branch",
) => {
  if (!branch.isActive || branch.deletedAt) {
    throw new AppError(status.FORBIDDEN, `${label} is deactivated or deleted`);
  }
};

const createClassroom = async (payload: any, tenantId: string, staffBranchId?: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id: payload.branchId },
  });

  if (!branch || !branch.isActive || branch.deletedAt || branch.tenantId !== tenantId) {
    throw new AppError(
      status.FORBIDDEN,
      "Invalid or deactivated branch. You cannot add classrooms here.",
    );
  }

  if (staffBranchId && payload.branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  return prisma.classroom.create({ data: payload });
};

const getAllClassrooms = async (
  query: Record<string, any>,
  tenantId: string,
  staffBranchId?: string,
) => {
  let branchIds: string[];

  if (staffBranchId) {
    branchIds = [staffBranchId];
  } else {
    const tenantBranches = await prisma.branch.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      select: { id: true },
    });
    branchIds = tenantBranches.map((b) => b.id);
  }

  if (query.branchId && !branchIds.includes(query.branchId)) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  const scopedQuery = query.branchId
    ? { ...query }
    : { ...query, branchId: { in: branchIds } };

  const queryBuilder = new QueryBuilder(prisma.classroom, scopedQuery, {
    searchableFields: classroomSearchableFields,
    filterableFields: classroomFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .fields()
    .dynamicInclude(classroomListIncludeConfig)
    .execute();

  return result;
};

const getClassroomById = async (id: string, tenantId: string, staffBranchId?: string) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: classroomDetailIncludeConfig,
  });

  if (!classroom) {
    throw new AppError(status.NOT_FOUND, "Classroom not found");
  }
  if (classroom.branch.tenantId !== tenantId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this classroom",
    );
  }
  if (classroom.branch.deletedAt) {
    throw new AppError(status.FORBIDDEN, "This classroom's branch has been deleted");
  }
  assertBranchActive(classroom.branch);

  if (staffBranchId && classroom.branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this classroom");
  }

  return classroom;
};

const getMyClassrooms = async (teacherId: string) => {
  const assignments = await prisma.classroomTeacher.findMany({
    where: {
      teacherId,
      classroom: {
        branch: { isActive: true, deletedAt: null },
      },
    },
    include: {
      classroom: {
        include: {
          branch: { select: { id: true, name: true, isActive: true } },
          children: {
            where: { status: "ENROLLED" },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              photoUrl: true,
            },
          },
          _count: {
            select: {
              children: { where: { status: "ENROLLED" } },
              teacherAssignments: true,
            },
          },
        },
      },
    },
  });

  return assignments.map((a) => a.classroom);
};

const getMyClassroomById = async (classroomId: string, teacherId: string) => {
  const assignment = await prisma.classroomTeacher.findUnique({
    where: { classroomId_teacherId: { classroomId, teacherId } },
  });
  if (!assignment) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not assigned to this classroom",
    );
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: {
      branch: { select: { id: true, name: true, isActive: true, deletedAt: true } },
      teacherAssignments: {
        include: { teacher: { select: { id: true, name: true, email: true } } },
      },
      children: {
        where: { status: "ENROLLED" },
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      },
      _count: {
        select: {
          children: { where: { status: "ENROLLED" } },
          teacherAssignments: true,
        },
      },
    },
  });

  if (!classroom) {
    throw new AppError(status.NOT_FOUND, "Classroom not found");
  }
  assertBranchActive(classroom.branch);

  return classroom;
};

const updateClassroom = async (id: string, payload: any, tenantId: string, staffBranchId?: string) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: { branch: true },
  });

  if (!classroom || classroom.branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Classroom not found or unauthorized");
  }
  assertBranchActive(classroom.branch);

  if (staffBranchId && classroom.branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this classroom");
  }

  if (payload.branchId && payload.branchId !== classroom.branchId) {
    const newBranch = await prisma.branch.findUnique({
      where: { id: payload.branchId },
    });
    if (!newBranch || !newBranch.isActive || newBranch.deletedAt || newBranch.tenantId !== tenantId) {
      throw new AppError(
        status.FORBIDDEN,
        "Cannot move classroom to an unauthorized or deactivated branch",
      );
    }
    if (staffBranchId && payload.branchId !== staffBranchId) {
      throw new AppError(status.FORBIDDEN, "Cannot move classroom to another branch");
    }
  }

  return prisma.classroom.update({ where: { id }, data: payload });
};

const deleteClassroom = async (id: string, tenantId: string, staffBranchId?: string) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      branch: true,
      _count: {
        select: { children: true, teacherAssignments: true, shifts: true },
      },
    },
  });

  if (!classroom || classroom.branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Classroom not found or unauthorized");
  }
  assertBranchActive(classroom.branch);

  if (staffBranchId && classroom.branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this classroom");
  }

  if (
    classroom._count.children > 0 ||
    classroom._count.teacherAssignments > 0
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot delete a classroom that currently has assigned children or staff. Reassign them first.",
    );
  }

  await prisma.classroom.delete({ where: { id } });
  return { message: "Classroom permanently deleted" };
};

const assignTeacher = async (
  classroomId: string,
  payload: IAssignTeacherPayload,
  tenantId: string,
  staffBranchId?: string,
) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: { branch: true },
  });

  if (!classroom || classroom.branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Classroom not found");
  }
  assertBranchActive(classroom.branch);

  if (staffBranchId && classroom.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  const teacher = await prisma.user.findUnique({
    where: { id: payload.userId },
  });
  if (!teacher || teacher.tenantId !== tenantId || teacher.role !== "TEACHER") {
    throw new AppError(status.BAD_REQUEST, "Invalid teacher account");
  }
  if (!teacher.isActive || teacher.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Teacher account is inactive or deleted");
  }
  if (teacher.branchId !== classroom.branchId) {
    throw new AppError(
      status.BAD_REQUEST,
      "This teacher belongs to a different branch than this classroom",
    );
  }

  const existing = await prisma.classroomTeacher.findUnique({
    where: {
      classroomId_teacherId: { classroomId, teacherId: payload.userId },
    },
  });
  if (existing) {
    throw new AppError(
      status.CONFLICT,
      "This teacher is already assigned to this classroom",
    );
  }

  return prisma.$transaction(async (tx) => {
    const assignment = await tx.classroomTeacher.create({
      data: { classroomId, teacherId: payload.userId },
      include: { teacher: { select: { id: true, name: true, email: true } } },
    });

    if (!teacher.classroomId) {
      await tx.user.update({
        where: { id: payload.userId },
        data: { classroomId },
      });
    }

    return assignment;
  });
};

const unassignTeacher = async (
  classroomId: string,
  userId: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  const assignment = await prisma.classroomTeacher.findUnique({
    where: { classroomId_teacherId: { classroomId, teacherId: userId } },
    include: { classroom: { include: { branch: true } } },
  });

  if (!assignment || assignment.classroom.branch.tenantId !== tenantId) {
    throw new AppError(
      status.NOT_FOUND,
      "Teacher is not assigned to this classroom",
    );
  }
  if (staffBranchId && assignment.classroom.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.classroomTeacher.delete({
      where: { classroomId_teacherId: { classroomId, teacherId: userId } },
    });

    const teacher = await tx.user.findUnique({ where: { id: userId } });
    if (teacher?.classroomId === classroomId) {
      const another = await tx.classroomTeacher.findFirst({
        where: { teacherId: userId },
      });
      await tx.user.update({
        where: { id: userId },
        data: { classroomId: another?.classroomId ?? null },
      });
    }
  });

  return null;
};

const isTeacherAssigned = async (classroomId: string, teacherId: string) => {
  const assignment = await prisma.classroomTeacher.findUnique({
    where: { classroomId_teacherId: { classroomId, teacherId } },
  });
  return !!assignment;
};

export const ClassroomService = {
  createClassroom,
  getAllClassrooms,
  getClassroomById,
  getMyClassrooms,
  getMyClassroomById,
  updateClassroom,
  deleteClassroom,
  assignTeacher,
  unassignTeacher,
  isTeacherAssigned,
};