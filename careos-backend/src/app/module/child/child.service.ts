import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { generateChildCode } from "../../utils/childCode.util.js";
import {
  childFilterableFields,
  childIncludeConfig,
  childSearchableFields,
} from "./child.constant.js";
import type {
  IApplyForChildPayload,
  IApproveChildPayload,
  IRejectChildPayload,
  ILinkGuardianPayload,
  ISuspendChildPayload,
  IUpdatePickupPayload,
  ISelfLinkGuardianPayload,
  IAssignClassroomPayload,
} from "./child.interface.js";
import type { Prisma, Child } from "../../../generated/prisma/client.js";
import type { IQuery } from "../../interfaces/query.interface.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";

const applyForChild = async (
  payload: IApplyForChildPayload,
  guardianId: string,
  tenantId: string,
  branchId: string,
) => {
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch || !branch.isActive || branch.tenantId !== tenantId) {
    throw new AppError(status.FORBIDDEN, "Invalid branch");
  }

  const child = await prisma.$transaction(async (tx) => {
    const childCode = await generateChildCode(tenantId, tx);

    const created = await tx.child.create({
      data: {
        childCode,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dateOfBirth: new Date(payload.dateOfBirth),
        medicalNotes: payload.medicalNotes,
        allergies: payload.allergies,
        photoUrl: payload.photoUrl,
        tenantId,
        branchId,
      },
    });

    await tx.childGuardian.create({
      data: {
        childId: created.id,
        userId: guardianId,
        relationship: payload.relationship,
        isPrimary: true,
      },
    });

    return created;
  });

  return child;
};

const getAllChildren = async (
  query: IQuery,
  tenantId: string,
  branchId?: string,
  classroomId?: string,
) => {
  const scopedQuery: IQuery = { ...query, tenantId };
  if (branchId) scopedQuery.branchId = branchId;
  if (classroomId) scopedQuery.classroomId = classroomId;

  const queryBuilder = new QueryBuilder<
    Child,
    Prisma.ChildWhereInput,
    Prisma.ChildInclude
  >(prisma.child, scopedQuery, {
    searchableFields: childSearchableFields,
    filterableFields: childFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .dynamicInclude(childIncludeConfig as Prisma.ChildInclude)
    .sort()
    .fields()
    .execute();

  return result;
};

const getChildById = async (
  id: string,
  tenantId: string,
  branchId?: string,
  classroomId?: string,
) => {
  const child = await prisma.child.findUnique({
    where: { id },
    include: childIncludeConfig as Prisma.ChildInclude,
  });

  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }
  if (branchId && child.branchId !== branchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this child",
    );
  }
  if (classroomId && child.classroomId !== classroomId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this child",
    );
  }

  return child;
};

const getMyChildById = async (
  childId: string,
  guardianId: string,
  tenantId: string,
) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: childIncludeConfig as Prisma.ChildInclude,
  });

  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  const viewerLink = (child as any).guardians?.find(
    (g: any) => g.userId === guardianId,
  );

  if (!viewerLink) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this child",
    );
  }

  return { ...child, viewerLink };
};

const updatePickupPermission = async (
  childId: string,
  linkId: string,
  requesterId: string,
  tenantId: string,
  payload: IUpdatePickupPayload,
) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  const requesterLink = await prisma.childGuardian.findUnique({
    where: { childId_userId: { childId, userId: requesterId } },
  });
  if (!requesterLink) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this child",
    );
  }
  if (!requesterLink.isPrimary) {
    throw new AppError(
      status.FORBIDDEN,
      "Only the primary guardian can manage pickup permissions",
    );
  }

  const targetLink = await prisma.childGuardian.findUnique({
    where: { id: linkId },
  });
  if (!targetLink || targetLink.childId !== childId) {
    throw new AppError(status.NOT_FOUND, "Guardian link not found");
  }

  return prisma.childGuardian.update({
    where: { id: linkId },
    data: { canPickup: payload.canPickup },
  });
};

