import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import {
  meIncludeConfig,
  userFilterableFields,
  userSearchableFields,
} from "./user.constant.js";
import type { IUpdateMePayload } from "./user.interface.js";
import type { Prisma, User } from "../../../generated/prisma/client.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import type { IQuery } from "../../interfaces/query.interface.js";

export const assertUserCanLogin = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true, branch: true },
  });

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Account not found");
  }
  if (user.isDeleted) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been removed. Please contact support.",
    );
  }
  if (!user.isActive) {
    throw new AppError(
      status.FORBIDDEN,
      "Your account has been deactivated. Please contact your administrator.",
    );
  }

  if (user.tenant) {
    if (!user.tenant.isActive || user.tenant.suspendedAt) {
      throw new AppError(
        status.FORBIDDEN,
        "Your organization account has been suspended. Please contact support.",
      );
    }
  }

  // ─── FIX: Also reject soft-deleted branches ───
  if (
    user.branch &&
    (!user.branch.isActive || user.branch.deletedAt)
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Your branch has been deactivated. Please contact your administrator.",
    );
  }

  return user;
};

const getAllUsers = async (
  query: IQuery,
  tenantId: string,
  userRole?: string,
  staffBranchId?: string,
) => {
  const baseWhere: any = { tenantId, isDeleted: false };

  if (userRole === "CENTER_ADMIN" && staffBranchId) {
    baseWhere.branchId = staffBranchId;
  }

  if (query.isActive !== undefined) {
    baseWhere.isActive =
      query.isActive === "true" || query.isActive === true;
  } else {
    baseWhere.isActive = true;
  }

  const scopedQuery = { ...query, ...baseWhere };

  const queryBuilder = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, scopedQuery, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .execute();

  result.data = result.data.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    branchId: u.branchId,
    isActive: u.isActive, 
  }));

  return result;
};

const updateMe = async (userId: string, payload: IUpdateMePayload) => {
  await assertUserCanLogin(userId);

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: payload,
    include: meIncludeConfig as Prisma.UserInclude,
  });

  return updated;
};

const getMe = async (userId: string) => {
  await assertUserCanLogin(userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: meIncludeConfig as Prisma.UserInclude,
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

export const UserService = {
  getMe,
  updateMe,
  getAllUsers,
  assertUserCanLogin,
};
