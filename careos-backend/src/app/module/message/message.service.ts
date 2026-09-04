import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import httpStatus from "http-status";

/* ─── helpers ─── */

const assertUserEligible = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true, branch: true },
  });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");
  if (!user.isActive || user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is inactive");
  }
  if (user.branch && (!user.branch.isActive || user.branch.deletedAt)) {
    throw new AppError(httpStatus.FORBIDDEN, "Your branch is inactive");
  }
  if (user.tenant && !user.tenant.isActive) {
    throw new AppError(httpStatus.FORBIDDEN, "Your tenant is suspended");
  }
  return user;
};

const assertConversationAccess = async (
  conversationId: string,
  userId: string,
  userRole: string,
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { select: { id: true } },
      child: {
        select: {
          id: true,
          branchId: true,
          tenantId: true,
          classroomId: true,
          branch: { select: { isActive: true, deletedAt: true, tenantId: true } },
          guardians: { where: { userId }, select: { id: true } },
        },
      },
      classroom: {
        select: {
          id: true,
          branchId: true,
          branch: { select: { tenantId: true, isActive: true, deletedAt: true } },
          teacherAssignments: { where: { teacherId: userId }, select: { id: true } },
        },
      },
    },
  });

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  if (conversation.isDirectMessage) {
    const isParticipant = conversation.participants.some((p) => p.id === userId);
    if (!isParticipant) {
      throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
    }
    return;
  }

  if (conversation.childId) {
    const child = conversation.child;
    if (!child) {
      throw new AppError(httpStatus.NOT_FOUND, "Child not found");
    }
    if (child.branch.deletedAt || !child.branch.isActive) {
      throw new AppError(httpStatus.FORBIDDEN, "Branch is inactive");
    }

    if (userRole === "GUARDIAN" && child.guardians.length > 0) return;
    if (userRole === "TEACHER" && child.classroomId) {
      const isAssigned = await prisma.classroomTeacher.findUnique({
        where: {
          classroomId_teacherId: { classroomId: child.classroomId, teacherId: userId },
        },
      });
      if (isAssigned) return;
    }
    if (userRole === "CENTER_ADMIN") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { branchId: true } });
      if (user?.branchId === child.branchId) return;
    }
    if (userRole === "TENANT_OWNER") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
      if (user?.tenantId === child.tenantId) return;
    }
    if (userRole === "SUPER_ADMIN") return;

    throw new AppError(httpStatus.FORBIDDEN, "Not authorized for this conversation");
  }

  if (conversation.classroomId) {
    const classroom = conversation.classroom;
    if (!classroom) {
      throw new AppError(httpStatus.NOT_FOUND, "Classroom not found");
    }
    if (classroom.branch.deletedAt || !classroom.branch.isActive) {
      throw new AppError(httpStatus.FORBIDDEN, "Branch is inactive");
    }

    if (userRole === "TEACHER" && classroom.teacherAssignments.length > 0) return;
    if (userRole === "CENTER_ADMIN") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { branchId: true } });
      if (user?.branchId === classroom.branchId) return;
    }
    if (userRole === "TENANT_OWNER") {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
      if (user?.tenantId === classroom.branch.tenantId) return;
    }
    if (userRole === "SUPER_ADMIN") return;

    throw new AppError(httpStatus.FORBIDDEN, "Not authorized for this conversation");
  }

  throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
};

/* ─── conversations ─── */