const selfUnlinkGuardian = async (
  childId: string,
  linkId: string,
  requesterId: string,
  tenantId: string,
) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  const requesterLink = await prisma.childGuardian.findUnique({
    where: { childId_userId: { childId, userId: requesterId } },
  });
  
  if (!requesterLink) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this child",
    );
  }
  
  if (!requesterLink.isPrimary) {
    throw new AppError(
      status.FORBIDDEN,
      "Only the primary guardian can remove other guardians",
    );
  }

  const targetLink = await prisma.childGuardian.findUnique({
    where: { id: linkId },
  });
  
  if (!targetLink || targetLink.childId !== childId) {
    throw new AppError(status.NOT_FOUND, "Guardian link not found");
  }
  
  if (targetLink.isPrimary) {
    throw new AppError(
      status.FORBIDDEN,
      "The primary guardian cannot be removed. Contact staff.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.childGuardian.delete({ where: { id: linkId } });


    if (targetLink.splitPercentage > 0) {
      await tx.childGuardian.update({
        where: { id: requesterLink.id },
        data: {
          splitPercentage: {
            increment: targetLink.splitPercentage,
          },
        },
      });
    }
  });

  return null;
};

const assertReviewable = async (
  id: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id } });

  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  if (child.status !== "APPLIED") {
    throw new AppError(
      status.CONFLICT,
      "This application has already been reviewed",
    );
  }

  return child;
};

const approveChild = async (
  id: string,
  payload: IApproveChildPayload,
  staffId: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await assertReviewable(id, tenantId, staffBranchId);

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (tenant?.planId) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: tenant.planId },
    });
    if (plan) {
      const enrolledCount = await prisma.child.count({
        where: { tenantId, status: "ENROLLED" },
      });
      if (enrolledCount >= plan.maxStudents) {
        throw new AppError(
          status.FORBIDDEN,
          `Your plan allows a maximum of ${plan.maxStudents} enrolled child(ren). Upgrade to enroll more.`,
        );
      }
    }
  }

  if (payload.classroomId) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: payload.classroomId },
      include: { _count: { select: { teacherAssignments: true } } },
    });
    if (!classroom || classroom.branchId !== child.branchId) {
      throw new AppError(
        status.BAD_REQUEST,
        "Invalid classroom for this branch",
      );
    }

    const currentCount = await prisma.child.count({
      where: { classroomId: payload.classroomId, status: "ENROLLED" },
    });

    if (currentCount >= classroom.legalCapacity) {
      throw new AppError(
        status.CONFLICT,
        `${classroom.name} is at capacity (${classroom.legalCapacity}). Choose another classroom or increase capacity.`,
      );
    }

    const teacherCount = classroom._count.teacherAssignments;
    const prospectiveCount = currentCount + 1;

    if (teacherCount === 0) {
      throw new AppError(
        status.CONFLICT,
        `${classroom.name} has no teacher assigned. Assign at least one teacher before enrolling children here.`,
      );
    }

    if (prospectiveCount > teacherCount * classroom.ratioLimit) {
      const teachersNeeded = Math.ceil(prospectiveCount / classroom.ratioLimit);
      throw new AppError(
        status.CONFLICT,
        `${classroom.name} needs at least ${teachersNeeded} teacher(s) to legally enroll a ${prospectiveCount}${prospectiveCount === 1 ? "st" : prospectiveCount === 2 ? "nd" : prospectiveCount === 3 ? "rd" : "th"} child at a 1:${classroom.ratioLimit} ratio. Currently has ${teacherCount}.`,
      );
    }
  }

  return prisma.child.update({
    where: { id },
    data: {
      status: "ENROLLED",
      classroomId: payload.classroomId,
      approvedById: staffId,
      approvedAt: new Date(),
      rejectionReason: null,
    },
  });
};

const rejectChild = async (
  id: string,
  payload: IRejectChildPayload,
  staffId: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  await assertReviewable(id, tenantId, staffBranchId);

  return prisma.child.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: payload.rejectionReason,
      approvedById: staffId,
      approvedAt: new Date(),
    },
  });
};
const linkGuardian = async (
  childId: string,
  payload: ILinkGuardianPayload,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });

  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.tenantId !== tenantId || user.role !== "GUARDIAN") {
    throw new AppError(status.BAD_REQUEST, "Invalid guardian account");
  }

  const existingLink = await prisma.childGuardian.findUnique({
    where: { childId_userId: { childId, userId: payload.userId } },
  });
  if (existingLink) {
    throw new AppError(
      status.CONFLICT,
      "This guardian is already linked to this child",
    );
  }

  return prisma.childGuardian.create({
    data: {
      childId,
      userId: payload.userId,
      relationship: payload.relationship,
      isPrimary: payload.isPrimary ?? false,
      canPickup: payload.canPickup ?? true,
      splitPercentage: 0, 
    },
  });
};

