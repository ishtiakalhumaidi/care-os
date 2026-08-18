import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import {
  branchFilterableFields,
  branchIncludeConfig,
  branchSearchableFields,
} from "./branch.constant.js";
import {
  ICreateBranchPayload,
  IUpdateBranchPayload,
} from "./branch.interface.js";
import type { Prisma, Branch } from "../../../generated/prisma/client.js";
import type { IQuery } from "../../interfaces/query.interface.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";

const getLiveRatio = async (branchId: string, tenantId: string) => {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch || branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Branch not found or unauthorized");
  }

  const classrooms = await prisma.classroom.findMany({
    where: { branchId },
    select: {
      id: true,
      name: true,
      legalCapacity: true,
      ratioLimit: true,
      _count: { select: { teacherAssignments: true } },
    }
  });

  const activeAttendances = await prisma.attendance.findMany({
    where: {
      child: { branchId },
      status: { in: ["CHECKED_IN", "PENDING_CHECKOUT"] }
    },
    select: {
      child: { select: { classroomId: true } }
    }
  });

  const attendanceCountByClassroom = new Map<string, number>();
  activeAttendances.forEach(record => {
    const cId = record.child?.classroomId;
    if (cId) {
      attendanceCountByClassroom.set(cId, (attendanceCountByClassroom.get(cId) || 0) + 1);
    }
  });

  return classrooms.map(c => {
    const presentChildren = attendanceCountByClassroom.get(c.id) || 0;
    
    const teacherCount = c._count.teacherAssignments; 
    
    let state = "OK";
    const maxChildrenForTeachers = teacherCount * c.ratioLimit;
    
    if (teacherCount === 0 && presentChildren > 0) {
      state = "VIOLATION"; 
    } else if (presentChildren > maxChildrenForTeachers || presentChildren > c.legalCapacity) {
      state = "VIOLATION"; 
    } else if (presentChildren >= maxChildrenForTeachers - 1 || presentChildren >= c.legalCapacity - 1) {
      state = "WARNING"; 
    }

    const currentRatio = teacherCount > 0 ? (presentChildren / teacherCount).toFixed(1) : presentChildren;

    return {
      classroomId: c.id,
      name: c.name,
      legalCapacity: c.legalCapacity,
      ratioLimit: c.ratioLimit,
      teacherCount,
      presentChildren,
      currentRatio,
      state
    };
  });
};

const createBranch = async (payload: ICreateBranchPayload) => {
  const isTenantExist = await prisma.tenant.findUnique({
    where: { id: payload.tenantId },
  });

  if (!isTenantExist) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  if (isTenantExist.planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: isTenantExist.planId },
    });

    if (plan) {
      const branchCount = await prisma.branch.count({
        where: { tenantId: payload.tenantId },
      });

      if (branchCount >= plan.maxBranches) {
        throw new AppError(
          status.FORBIDDEN,
          `Your plan allows a maximum of ${plan.maxBranches} branch(es). Upgrade to add more.`,
        );
      }
    }
  }

  const branch = await prisma.branch.create({
    data: payload,
  });

  return branch;
};

const getAllBranches = async (query: IQuery, tenantId?: string) => {
  const scopedQuery = tenantId
    ? { ...query, tenantId, isActive: true }
    : { ...query, isActive: true };

  const queryBuilder = new QueryBuilder<
    Branch,
    Prisma.BranchWhereInput,
    Prisma.BranchInclude
  >(prisma.branch, scopedQuery, {
    searchableFields: branchSearchableFields,
    filterableFields: branchFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(branchIncludeConfig as Prisma.BranchInclude)
    .sort()
    .fields()
    .execute();

  return result;
};

const getBranchById = async (id: string, tenantId?: string) => {
  const branch = await prisma.branch.findUnique({
    where: { id },
    include: branchIncludeConfig as Prisma.BranchInclude,
  });

  if (!branch || !branch.isActive) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (tenantId && branch.tenantId !== tenantId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  return branch;
};

const updateBranch = async (
  id: string,
  payload: IUpdateBranchPayload,
  tenantId?: string,
) => {
  const isBranchExist = await prisma.branch.findUnique({ where: { id } });

  if (!isBranchExist || !isBranchExist.isActive) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (tenantId && isBranchExist.tenantId !== tenantId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: payload,
  });

  return updatedBranch;
};

const deleteBranch = async (id: string, tenantId?: string) => {
  const isBranchExist = await prisma.branch.findUnique({ where: { id } });

  if (!isBranchExist || !isBranchExist.isActive) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (tenantId && isBranchExist.tenantId !== tenantId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  await prisma.branch.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: "Branch deactivated successfully" };
};

export const BranchService = {
  getLiveRatio,
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
