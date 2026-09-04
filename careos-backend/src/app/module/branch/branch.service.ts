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

const getLiveRatio = async (branchId: string, tenantId: string, staffBranchId?: string) => {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });

  if (!branch || branch.deletedAt || branch.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Branch not found or unauthorized");
  }
  if (!branch.isActive) {
    throw new AppError(status.FORBIDDEN, "Branch is deactivated");
  }
  if (staffBranchId && branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  const classrooms = await prisma.classroom.findMany({
    where: { branchId },
    select: {
      id: true,
      name: true,
      legalCapacity: true,
      ratioLimit: true,
      _count: { select: { teacherAssignments: true } },
    },
  });

  const activeAttendances = await prisma.attendance.findMany({
    where: {
      child: { branchId },
      status: { in: ["CHECKED_IN", "PENDING_CHECKOUT"] },
    },
    select: {
      child: { select: { classroomId: true } },
    },
  });

  const attendanceCountByClassroom = new Map<string, number>();
  activeAttendances.forEach((record) => {
    const cId = record.child?.classroomId;
    if (cId) {
      attendanceCountByClassroom.set(cId, (attendanceCountByClassroom.get(cId) || 0) + 1);
    }
  });

  return classrooms.map((c) => {
    const presentChildren = attendanceCountByClassroom.get(c.id) || 0;
    const teacherCount = c._count.teacherAssignments;

    let state = "OK";
    const maxChildrenForTeachers = teacherCount * c.ratioLimit;

    if (teacherCount === 0 && presentChildren > 0) {
      state = "VIOLATION";
    } else if (
      presentChildren > maxChildrenForTeachers ||
      presentChildren > c.legalCapacity
    ) {
      state = "VIOLATION";
    } else if (
      presentChildren >= maxChildrenForTeachers - 1 ||
      presentChildren >= c.legalCapacity - 1
    ) {
      state = "WARNING";
    }

    const currentRatio =
      teacherCount > 0
        ? (presentChildren / teacherCount).toFixed(1)
        : presentChildren;

    return {
      classroomId: c.id,
      name: c.name,
      legalCapacity: c.legalCapacity,
      ratioLimit: c.ratioLimit,
      teacherCount,
      presentChildren,
      currentRatio,
      state,
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
  if (!isTenantExist.isActive) {
    throw new AppError(status.FORBIDDEN, "Tenant is suspended");
  }

  if (isTenantExist.planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: isTenantExist.planId },
    });

    if (plan) {
      const branchCount = await prisma.branch.count({
        where: { tenantId: payload.tenantId, deletedAt: null },
      });

      if (branchCount >= plan.maxBranches) {
        throw new AppError(
          status.FORBIDDEN,
          `Your plan allows a maximum of ${plan.maxBranches} branch(es). Upgrade to add more.`,
        );
      }
    }
  }

  const branch = await prisma.branch.create({ data: payload });
  return branch;
};

const getAllBranches = async (query: IQuery, tenantId?: string) => {
  const baseWhere = tenantId
    ? { tenantId, deletedAt: null }
    : { deletedAt: null };

  const scopedQuery =
    query.includeInactive === "true"
      ? { ...query, ...baseWhere }
      : { ...query, ...baseWhere, isActive: true };

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

  if (!branch || branch.deletedAt) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (tenantId && branch.tenantId !== tenantId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  return branch;
};

const updateBranch = async (
  id: string,
  payload: IUpdateBranchPayload,
  tenantId?: string,
) => {
  const isBranchExist = await prisma.branch.findUnique({ where: { id } });

  if (!isBranchExist || isBranchExist.deletedAt) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (!isBranchExist.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "This branch is locked by your subscription plan. Upgrade your plan to edit it.",
    );
  }

  if (tenantId && isBranchExist.tenantId !== tenantId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  const safePayload = { ...payload };
  delete (safePayload as any).isActive;

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: safePayload,
  });

  return updatedBranch;
};
const deleteBranch = async (id: string, tenantId?: string) => {
  const isBranchExist = await prisma.branch.findUnique({ where: { id } });

  if (!isBranchExist || isBranchExist.deletedAt) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }

  if (tenantId && isBranchExist.tenantId !== tenantId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  await prisma.branch.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  return { message: "Branch deleted successfully" };
};

const syncBranchActivationToPlan = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });

  if (!tenant?.plan) return { activated: [], locked: [] };

  const maxBranches = tenant.plan.maxBranches;

  const nonDeletedBranches = await prisma.branch.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: "asc" }, 
    select: { id: true, name: true, isActive: true },
  });

  const toActivate = nonDeletedBranches.slice(0, maxBranches).map((b) => b.id);
  const toLock = nonDeletedBranches.slice(maxBranches).map((b) => b.id);

  await prisma.$transaction(async (tx) => {
    if (toActivate.length > 0) {
      await tx.branch.updateMany({
        where: { id: { in: toActivate } },
        data: { isActive: true },
      });
      await tx.user.updateMany({
        where: {
          branchId: { in: toActivate },
          isDeleted: false,
        },
        data: { isActive: true },
      });
    }

    if (toLock.length > 0) {
      await tx.branch.updateMany({
        where: { id: { in: toLock } },
        data: { isActive: false },
      });
      await tx.user.updateMany({
        where: {
          branchId: { in: toLock },
          role: { not: "TENANT_OWNER" },
          isDeleted: false,
        },
        data: { isActive: false },
      });
    }
  });

  return { activated: toActivate, locked: toLock };
};

const deactivateAllBranchesForTenant = async (tenantId: string) => {
  await prisma.branch.updateMany({
    where: { tenantId },
    data: { isActive: false },
  });
};

const getBranchUsageStats = async (tenantId: string) => {
  const [active, locked, totalNonDeleted] = await Promise.all([
    prisma.branch.count({ where: { tenantId, isActive: true, deletedAt: null } }),
    prisma.branch.count({ where: { tenantId, isActive: false, deletedAt: null } }),
    prisma.branch.count({ where: { tenantId, deletedAt: null } }),
  ]);
  return { active, locked, total: totalNonDeleted };
};

export const BranchService = {
  getLiveRatio,
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
  syncBranchActivationToPlan,
  deactivateAllBranchesForTenant,
  getBranchUsageStats,
};