const getUserConversations = async (userId: string, role: string) => {
  const user = await assertUserEligible(userId);

  const conditions: any[] = [
    { isDirectMessage: true, participants: { some: { id: userId } } },
  ];

  if (role === "GUARDIAN") {
    conditions.push({
      childId: { not: null },
      child: {
        guardians: { some: { userId } },
        branch: { isActive: true, deletedAt: null },
      },
    });
  }

  if (role === "TEACHER" && user.branchId) {
    conditions.push({
      classroomId: { not: null },
      classroom: {
        teacherAssignments: { some: { teacherId: userId } },
        branch: { isActive: true, deletedAt: null },
      },
    });
    conditions.push({
      childId: { not: null },
      child: {
        classroom: { teacherAssignments: { some: { teacherId: userId } } },
        branch: { isActive: true, deletedAt: null },
      },
    });
  }

  if (role === "CENTER_ADMIN" && user.branchId) {
    conditions.push({
      classroomId: { not: null },
      classroom: {
        branchId: user.branchId,
        branch: { isActive: true, deletedAt: null },
      },
    });
    conditions.push({
      childId: { not: null },
      child: {
        branchId: user.branchId,
        branch: { isActive: true, deletedAt: null },
      },
    });
  }

  if (role === "TENANT_OWNER" && user.tenantId) {
    conditions.push({
      classroomId: { not: null },
      classroom: {
        branch: { tenantId: user.tenantId, isActive: true, deletedAt: null },
      },
    });
    conditions.push({
      childId: { not: null },
      child: {
        tenantId: user.tenantId,
        branch: { isActive: true, deletedAt: null },
      },
    });
  }

  if (role === "SUPER_ADMIN") {
    conditions.push({ childId: { not: null } });
    conditions.push({ classroomId: { not: null } });
  }

  return prisma.conversation.findMany({
    where: { OR: conditions },
    include: {
      child: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      },
      classroom: { select: { id: true, name: true } },
      participants: {
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
          lastActiveAt: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, readAt: null } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
};

/* ─── contacts ─── */

const getPermittedContacts = async (user: any) => {
  let contacts: any[] = [];
  let classrooms: any[] = [];

  const activeUserWhere = { isActive: true, isDeleted: false };

  switch (user.role) {
    case "TEACHER": {
      const myClassrooms = await prisma.classroomTeacher.findMany({
        where: { teacherId: user.id },
        select: { classroomId: true },
      });
      const myClassroomIds = myClassrooms.map((c) => c.classroomId);

      contacts = await prisma.user.findMany({
        where: {
          OR: [
            {
              role: "TEACHER",
              classroomAssignments: {
                some: { classroomId: { in: myClassroomIds } },
              },
            },
            {
              role: "CENTER_ADMIN",
              branchId: user.branchId,
              branch: { isActive: true, deletedAt: null },
            },
            {
              role: "TENANT_OWNER",
              tenantId: user.tenantId,
              tenant: { isActive: true },
            },
          ],
          id: { not: user.id },
          ...activeUserWhere,
        },
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
        },
      });

      classrooms = await prisma.classroom.findMany({
        where: {
          id: { in: myClassroomIds },
          branch: { isActive: true, deletedAt: null },
        },
        select: { id: true, name: true },
      });
      break;
    }

    case "CENTER_ADMIN": {
      contacts = await prisma.user.findMany({
        where: {
          OR: [
            {
              role: "TEACHER",
              branchId: user.branchId,
              branch: { isActive: true, deletedAt: null },
            },
            {
              role: "TENANT_OWNER",
              tenantId: user.tenantId,
              tenant: { isActive: true },
            },
            { role: "SUPER_ADMIN", ...activeUserWhere },
          ],
          id: { not: user.id },
          ...activeUserWhere,
        },
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
        },
      });

      classrooms = await prisma.classroom.findMany({
        where: {
          branchId: user.branchId,
          branch: { isActive: true, deletedAt: null },
        },
        select: { id: true, name: true },
      });
      break;
    }

    case "TENANT_OWNER": {
      contacts = await prisma.user.findMany({
        where: {
          OR: [
            {
              role: "CENTER_ADMIN",
              tenantId: user.tenantId,
              tenant: { isActive: true },
            },
            {
              role: "TEACHER",
              tenantId: user.tenantId,
              tenant: { isActive: true },
            },
            { role: "SUPER_ADMIN", ...activeUserWhere },
          ],
          id: { not: user.id },
          ...activeUserWhere,
        },
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
        },
      });

      classrooms = await prisma.classroom.findMany({
        where: {
          branch: { tenantId: user.tenantId, isActive: true, deletedAt: null },
        },
        select: { id: true, name: true },
      });
      break;
    }

    case "SUPER_ADMIN": {
      contacts = await prisma.user.findMany({
        where: {
          OR: [{ role: "TENANT_OWNER" }, { role: "CENTER_ADMIN" }],
          ...activeUserWhere,
        },
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
        },
      });
      break;
    }

    case "GUARDIAN": {
      const guardianLinks = await prisma.childGuardian.findMany({
        where: {
          userId: user.id,
          child: { branch: { isActive: true, deletedAt: null } },
        },
        select: {
          child: { select: { branchId: true, tenantId: true } },
        },
      });

      const branchIds = [
        ...new Set(guardianLinks.map((l) => l.child.branchId).filter(Boolean)),
      ] as string[];
      const tenantIds = [
        ...new Set(guardianLinks.map((l) => l.child.tenantId).filter(Boolean)),
      ] as string[];

      if (branchIds.length === 0 && tenantIds.length === 0) {
        return { contacts: [], classrooms: [] };
      }

      contacts = await prisma.user.findMany({
        where: {
          OR: [
            {
              role: "CENTER_ADMIN",
              branchId: { in: branchIds },
              branch: { isActive: true, deletedAt: null },
            },
            {
              role: "TENANT_OWNER",
              tenantId: { in: tenantIds },
              tenant: { isActive: true },
            },
            {
              role: "TEACHER",
              branchId: { in: branchIds },
              branch: { isActive: true, deletedAt: null },
            },
          ],
          ...activeUserWhere,
        },
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
        },
      });
      break;
    }
  }

  return { contacts, classrooms };
};

/* ─── direct messages ─── */

