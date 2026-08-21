import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { ScheduleController } from "./schedule.controller.js";
import { ScheduleValidation } from "./schedule.validation.js";
import { Role } from "../../../generated/prisma/client.js";

const router = Router();

router.post(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  validateRequest(ScheduleValidation.createShiftZodSchema),
  ScheduleController.createShift
);

router.post(
  "/timesheet/clock-in",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN),
  ScheduleController.clockIn
);

router.post(
  "/timesheet/clock-out",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN),
  ScheduleController.clockOut
);

router.get(
  "/timesheet/current",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN),
  ScheduleController.getCurrentTimesheet
);
router.get(
  "/timesheet/history",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN),
  ScheduleController.getMyTimesheetHistory
);

router.get(
  "/branch/:branchId/weekly",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.TEACHER),
  ScheduleController.getBranchWeeklySchedule
);

router.get(
  "/my-upcoming",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN),
  ScheduleController.getMyUpcomingShifts
);

export const ScheduleRoutes = router;
