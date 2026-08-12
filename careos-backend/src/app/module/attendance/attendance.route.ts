import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { AttendanceController } from "./attendance.controller.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/:childId/request-checkin",
  checkAuth(Role.GUARDIAN),
  AttendanceController.requestCheckIn,
);
router.post(
  "/:attendanceId/confirm-checkin",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  AttendanceController.confirmCheckIn,
);
router.post(
  "/:childId/request-checkout",
  checkAuth(Role.GUARDIAN, Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  AttendanceController.requestCheckOut,
);
router.post(
  "/:attendanceId/confirm-checkout",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  AttendanceController.confirmCheckOut,
);
router.get(
  "/current",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  AttendanceController.getCurrentAttendance,
);
router.get(
  "/pending",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  AttendanceController.getPendingRequests,
);
router.get(
  "/child/:childId",
  checkAuth(Role.GUARDIAN, Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  AttendanceController.getChildAttendanceHistory,
);

export const AttendanceRoutes = router;
