import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { AuthService } from "../auth/auth.service.js";
import type {
  ICreateGuardianRequestPayload,
  IDenyGuardianRequestPayload,
} from "./guardianRequest.interface.js";

const createRequest = async (
  childId: string,
  requesterId: string,
  tenantId: string,
  payload: ICreateGuardianRequestPayload,
) => {
  const link = await prisma.childGuardian.findFirst({
    where: { childId, userId: requesterId },
  });
  if (!link) {
    throw new AppError(status.FORBIDDEN, "You are not a guardian of this child");
  }
  if (!link.isPrimary) {
    throw new AppError(
      status.FORBIDDEN,
      "Only the primary guardian can request a new co-guardian",
    );
  }

  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    const alreadyLinked = await prisma.childGuardian.findFirst({
      where: { childId, userId: existingUser.id },
    });
    if (alreadyLinked) {
      throw new AppError(status.CONFLICT, "This person is already a guardian of this child");
    }
  }

  const pending = await prisma.guardianRequest.findFirst({
    where: { childId, email: payload.email, status: "PENDING" },
  });
  if (pending) {
    throw new AppError(status.CONFLICT, "A request for this email is already pending");
  }

  return prisma.guardianRequest.create({
    data: {
      childId,
      requestedById: requesterId,
      email: payload.email,
      relationship: payload.relationship,
      canPickup: payload.canPickup ?? true,
    },
  });
};

const getRequestsForChild = async (childId: string, tenantId: string) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  return prisma.guardianRequest.findMany({
    where: { childId },
    include: { requestedBy: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getPendingRequests = async (tenantId: string, branchId?: string) => {
  return prisma.guardianRequest.findMany({
    where: {
      status: "PENDING",
      child: { tenantId, ...(branchId ? { branchId } : {}) },
    },
    include: {
      child: { select: { id: true, firstName: true, lastName: true, branchId: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
};

const approveRequest = async (
  requestId: string,
  staffId: string,
  tenantId: string,
  staffRole: string,
  staffBranchId?: string,
) => {
  const request = await prisma.guardianRequest.findUnique({
    where: { id: requestId },
    include: { child: true },
  });
  if (!request || request.child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Request not found");
  }
  if (request.status !== "PENDING") {
    throw new AppError(status.CONFLICT, "This request has already been reviewed");
  }
  if (staffBranchId && request.child.branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  const invitation = await AuthService.inviteUser(
    {
      email: request.email,
      role: "GUARDIAN",
      tenantId,
      branchId: request.child.branchId,
      childId: request.childId,
      relationship: request.relationship,
    } as any,
    staffRole,
    staffBranchId,
  );

  await prisma.guardianRequest.update({
    where: { id: requestId },
    data: { status: "ACCEPTED" },
  });

  return invitation;
};

const denyRequest = async (
  requestId: string,
  tenantId: string,
  staffBranchId: string | undefined,
  payload: IDenyGuardianRequestPayload,
) => {
  const request = await prisma.guardianRequest.findUnique({
    where: { id: requestId },
    include: { child: true },
  });
  if (!request || request.child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Request not found");
  }
  if (request.status !== "PENDING") {
    throw new AppError(status.CONFLICT, "This request has already been reviewed");
  }
  if (staffBranchId && request.child.branchId !== staffBranchId) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this branch");
  }

  return prisma.guardianRequest.update({
    where: { id: requestId },
    data: { status: "DENIED" },
  });
};

export const GuardianRequestService = {
  createRequest,
  getRequestsForChild,
  getPendingRequests,
  approveRequest,
  denyRequest,
};