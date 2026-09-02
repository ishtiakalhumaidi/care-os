import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { multerUpload } from "../../config/multer.config.js";
import { ChildController } from "./child.controller.js";
import { ChildValidation } from "./child.validation.js";
import { Role } from "../../../generated/prisma/enums.js";
import { handleMulterError } from "../../middleware/handleMulterError.js";

const router = Router();

router.post(
  "/apply",
  checkAuth(Role.GUARDIAN),
  multerUpload.single("photo"),
  handleMulterError,
  validateRequest(ChildValidation.applyForChildZodSchema),
  ChildController.applyForChild,
);

router.post(
  "/:id/guardians",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ChildValidation.linkGuardianZodSchema),
  ChildController.linkGuardian,
);
router.patch(
  "/:id/guardians/split",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  ChildController.updateGuardianSplits,
);

router.patch(
  "/:id/suspend",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ChildValidation.suspendChildZodSchema),
  ChildController.suspendChild,
);

router.patch(
  "/:id/reactivate",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  ChildController.reactivateChild,
);

router.get(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.TEACHER),
  ChildController.getAllChildren,
);

router.get(
  "/:id",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.TEACHER),
  ChildController.getChildById,
);

router.patch(
  "/:id/approve",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ChildValidation.approveChildZodSchema),
  ChildController.approveChild,
);

router.patch(
  "/:id/reject",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ChildValidation.rejectChildZodSchema),
  ChildController.rejectChild,
);
router.delete(
  "/:id/guardians/:linkId",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  ChildController.unlinkGuardian,
);

router.get(
  "/mine/:id",
  checkAuth(Role.GUARDIAN),
  ChildController.getMyChildById,
);
router.patch(
  "/:id/classroom",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ChildValidation.assignClassroomZodSchema),
  ChildController.assignClassroom,
);
router.patch(
  "/:id/classroom/remove",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  ChildController.unassignClassroom,
);
router.patch(
  "/:id/guardians/:linkId/pickup",
  checkAuth(Role.GUARDIAN),
  validateRequest(ChildValidation.updatePickupZodSchema),
  ChildController.updatePickupPermission,
);

router.delete(
  "/:id/guardians/:linkId/self",
  checkAuth(Role.GUARDIAN),
  ChildController.selfUnlinkGuardian,
);

export const ChildRoutes = router;
