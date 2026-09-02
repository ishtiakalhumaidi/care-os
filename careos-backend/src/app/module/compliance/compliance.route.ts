import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { ComplianceController } from "./compliance.controller.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
  "/reports",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.TEACHER, Role.GUARDIAN),
  ComplianceController.downloadReport
);

export const ComplianceRoutes = router;