const unlinkGuardian = async (
  childId: string,
  linkId: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  const link = await prisma.childGuardian.findUnique({
    where: { id: linkId },
    include: { child: true },
  });

  if (!link || link.childId !== childId || link.child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Guardian link not found");
  }
  if (staffBranchId && link.child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  const remaining = await prisma.childGuardian.count({ where: { childId } });
  if (remaining <= 1) {
    throw new AppError(
      status.CONFLICT,
      "A child must have at least one guardian",
    );
  }

  await prisma.childGuardian.delete({ where: { id: linkId } });
  return null;
};
const assignClassroom = async (
  id: string,
  payload: IAssignClassroomPayload,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }
  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }
  if (!["ENROLLED", "WAITLISTED"].includes(child.status)) {
    throw new AppError(
      status.CONFLICT,
      "Only enrolled or waitlisted children can be assigned a classroom",
    );
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: payload.classroomId },
    include: { _count: { select: { teacherAssignments: true } } },
  });
  if (!classroom || classroom.branchId !== child.branchId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid classroom for this child's branch",
    );
  }

  const enrolledCount = await prisma.child.count({
    where: { classroomId: payload.classroomId, status: "ENROLLED" },
  });
  if (enrolledCount >= classroom.legalCapacity) {
    throw new AppError(
      status.CONFLICT,
      `${classroom.name} is at capacity (${classroom.legalCapacity}). Choose another classroom.`,
    );
  }

  const teacherCount = classroom._count.teacherAssignments;
  const prospectiveCount = enrolledCount + 1;
  if (teacherCount === 0) {
    throw new AppError(
      status.CONFLICT,
      `${classroom.name} has no teacher assigned. Assign a teacher before adding children.`,
    );
  }
  if (prospectiveCount > teacherCount * classroom.ratioLimit) {
    const teachersNeeded = Math.ceil(prospectiveCount / classroom.ratioLimit);
    throw new AppError(
      status.CONFLICT,
      `${classroom.name} needs at least ${teachersNeeded} teacher(s) to legally hold ${prospectiveCount} children at a 1:${classroom.ratioLimit} ratio. Currently has ${teacherCount}.`,
    );
  }

  return prisma.child.update({
    where: { id },
    data: { classroomId: payload.classroomId },
  });
};

const unassignClassroom = async (
  id: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }
  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }
  if (!child.classroomId) {
    throw new AppError(
      status.CONFLICT,
      "This child is not assigned to a classroom",
    );
  }

  return prisma.child.update({
    where: { id },
    data: { classroomId: null },
  });
};
const suspendChild = async (
  id: string,
  payload: ISuspendChildPayload,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }
  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }
  if (child.status !== "ENROLLED") {
    throw new AppError(
      status.CONFLICT,
      "Only enrolled children can be suspended",
    );
  }

  return prisma.child.update({
    where: { id },
    data: { status: "SUSPENDED", suspensionReason: payload.reason },
  });
};

const reactivateChild = async (
  id: string,
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }
  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }
  if (child.status !== "SUSPENDED") {
    throw new AppError(
      status.CONFLICT,
      "Only suspended children can be reactivated",
    );
  }

  return prisma.child.update({
    where: { id },
    data: { status: "ENROLLED", suspensionReason: null },
  });
};

const updateGuardianSplits = async (
  childId: string,
  splits: { linkId: string; splitPercentage: number }[],
  tenantId: string,
  staffBranchId?: string,
) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });

  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  if (staffBranchId && child.branchId !== staffBranchId) {
    throw new AppError(
      status.FORBIDDEN,
      "You do not have access to this branch",
    );
  }

  const totalSplit = splits.reduce((sum, split) => sum + split.splitPercentage, 0);
  if (totalSplit !== 100) {
    throw new AppError(
      status.BAD_REQUEST,
      `Financial custody splits must exactly equal 100%. Current total is ${totalSplit}%.`
    );
  }

  const transaction = splits.map((split) =>
    prisma.childGuardian.update({
      where: { id: split.linkId, childId },
      data: { splitPercentage: split.splitPercentage },
    })
  );

  await prisma.$transaction(transaction);

  return { message: "Custody billing splits updated successfully" };
};

export const ChildService = {
  applyForChild,
  getAllChildren,
  getChildById,
  getMyChildById,
  approveChild,
  rejectChild,
  linkGuardian,
  suspendChild,
  reactivateChild,
  unlinkGuardian,
  selfUnlinkGuardian,
  updatePickupPermission,
  assignClassroom,
  unassignClassroom,
  updateGuardianSplits
};
