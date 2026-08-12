import { Router } from "express";
import { validateRequest } from "../../middleware/validateRequest.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { ClassroomController } from "./classroom.controller.js";
import { ClassroomValidation } from "./classroom.validation.js";
import { Role } from "../../../generated/prisma/client.js";

const router = Router();

router.post(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ClassroomValidation.createClassroomZodSchema),
  ClassroomController.createClassroom,
);

router.post(
  "/:id/assign-teacher",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ClassroomValidation.assignTeacherZodSchema),
  ClassroomController.assignTeacher,
);

router.get(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.TEACHER),
  ClassroomController.getAllClassrooms,
);

router.get(
  "/mine",
  checkAuth(Role.TEACHER),
  ClassroomController.getMyClassrooms,
);
router.get(
  "/mine/:id",
  checkAuth(Role.TEACHER),
  ClassroomController.getMyClassroomById,
);
router.get(
  "/:id",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.TEACHER),
  ClassroomController.getClassroomById,
);

router.patch(
  "/:id",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ClassroomValidation.updateClassroomZodSchema),
  ClassroomController.updateClassroom,
);

router.delete(
  "/:id/teachers/:userId",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  ClassroomController.unassignTeacher,
);

router.delete(
  "/:id",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  ClassroomController.deleteClassroom,
);

export const ClassroomRoutes = router;
