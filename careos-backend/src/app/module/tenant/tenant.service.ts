import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import {
  tenantFilterableFields,
  tenantIncludeConfig,
  tenantSearchableFields,
} from "./tenant.constant.js";
import {
  IUpdateTenantPayload,
  ISuspendTenantPayload,
} from "./tenant.interface.js";
import type { Prisma, Tenant } from "../../../generated/prisma/client.js";
import type { IQuery } from "../../interfaces/query.interface.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { BranchService } from "../branch/branch.service.js";

const getAllTenants = async (query: IQuery) => {
  const queryBuilder = new QueryBuilder<
    Tenant,
    Prisma.TenantWhereInput,
    Prisma.TenantInclude
  >(prisma.tenant, query, {
    searchableFields: tenantSearchableFields,
    filterableFields: tenantFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(tenantIncludeConfig as Prisma.TenantInclude)
    .sort()
    .fields()
    .execute();

  if (result.data && Array.isArray(result.data)) {
    for (const tenant of result.data) {
      const realBranchCount = await prisma.branch.count({
        where: { tenantId: (tenant as any).id, deletedAt: null },
      });
      (tenant as any)._count = {
        ...(tenant as any)._count,
        branches: realBranchCount,
      };
    }
  }

  return result;
};

const getTenantById = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: tenantIncludeConfig as Prisma.TenantInclude,
  });

  if (!tenant) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  const realBranchCount = await prisma.branch.count({
    where: { tenantId: id, deletedAt: null },
  });
  (tenant as any)._count = {
    ...tenant._count,
    branches: realBranchCount,
  };

  return tenant;
};

const updateTenant = async (
  id: string,
  payload: IUpdateTenantPayload,
  userRole?: string,
) => {
  const isTenantExist = await prisma.tenant.findUnique({ where: { id } });
  if (!isTenantExist) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  if (payload.slug) {
    const slugTaken = await prisma.tenant.findFirst({
      where: { slug: payload.slug, id: { not: id } },
    });
    if (slugTaken) {
      throw new AppError(status.CONFLICT, "This slug is already taken");
    }
  }

  if (userRole === "TENANT_OWNER" && payload.planId) {
    throw new AppError(
      status.FORBIDDEN,
      "Plan changes must be made through the billing page.",
    );
  }

  if (payload.planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: payload.planId },
    });
    if (!plan) {
      throw new AppError(status.BAD_REQUEST, "Invalid plan selected");
    }

    const branchCount = await prisma.branch.count({
      where: { tenantId: id, deletedAt: null },
    });
    if (branchCount > plan.maxBranches) {
      throw new AppError(
        status.CONFLICT,
        `This plan allows ${plan.maxBranches} branch(es); you currently have ${branchCount} active/locked. Remove or delete branches first.`,
      );
    }

    const enrolledCount = await prisma.child.count({
      where: { tenantId: id, status: "ENROLLED" },
    });
    if (enrolledCount > plan.maxStudents) {
      throw new AppError(
        status.CONFLICT,
        `This plan allows ${plan.maxStudents} student(s); you currently have ${enrolledCount} enrolled.`,
      );
    }
  }

  const updated = await prisma.tenant.update({
    where: { id },
    data: payload,
    include: tenantIncludeConfig as Prisma.TenantInclude,
  });

  if (payload.planId) {
    const syncResult = await BranchService.syncBranchActivationToPlan(id);
    if (syncResult.activated.length > 0) {
      console.log(
        `Unlocked ${syncResult.activated.length} branches for Tenant ${id}`,
      );
    }
    if (syncResult.locked.length > 0) {
      console.log(
        `Locked ${syncResult.locked.length} excess branches for Tenant ${id}`,
      );
    }
  }

  const realBranchCount = await prisma.branch.count({
    where: { tenantId: id, deletedAt: null },
  });
  (updated as any)._count = {
    ...updated._count,
    branches: realBranchCount,
  };

  return updated;
};

const suspendTenant = async (id: string, payload: ISuspendTenantPayload) => {
  const isTenantExist = await prisma.tenant.findUnique({ where: { id } });
  if (!isTenantExist) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  if (!isTenantExist.isActive) {
    throw new AppError(status.CONFLICT, "Tenant is already suspended");
  }

  await prisma.$transaction(async (tx) => {
    // Suspend tenant
    await tx.tenant.update({
      where: { id },
      data: {
        isActive: false,
        suspendedAt: new Date(),
        suspensionReason: payload.reason,
      },
    });

    await tx.branch.updateMany({
      where: { tenantId: id, deletedAt: null },
      data: { isActive: false },
    });

    await tx.user.updateMany({
      where: {
        tenantId: id,
        role: { not: "TENANT_OWNER" },
        deletedAt: null,
      },
      data: { isActive: false },
    });
  });

  return { message: "Tenant suspended successfully" };
};

const activateTenant = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { plan: true },
  });

  if (!tenant) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  if (tenant.isActive) {
    throw new AppError(status.CONFLICT, "Tenant is already active");
  }

  await prisma.$transaction(async (tx) => {
    await tx.tenant.update({
      where: { id },
      data: {
        isActive: true,
        suspendedAt: null,
        suspensionReason: null,
      },
    });
  });

  // ─── FIX: Let the sync function decide which branches to activate ───
  const syncResult = await BranchService.syncBranchActivationToPlan(id);

  return {
    message: "Tenant activated successfully",
    branchesActivated: syncResult.activated.length,
    branchesLocked: syncResult.locked.length,
  };
};

const getTenantAnalytics = async (id: string) => {
  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  const [membersByRole, invitationsByStatus] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      where: { tenantId: id, isDeleted: false },
      _count: { _all: true },
    }),
    prisma.invitation.groupBy({
      by: ["status"],
      where: { tenantId: id },
      _count: { _all: true },
    }),
  ]);

  return {
    tenant,
    membersByRole: membersByRole.map((m) => ({
      role: m.role,
      count: m._count._all,
    })),
    invitationsByStatus: invitationsByStatus.map((i) => ({
      status: i.status,
      count: i._count._all,
    })),
  };
};

export const TenantService = {
  getAllTenants,
  getTenantById,
  updateTenant,
  suspendTenant,
  activateTenant,
  getTenantAnalytics,
};
