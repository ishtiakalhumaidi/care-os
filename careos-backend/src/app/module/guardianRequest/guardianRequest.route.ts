import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { GuardianRequestController } from "./guardianRequest.controller.js";
import { GuardianRequestValidation } from "./guardianRequest.validation.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/children/:id",
  checkAuth(Role.GUARDIAN),
  validateRequest(GuardianRequestValidation.createGuardianRequestZodSchema),
  GuardianRequestController.createRequest,
);

router.get(
  "/children/:id",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  GuardianRequestController.getRequestsForChild,
);

router.get(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  GuardianRequestController.getPendingRequests,
);

router.patch(
  "/:id/approve",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  GuardianRequestController.approveRequest,
);

router.patch(
  "/:id/deny",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(GuardianRequestValidation.denyGuardianRequestZodSchema),
  GuardianRequestController.denyRequest,
);

export const GuardianRequestRoutes = router;