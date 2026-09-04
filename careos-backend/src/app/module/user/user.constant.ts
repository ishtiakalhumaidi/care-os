import type { Prisma } from "../../../generated/prisma/client";

export const userSearchableFields = ["name", "email"];
export const userFilterableFields = [
  "tenantId",
  "branchId",
  "role",
  "isActive",
];

export const meIncludeConfig: Prisma.UserInclude = {
  branch: {
    select: {
      id: true,
      name: true,
      isActive: true,      
      deletedAt: true,     
    },
  },
  classroom: { select: { id: true, name: true } },
  guardianProfile: {
    include: {
      child: {
        select: {
          id: true,
          childCode: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          photoUrl: true,
          status: true,
          rejectionReason: true,
          suspensionReason: true,
          branch: { select: { id: true, name: true } },
          classroom: { select: { id: true, name: true } },
        },
      },
    },
  },
};