const getOrCreateDirectMessage = async (
  userId: string,
  targetUserId: string,
  userRole: string,
) => {
  if (userId === targetUserId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot message yourself");
  }

  await assertUserEligible(userId);

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { tenant: true, branch: true },
  });
  if (!target) throw new AppError(httpStatus.NOT_FOUND, "Target user not found");
  if (!target.isActive || target.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "Target user is inactive");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const permitted = await getPermittedContacts(user);
  const isPermitted = permitted.contacts.some((c: any) => c.id === targetUserId);
  if (!isPermitted) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to message this user",
    );
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      isDirectMessage: true,
      AND: [
        { participants: { some: { id: userId } } },
        { participants: { some: { id: targetUserId } } },
      ],
    },
    include: {
      participants: { select: { id: true, name: true, image: true } },
      child: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      },
      classroom: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, readAt: null } },
        },
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        isDirectMessage: true,
        participants: { connect: [{ id: userId }, { id: targetUserId }] },
      },
      include: {
        participants: { select: { id: true, name: true, image: true } },
        child: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
        classroom: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
        _count: {
          select: {
            messages: { where: { senderId: { not: userId }, readAt: null } },
          },
        },
      },
    });
  }
  return conversation;
};

/* ─── classroom conversations ─── */

const getOrCreateClassroomConversation = async (
  classroomId: string,
  userId: string,
  userRole: string,
) => {
  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
    include: { branch: true },
  });
  if (!classroom) {
    throw new AppError(httpStatus.NOT_FOUND, "Classroom not found");
  }
  if (!classroom.branch.isActive || classroom.branch.deletedAt) {
    throw new AppError(httpStatus.FORBIDDEN, "Classroom branch is inactive");
  }

  await assertUserEligible(userId);

  if (userRole === "TEACHER") {
    const isAssigned = await prisma.classroomTeacher.findUnique({
      where: { classroomId_teacherId: { classroomId, teacherId: userId } },
    });
    if (!isAssigned) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not assigned to this classroom",
      );
    }
  } else if (userRole === "CENTER_ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { branchId: true },
    });
    if (classroom.branchId !== user?.branchId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Classroom is not in your branch",
      );
    }
  } else if (userRole === "TENANT_OWNER") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true },
    });
    if (classroom.branch.tenantId !== user?.tenantId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Classroom is not in your tenant",
      );
    }
  } else {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  }

  let conversation = await prisma.conversation.findFirst({
    where: { classroomId },
    include: {
      classroom: { select: { id: true, name: true } },
      child: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      },
      participants: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
      _count: { select: { messages: { where: { readAt: null } } } },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { classroomId },
      include: {
        classroom: { select: { id: true, name: true } },
        child: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
        participants: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
        _count: { select: { messages: { where: { readAt: null } } } },
      },
    });
  }
  return conversation;
};

/* ─── child conversations ─── */

const getOrCreateConversation = async (
  childId: string,
  userId: string,
  userRole: string,
) => {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    include: { branch: true, classroom: true },
  });
  if (!child) throw new AppError(httpStatus.NOT_FOUND, "Child not found");
  if (!child.branch.isActive || child.branch.deletedAt) {
    throw new AppError(httpStatus.FORBIDDEN, "Child's branch is inactive");
  }

  await assertUserEligible(userId);

  if (userRole === "GUARDIAN") {
    const isGuardian = await prisma.childGuardian.findFirst({
      where: { childId, userId },
    });
    if (!isGuardian) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not a guardian of this child",
      );
    }
  } else if (userRole === "TEACHER") {
    if (!child.classroomId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Child is not assigned to a classroom",
      );
    }
    const isAssigned = await prisma.classroomTeacher.findUnique({
      where: {
        classroomId_teacherId: { classroomId: child.classroomId, teacherId: userId },
      },
    });
    if (!isAssigned) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not assigned to this child's classroom",
      );
    }
  } else if (userRole === "CENTER_ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { branchId: true },
    });
    if (child.branchId !== user?.branchId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Child is not in your branch",
      );
    }
  } else if (userRole === "TENANT_OWNER") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true },
    });
    if (child.tenantId !== user?.tenantId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Child is not in your tenant",
      );
    }
  } else if (userRole !== "SUPER_ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "Not authorized");
  }

  let conversation = await prisma.conversation.findFirst({
    where: { childId },
    include: {
      child: {
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      },
      classroom: { select: { id: true, name: true } },
      participants: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
      _count: { select: { messages: { where: { readAt: null } } } },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { childId },
      include: {
        child: {
          select: { id: true, firstName: true, lastName: true, photoUrl: true },
        },
        classroom: { select: { id: true, name: true } },
        participants: { select: { id: true, name: true, image: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { sender: { select: { id: true, name: true, role: true } } },
        },
        _count: { select: { messages: { where: { readAt: null } } } },
      },
    });
  }
  return conversation;
};

/* ─── messages ─── */

const getMessages = async (
  conversationId: string,
  userId: string,
  userRole: string,
  limit: number = 50,
) => {
  await assertConversationAccess(conversationId, userId, userRole);

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          role: true,
          image: true,
          isOnline: true,
          lastActiveAt: true,
        },
      },
    },
  });

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return messages.reverse();
};

export const MessageService = {
  getUserConversations,
  getPermittedContacts,
  getOrCreateDirectMessage,
  getOrCreateClassroomConversation,
  getOrCreateConversation,
  getMessages,
};