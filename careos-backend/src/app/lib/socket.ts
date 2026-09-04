import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env.js";
import { prisma } from "./prisma.js";

let io: Server;

export const initSocket = (httpServer: HttpServer, frontendUrl: string) => {
  io = new Server(httpServer, {
    cors: { origin: frontendUrl, credentials: true },
  });

  io.use(async (socket: Socket, next) => {
    try {
      let token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Token is missing."));
      if (token.startsWith("Bearer ")) token = token.split(" ")[1];

      const decoded = jwt.verify(
        token,
        envVars.ACCESS_TOKEN_SECRET,
      ) as JwtPayload;
      const userId = decoded.userId || decoded.id;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.isDeleted || !user.isActive)
        return next(new Error("User invalid."));

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error."));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const user = socket.data.user;

    // 1. Mark user online & Broadcast to others
    await prisma.user.update({
      where: { id: user.id },
      data: { isOnline: true, lastActiveAt: new Date() },
    });
    socket.broadcast.emit("user_status_changed", {
      userId: user.id,
      isOnline: true,
      lastActiveAt: new Date(),
    });

    socket.on("authenticate_user", async (userData: any) => {
      // 1. Join Tenant Room (Everyone gets these)
      if (userData.tenantId) {
        socket.join(`tenant_${userData.tenantId}`);
      }

      // 2. Join Branch Room (Staff & Guardians linked to a branch)
      if (userData.branchId) {
        socket.join(`branch_${userData.branchId}`);
      }

      // 3. Join Classroom Rooms (Teachers assigned, or Guardians with children here)
      if (userData.classroomIds && Array.isArray(userData.classroomIds)) {
        userData.classroomIds.forEach((id: string) => {
          socket.join(`classroom_${id}`);
        });
      }

      console.log(`User ${userData.id} joined broadcast rooms.`);
    });

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
    });

    // 2. Handle Sending Messages
    socket.on(
     "send_message",
      async (data: { conversationId: string; content: string; replyToId?: string }) => {
        try {
          const newMessage = await prisma.message.create({
            data: {
              content: data.content,
              conversationId: data.conversationId,
              senderId: user.id,
              replyToId: data.replyToId || null, 
            },
            include: {
              sender: {
                select: { id: true, name: true, image: true, role: true },
              },
              
              replyTo: {
                select: {
                  id: true,
                  content: true,
                  sender: {
                    select: { name: true },
                  },
                },
              },
            },
          });

          io.to(`conversation_${data.conversationId}`).emit(
            "new_message",
            newMessage,
          );
        } catch (error) {
          socket.emit("message_error", { message: "Failed to send message" });
        }
      },
    );

    // 3. Handle Edit Message
    socket.on(
      "edit_message",
      async (data: {
        conversationId: string;
        messageId: string;
        newContent: string;
      }) => {
        try {
          const updatedMsg = await prisma.message.update({
            where: { id: data.messageId },
            data: { content: data.newContent, isEdited: true },
            include: {
              sender: {
                select: { id: true, name: true, image: true, role: true },
              },
            },
          });
          io.to(`conversation_${data.conversationId}`).emit(
            "message_edited",
            updatedMsg,
          );
        } catch (error) {
          console.error(error);
        }
      },
    );

    // 4. Handle Delete Message
    socket.on(
      "delete_message",
      async (data: { conversationId: string; messageId: string }) => {
        try {
          const updatedMsg = await prisma.message.update({
            where: { id: data.messageId },
            data: { isDeleted: true, content: "" },
            include: {
              sender: {
                select: { id: true, name: true, image: true, role: true },
              },
            },
          });
          io.to(`conversation_${data.conversationId}`).emit(
            "message_deleted",
            updatedMsg,
          );
        } catch (error) {
          console.error(error);
        }
      },
    );

    // 5. Handle Read Receipts
    socket.on("mark_read", async (data: { conversationId: string }) => {
      try {
        await prisma.message.updateMany({
          where: {
            conversationId: data.conversationId,
            senderId: { not: user.id },
            readAt: null,
          },
          data: { readAt: new Date() },
        });
        io.to(`conversation_${data.conversationId}`).emit("messages_read", {
          conversationId: data.conversationId,
          readBy: user.id,
          readAt: new Date(),
        });
      } catch (error) {
        console.error("Failed to update read receipts", error);
      }
    });

    socket.on("disconnect", async () => {
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: false, lastActiveAt: new Date() },
      });
      socket.broadcast.emit("user_status_changed", {
        userId: user.id,
        isOnline: false,
        lastActiveAt: new Date(),
      });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};
