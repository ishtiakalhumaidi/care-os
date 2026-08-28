import express from "express";
import { MessageController } from "./message.controller.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = express.Router();

router.get(
  "/contacts",
  checkAuth(),
  MessageController.getContacts,
);

router.post(
  "/conversations/dm",
  checkAuth(),
  MessageController.createDirectMessage,
);

router.get(
  "/conversations/me",
  checkAuth(),
  MessageController.getMyConversations,
);

router.post(
  "/conversations/classroom",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  MessageController.createClassroomMessage,
);

router.get(
  "/conversation/child/:childId",
  checkAuth(Role.TEACHER, Role.GUARDIAN, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  MessageController.getConversation,
);

router.get(
  "/conversation/:conversationId/messages",
  checkAuth(),
  MessageController.getMessages,
);

export const MessageRoutes = router;
