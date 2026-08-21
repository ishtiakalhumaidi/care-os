import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { BranchController } from "./branch.controller.js";
import { BranchValidation } from "./branch.validation.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/",
  checkAuth(Role.TENANT_OWNER),
  validateRequest(BranchValidation.createBranchZodSchema),
  BranchController.createBranch,
);

router.get(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  BranchController.getAllBranches,
);

router.get(
  "/:id",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  BranchController.getBranchById,
);

router.get(
  "/:branchId/live-ratio",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  BranchController.getLiveRatio
);
router.patch(
  "/:id",
  checkAuth(Role.TENANT_OWNER),
  validateRequest(BranchValidation.updateBranchZodSchema),
  BranchController.updateBranch,
);

router.delete(
  "/:id",
  checkAuth(Role.TENANT_OWNER),
  BranchController.deleteBranch,
);

export const BranchRoutes = router;
