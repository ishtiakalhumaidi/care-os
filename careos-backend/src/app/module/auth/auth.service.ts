import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { auth } from "../../lib/auth.js";
import { TokenUtils } from "../../utils/token.js";
import {
  ILoginPayload,
  IChangePasswordPayload,
  IRegisterTenantOwnerPayload,
  type IAcceptInvitePayload,
  type IForgetPasswordPayload,
  type IInviteUserPayload,
  type IResetPasswordPayload,
} from "./auth.interface.js";
import { envVars } from "../../config/env.js";
import { randomBytes } from "crypto";
import { sendTemplatedEmail } from "../../utils/emailSender.js";
import type { Prisma, Invitation } from "../../../generated/prisma/client.js";
import type { IQuery } from "../../interfaces/query.interface.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import {
  ENUM_USER_ROLE,
  invitationFilterableFields,
  invitationSearchableFields,
} from "./auth.constant.js";
import { generateUniqueTenantSlug } from "../../utils/generateUniqueTenantSlug.js";

const getDefaultFreePlanId = async () => {
  const freePlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Free" },
  });
  return freePlan?.id ?? null;
};

const registerTenantOwner = async (payload: IRegisterTenantOwnerPayload) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new AppError(
      status.CONFLICT,
      "An account with this email already exists",
    );
  }

  const slug = await generateUniqueTenantSlug(payload.tenantName);

  const tenant = await prisma.tenant.create({
    data: {
      name: payload.tenantName,
      slug,
      planId: payload.planId ?? (await getDefaultFreePlanId()),
    },
  });

  try {
    await auth.api.signUpEmail({
      body: {
        email: payload.email,
        password: payload.password,
        name: payload.name,
      },
    });
  } catch (error) {
    await prisma.tenant.delete({ where: { id: tenant.id } });
    throw new AppError(
      status.BAD_REQUEST,
      "Failed to create your account. Please try again.",
    );
  }

  const user = await prisma.user.update({
    where: { email: payload.email },
    data: {
      role: ENUM_USER_ROLE.TENANT_OWNER as any,
      tenantId: tenant.id,
    },
  });

  return { user, tenant };
};

const resolvePasswordChange = async (
  userId: string,
  payload: IChangePasswordPayload,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, isDeleted: false },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await auth.api.changePassword({
    body: {
      newPassword: payload.newPassword,
      currentPassword: payload.oldPassword || "",
    },
    headers: new Headers({
      "x-user-id": userId,
    }),
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      needPasswordChange: false,
    },
  });

  return null;
};
const forgetPassword = async (payload: IForgetPasswordPayload) => {
  const response = await auth.api.sendVerificationOTP({
    body: {
      email: payload.email,
      type: "forget-password",
    },
  });
  return response;
};

const resetPassword = async (payload: IResetPasswordPayload) => {
  const response = await auth.api.resetPasswordEmailOTP({
    body: {
      email: payload.email,
      otp: payload.otp,
      password: payload.newPassword,
    },
  });
  return response;
};

const inviteUser = async (
  payload: IInviteUserPayload,
  inviterRole: string,
  inviterBranchId?: string,
) => {
  if (
    inviterRole === ENUM_USER_ROLE.CENTER_ADMIN &&
    payload.role === ENUM_USER_ROLE.CENTER_ADMIN
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Center Admins cannot invite other Center Admins",
    );
  }

  if (
    inviterRole === ENUM_USER_ROLE.CENTER_ADMIN &&
    payload.branchId !== inviterBranchId
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only invite people into your own branch",
    );
  }

  const isTenantExist = await prisma.tenant.findUnique({
    where: { id: payload.tenantId },
  });

  if (!isTenantExist) {
    throw new AppError(status.NOT_FOUND, "Tenant not found");
  }

  if (!isTenantExist.isActive) {
    throw new AppError(status.FORBIDDEN, "Tenant is suspended");
  }

  const branch = await prisma.branch.findUnique({
    where: { id: payload.branchId },
  });
  if (!branch || branch.tenantId !== payload.tenantId) {
    throw new AppError(status.NOT_FOUND, "Branch not found");
  }
  if (!branch.isActive || branch.deletedAt) {
    throw new AppError(status.FORBIDDEN, "This branch is no longer active");
  }

  if (payload.classroomId) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: payload.classroomId },
    });
    if (!classroom || classroom.branchId !== payload.branchId) {
      throw new AppError(status.BAD_REQUEST, "Invalid classroom for this branch");
    }
  }

  if (payload.childId) {
    const child = await prisma.child.findUnique({
      where: { id: payload.childId },
    });
    if (!child || child.branchId !== payload.branchId || child.tenantId !== payload.tenantId) {
      throw new AppError(status.BAD_REQUEST, "Invalid child for this branch");
    }
  }

  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    throw new AppError(status.CONFLICT, "User already exists in the system");
  }

  const existingInvite = await prisma.invitation.findFirst({
    where: {
      email: payload.email,
      tenantId: payload.tenantId,
      status: "PENDING",
    },
  });
  if (existingInvite) {
    throw new AppError(
      status.CONFLICT,
      "An invitation is already pending for this email",
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      email: payload.email,
      role: payload.role,
      token,
      expiresAt,
      tenantId: payload.tenantId,
      branchId: payload.branchId,
      classroomId: payload.classroomId,
      childId: payload.childId,
      relationship: payload.relationship,
    },
  });

  const inviteLink = `${envVars.FRONTEND_URL}/accept-invite?token=${token}`;
  await sendTemplatedEmail({
    to: payload.email,
    subject: `You've been invited to join ${isTenantExist.name} on CareOS`,
    templateName: "invite",
    templateData: {
      tenantName: isTenantExist.name,
      role: payload.role,
      inviteLink,
    },
  });

  return invitation;
};

