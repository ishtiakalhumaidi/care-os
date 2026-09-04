import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type { ICreatePlanPayload, IUpdatePlanPayload } from "./plan.interface.js";

const createPlan = async (payload: ICreatePlanPayload) => {
  const existing = await prisma.subscriptionPlan.findUnique({
    where: { name: payload.name },
  });
  if (existing) {
    throw new AppError(status.CONFLICT, "A plan with this name already exists");
  }

  if (payload.price === 0) {
    const existingFree = await prisma.subscriptionPlan.findFirst({
      where: { price: 0 },
    });
    if (existingFree) {
      throw new AppError(
        status.CONFLICT,
        `A Free plan already exists (${existingFree.name}). Only one plan can have a price of 0.`,
      );
    }
  }

  return prisma.subscriptionPlan.create({ data: payload });
};

const getAllPlans = async () => {
  return prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { tenants: true } } },
  });
};

const updatePlan = async (id: string, payload: IUpdatePlanPayload) => {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) {
    throw new AppError(status.NOT_FOUND, "Plan not found");
  }

  if (payload.price === 0 && plan.price !== 0) {
    const existingFree = await prisma.subscriptionPlan.findFirst({
      where: { price: 0, id: { not: id } },
    });
    if (existingFree) {
      throw new AppError(
        status.CONFLICT,
        `A Free plan already exists (${existingFree.name}). Only one plan can have a price of 0.`,
      );
    }
  }

  if (payload.maxBranches !== undefined) {
    const tenantsOnPlan = await prisma.tenant.findMany({
      where: { planId: id },
      select: { id: true, name: true },
    });

    for (const t of tenantsOnPlan) {
      const branchCount = await prisma.branch.count({
        where: { tenantId: t.id, deletedAt: null },
      });

      if (branchCount > payload.maxBranches) {
        throw new AppError(
          status.CONFLICT,
          `Cannot lower maxBranches below what "${t.name}" already uses (${branchCount}). Deleted branches do not count.`,
        );
      }
    }
  }

  if (payload.maxStudents !== undefined) {
    const tenants = await prisma.tenant.findMany({
      where: { planId: id },
      select: { id: true, name: true },
    });
    for (const t of tenants) {
      const enrolledCount = await prisma.child.count({
        where: { tenantId: t.id, status: "ENROLLED" },
      });
      if (enrolledCount > payload.maxStudents) {
        throw new AppError(
          status.CONFLICT,
          `Cannot lower maxStudents below what "${t.name}" already uses (${enrolledCount})`,
        );
      }
    }
  }

  return prisma.subscriptionPlan.update({ where: { id }, data: payload });
};

const deletePlan = async (id: string) => {
  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan) {
    throw new AppError(status.NOT_FOUND, "Plan not found");
  }

  if (plan.price === 0) {
    throw new AppError(
      status.FORBIDDEN,
      "Cannot delete the Free plan. It is required for subscription downgrades.",
    );
  }

  const tenantCount = await prisma.tenant.count({ where: { planId: id } });
  if (tenantCount > 0) {
    throw new AppError(
      status.CONFLICT,
      `Cannot delete a plan used by ${tenantCount} tenant(s)`,
    );
  }

  await prisma.subscriptionPlan.delete({ where: { id } });
  return null;
};

const seedDefaultPlans = async () => {
  const defaults = [
    { name: "Free", price: 0, maxBranches: 1, maxStudents: 10 },
    { name: "Starter", price: 49, maxBranches: 1, maxStudents: 30 },
    { name: "Growth", price: 149, maxBranches: 3, maxStudents: 120 },
    { name: "Enterprise", price: 399, maxBranches: 10, maxStudents: 500 },
  ];

  for (const plan of defaults) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  return getAllPlans();
};

export const PlanService = {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
  seedDefaultPlans,
};