import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { TimelineController } from "./timeline.controller.js";
import { TimelineValidation } from "./timeline.validation.js";
import { Role } from "../../../generated/prisma/client.js";

const router = Router();


router.post(
  "/:childId/events",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  validateRequest(TimelineValidation.logEventZodSchema),
  TimelineController.logEvent
);

router.get(
  "/:childId/events",
  checkAuth(Role.GUARDIAN, Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  TimelineController.getDailyTimeline
);


router.get(
  "/classroom/:classroomId/matrix",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  TimelineController.getClassroomDailyMatrix
);

router.get(
  "/branch/:branchId/audit",
  checkAuth(Role.CENTER_ADMIN, Role.TENANT_OWNER),
  TimelineController.getBranchAuditStream
);

export const TimelineRoutes = router;