const acceptInvite = async (payload: IAcceptInvitePayload) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token: payload.token },
  });

  if (!invitation) {
    throw new AppError(status.NOT_FOUND, "Invalid invitation link");
  }

  if (invitation.status === "ACCEPTED") {
    throw new AppError(
      status.CONFLICT,
      "This invitation has already been used",
    );
  }

  if (invitation.status === "EXPIRED" || invitation.expiresAt < new Date()) {
    if (invitation.status !== "EXPIRED") {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
    }
    throw new AppError(
      status.GONE,
      "This invitation has expired. Ask your admin to resend it.",
    );
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: invitation.tenantId },
  });
  if (!tenant || !tenant.isActive) {
    throw new AppError(status.FORBIDDEN, "This organization is no longer active");
  }

  if (invitation.branchId) {
    const branch = await prisma.branch.findUnique({
      where: { id: invitation.branchId },
    });
    if (!branch || !branch.isActive || branch.deletedAt || branch.tenantId !== invitation.tenantId) {
      throw new AppError(status.FORBIDDEN, "The branch for this invitation is no longer available");
    }
  }

  if (invitation.classroomId) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: invitation.classroomId },
    });
    if (!classroom || classroom.branchId !== invitation.branchId) {
      throw new AppError(status.BAD_REQUEST, "Invalid invitation: classroom no longer exists in this branch");
    }
  }

  if (invitation.childId) {
    const child = await prisma.child.findUnique({
      where: { id: invitation.childId },
    });
    if (!child || child.branchId !== invitation.branchId || child.tenantId !== invitation.tenantId) {
      throw new AppError(status.BAD_REQUEST, "Invalid invitation: child no longer exists in this branch");
    }
  }

  const isUserExist = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (isUserExist) {
    throw new AppError(
      status.CONFLICT,
      "An account with this email already exists",
    );
  }

  await auth.api.signUpEmail({
    body: {
      email: invitation.email,
      password: payload.password,
      name: payload.name,
    },
  });

  const updatedUser = await prisma.user.update({
    where: { email: invitation.email },
    data: {
      role: invitation.role,
      branchId: invitation.branchId,
      classroomId: invitation.classroomId,
      tenantId: invitation.tenantId,
      emailVerified: true,
    },
  });

  if (invitation.role === ENUM_USER_ROLE.GUARDIAN && invitation.childId) {
    await prisma.childGuardian.create({
      data: {
        childId: invitation.childId,
        userId: updatedUser.id,
        relationship: invitation.relationship || "Guardian",
      },
    });
  }

  const acceptedInvitation = await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: "ACCEPTED",
      acceptedUserId: updatedUser.id,
    },
  });

  return { user: updatedUser, invitation: acceptedInvitation };
};

const loginUser = async (payload: ILoginPayload) => {
  try {
    await auth.api.signInEmail({
      body: {
        email: payload.email,
        password: payload.password,
      },
    });
  } catch (error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: { tenant: true, branch: true }, // ← FIX: need branch status
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  if (user.isDeleted) {
    throw new AppError(status.FORBIDDEN, "This account has been deleted");
  }

  if (!user.isActive) {
    throw new AppError(status.FORBIDDEN, "This account has been suspended");
  }

  if (user.tenant) {
    if (!user.tenant.isActive) {
      if (user.role === ENUM_USER_ROLE.TENANT_OWNER) {
        throw new AppError(
          status.FORBIDDEN,
          `Your CareOS subscription has been suspended${
            user.tenant.suspensionReason ? `: ${user.tenant.suspensionReason}` : ""
          }. Please contact CareOS support for assistance.`,
        );
      }
      throw new AppError(
        status.FORBIDDEN,
        "This center's account is currently inactive. Please contact your center admin or owner.",
      );
    }
  }

  if (user.branch && !user.branch.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "Your branch has been deactivated. Please contact your administrator.",
    );
  }

  const tokens = TokenUtils.generateAuthTokens(user);

  return { user, ...tokens };
};

const refreshAccessToken = async (refreshToken: string) => {
  let decoded;
  try {
    decoded = TokenUtils.verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(status.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    include: { tenant: true, branch: true }, 
  });

  if (!user || user.isDeleted || !user.isActive) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session");
  }

  if (user.tenant && !user.tenant.isActive) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session");
  }
  if (user.branch && !user.branch.isActive) {
    throw new AppError(status.UNAUTHORIZED, "Invalid session");
  }

  return TokenUtils.generateAuthTokens(user);
};

const getAllInvitations = async (
  query: IQuery,
  tenantId: string,
  branchId?: string,
) => {
  const scopedQuery: IQuery = branchId
    ? { ...query, tenantId, branchId }
    : { ...query, tenantId };

  const queryBuilder = new QueryBuilder<
    Invitation,
    Prisma.InvitationWhereInput,
    Prisma.InvitationInclude
  >(prisma.invitation, scopedQuery, {
    searchableFields: invitationSearchableFields,
    filterableFields: invitationFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .fields()
    .execute();
  return result;
};

const revokeInvitation = async (id: string, tenantId: string) => {
  const invitation = await prisma.invitation.findUnique({ where: { id } });

  if (!invitation || invitation.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Invitation not found");
  }

  if (invitation.status === "ACCEPTED") {
    throw new AppError(
      status.CONFLICT,
      "Cannot revoke an already-accepted invitation",
    );
  }

  await prisma.invitation.delete({ where: { id } });
  return null;
};
export const AuthService = {
  registerTenantOwner,
  loginUser,
  refreshAccessToken,
  resolvePasswordChange,
  forgetPassword,
  resetPassword,
  inviteUser,
  acceptInvite,
  getAllInvitations,
  revokeInvitation,
};
