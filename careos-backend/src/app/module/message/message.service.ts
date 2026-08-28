import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import httpStatus from "http-status";

const getUserConversations = async (userId: string, role: string) => {
  // Fetch user to safely get branchId and tenantId for permissions
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  const userConversations = await prisma.conversation.findMany({
    where: {
      OR: [
        // 1. Standard child-related threads
        { childId: { not: null }, messages: { some: { senderId: userId } } },
        ...(role === "GUARDIAN"
          ? [{ childId: { not: null }, child: { guardians: { some: { userId: userId } } } }]
          : []),
          
        // 2. Direct messages where the user is a participant
        { isDirectMessage: true, participants: { some: { id: userId } } },
        
        // 3. Classroom group chats based on authorization
        ...(role === "TEACHER"
          ? [{ classroomId: { not: null }, classroom: { teacherAssignments: { some: { teacherId: userId } } } }]
          : []),
        ...(role === "CENTER_ADMIN" && user.branchId
          ? [{ classroomId: { not: null }, classroom: { branchId: user.branchId } }]
          : []),
        ...(role === "TENANT_OWNER" && user.tenantId
          ? [{ classroomId: { not: null }, classroom: { branch: { tenantId: user.tenantId } } }]
          : []),
      ],
    },
    include: {
      child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      classroom: { select: { id: true, name: true } }, // NEW: Must include classroom
      participants: {
        select: { id: true, name: true, role: true, image: true, isOnline: true, lastActiveAt: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
      _count: {
        select: { messages: { where: { senderId: { not: userId }, readAt: null } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  
  return userConversations;
};

const getPermittedContacts = async (user: any) => {
  let contacts: any[] = [];
  let classrooms: any[] = [];

  switch (user.role) {
    case "TEACHER":
      contacts = await prisma.user.findMany({
        where: {
          OR: [
            { role: "TEACHER", classroomAssignments: { some: { classroom: { teacherAssignments: { some: { teacherId: user.id } } } } } },
            { role: "CENTER_ADMIN", branchId: user.branchId },
            { role: "TENANT_OWNER", tenantId: user.tenantId },
          ],
          id: { not: user.id },
        },
        select: { id: true, name: true, role: true, image: true, isOnline: true },
      });
      classrooms = await prisma.classroom.findMany({
        where: { teacherAssignments: { some: { teacherId: user.id } } },
        select: { id: true, name: true },
      });
      break;

    case "CENTER_ADMIN":
      contacts = await prisma.user.findMany({
        where: {
          OR: [
            { role: "TEACHER", branchId: user.branchId },
            { role: "TENANT_OWNER", tenantId: user.tenantId },
            { role: "SUPER_ADMIN" },
          ],
          id: { not: user.id },
        },
        select: { id: true, name: true, role: true, image: true, isOnline: true },
      });
      classrooms = await prisma.classroom.findMany({
        where: { branchId: user.branchId },
        select: { id: true, name: true },
      });
      break;

    case "TENANT_OWNER":
   
      contacts = await prisma.user.findMany({
        where: {
          OR: [
            { role: "CENTER_ADMIN", tenantId: user.tenantId },
            { role: "TEACHER", tenantId: user.tenantId },
            { role: "SUPER_ADMIN" },
          ],
          id: { not: user.id },
        },
        select: { id: true, name: true, role: true, image: true, isOnline: true },
      });
      classrooms = await prisma.classroom.findMany({
        where: { branch: { tenantId: user.tenantId } },
        select: { id: true, name: true },
      });
      break;

    case "SUPER_ADMIN":
      contacts = await prisma.user.findMany({
        where: { OR: [{ role: "TENANT_OWNER" }, { role: "CENTER_ADMIN" }] },
        select: { id: true, name: true, role: true, image: true, isOnline: true },
      });
      break;
      
    case "GUARDIAN":
   
      break;
  }
  
  return { contacts, classrooms };
};

const getOrCreateDirectMessage = async (userId: string, targetUserId: string) => {
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
      child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      classroom: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true, role: true } } } },
      _count: { select: { messages: { where: { senderId: { not: userId }, readAt: null } } } }
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
        child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        classroom: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true, role: true } } } },
        _count: { select: { messages: { where: { senderId: { not: userId }, readAt: null } } } }
      },
    });
  }
  return conversation;
};

const getOrCreateClassroomConversation = async (classroomId: string) => {
  let conversation = await prisma.conversation.findFirst({
    where: { classroomId },
    include: {
      classroom: { select: { id: true, name: true } },
      child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      participants: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true, role: true } } } },
      _count: { select: { messages: { where: { readAt: null } } } }
    }
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { classroomId },
      include: {
        classroom: { select: { id: true, name: true } },
        child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        participants: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true, role: true } } } },
        _count: { select: { messages: { where: { readAt: null } } } }
      }
    });
  }
  return conversation;
};

const getOrCreateConversation = async (childId: string) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child) throw new AppError(httpStatus.NOT_FOUND, "Child not found");

  let conversation = await prisma.conversation.findFirst({
    where: { childId },
    include: {
      child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
      classroom: { select: { id: true, name: true } },
      participants: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true, role: true } } } },
      _count: { select: { messages: { where: { readAt: null } } } }
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { childId },
      include: {
        child: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
        classroom: { select: { id: true, name: true } },
        participants: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, name: true, role: true } } } },
        _count: { select: { messages: { where: { readAt: null } } } }
      },
    });
  }
  return conversation;
};

const getMessages = async (conversationId: string, userId: string) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
    include: {
      sender: {
        select: { id: true, name: true, role: true, image: true, isOnline: true, lastActiveAt: true },
      },
    },
  });

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, readAt: null },
    data: { readAt: new Date() },
  });

  return messages;
};

export const MessageService = {
  getUserConversations,
  getPermittedContacts,
  getOrCreateDirectMessage,
  getOrCreateClassroomConversation,
  getOrCreateConversation,
  getMessages,
};