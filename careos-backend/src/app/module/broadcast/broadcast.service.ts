import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import type {
  BroadcastAudience,
  BroadcastPriority,
} from "../../../generated/prisma/enums";
import { getIO } from "../../lib/socket.js";

interface ICreateBroadcastPayload {
  title: string;
  body: string;
  priority: BroadcastPriority;
  audience: BroadcastAudience;
  branchId?: string;
  classroomId?: string;
}

const createBroadcast = async (user: any, payload: ICreateBroadcastPayload) => {
  if (payload.audience === "BRANCH" && !payload.branchId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Branch ID is required for BRANCH audience.",
    );
  }
  if (payload.audience === "CLASSROOM" && !payload.classroomId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Classroom ID is required for CLASSROOM audience.",
    );
  }

  const broadcast = await prisma.broadcast.create({
    data: {
      title: payload.title,
      body: payload.body,
      priority: payload.priority,
      audience: payload.audience,
      tenantId: user.tenantId,
      branchId: payload.branchId || null,
      classroomId: payload.classroomId || null,
      createdBy: user.id,
    },
    include: {
      creator: {
        select: { id: true, name: true, role: true, image: true },
      },
    },
  });

  let roomName = `tenant_${user.tenantId}`;
  if (payload.audience === "BRANCH") {
    roomName = `branch_${payload.branchId}`;
  } else if (payload.audience === "CLASSROOM") {
    roomName = `classroom_${payload.classroomId}`;
  }

  const io = getIO();
  io.to(roomName).emit("new_broadcast", broadcast);

  return broadcast;
};

const getActiveBroadcasts = async (user: any) => {
  let whereClause: any = { tenantId: user.tenantId };

  if (user.role === "TENANT_OWNER" || user.role === "SUPER_ADMIN") {
    whereClause = { tenantId: user.tenantId };
  } else {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        classroom: { select: { id: true } },
        guardianProfile: {
          include: { child: { select: { branchId: true, classroomId: true } } },
        },
      },
    });

    const accessibleBranchIds = new Set<string>();
    const accessibleClassroomIds = new Set<string>();

    if (fullUser?.branchId) accessibleBranchIds.add(fullUser.branchId);

    if (fullUser?.classroom) {
      const classrooms = Array.isArray(fullUser.classroom)
        ? fullUser.classroom
        : [fullUser.classroom];
      classrooms.forEach((c: any) => accessibleClassroomIds.add(c.id));
    }

    if (fullUser?.guardianProfile) {
      fullUser.guardianProfile.forEach((g: any) => {
        if (g.child?.branchId) accessibleBranchIds.add(g.child.branchId);
        if (g.child?.classroomId)
          accessibleClassroomIds.add(g.child.classroomId);
      });
    }

    if (user.role === "CENTER_ADMIN" && fullUser?.branchId) {
      const branchClassrooms = await prisma.classroom.findMany({
        where: { branchId: fullUser.branchId },
        select: { id: true },
      });
      branchClassrooms.forEach((c: any) => accessibleClassroomIds.add(c.id));
    }

    whereClause = {
      tenantId: user.tenantId,
      OR: [
        { audience: "TENANT" },
        {
          audience: "BRANCH",
          branchId: { in: Array.from(accessibleBranchIds) },
        },
        {
          audience: "CLASSROOM",
          classroomId: { in: Array.from(accessibleClassroomIds) },
        },
      ],
    };
  }

  const broadcasts = await prisma.broadcast.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      creator: { select: { id: true, name: true, role: true } },
      acknowledgments: {
        where: { userId: user.id },
        select: { id: true },
      },
      _count: {
        select: { acknowledgments: true },
      },
    },
  });

  return broadcasts.map((b) => ({
    ...b,
    isAcknowledged: b.acknowledgments.length > 0,
    totalAcknowledgments: b._count.acknowledgments,
  }));
};

const acknowledgeBroadcast = async (userId: string, broadcastId: string) => {
  const ack = await prisma.broadcastAcknowledgment.upsert({
    where: {
      broadcastId_userId: { broadcastId, userId },
    },
    update: {},
    create: {
      broadcastId,
      userId,
    },
  });

  return ack;
};

export const BroadcastService = {
  createBroadcast,
  getActiveBroadcasts,
  acknowledgeBroadcast,
};
