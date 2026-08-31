import express from "express";
import { BroadcastController } from "./broadcast.controller.js";
import { Role } from "../../../generated/prisma/enums.js";
import { checkAuth } from "../../middleware/checkAuth.js";

const router = express.Router();

router.post(
  "/",
  checkAuth(Role.CENTER_ADMIN, Role.TENANT_OWNER, Role.SUPER_ADMIN),
  BroadcastController.createBroadcast,
);

router.get(
  "/",
  checkAuth(Role.GUARDIAN, Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  BroadcastController.getActiveBroadcasts,
);

router.post(
  "/:broadcastId/acknowledge",
  checkAuth(Role.GUARDIAN, Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  BroadcastController.acknowledgeBroadcast,
);

export const BroadcastRoutes = router;
