import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route.js";
import { TenantRoutes } from "../module/tenant/tenant.route.js";
import { BranchRoutes } from "../module/branch/branch.route.js";
import { ClassroomRoutes } from "../module/classroom/classroom.route.js";
import { ChildRoutes } from "../module/child/child.route.js";
import { UserRoutes } from "../module/user/user.route.js";
import { PlanRoutes } from "../module/plan/plan.route.js";
import { GuardianRequestRoutes } from "../module/guardianRequest/guardianRequest.route.js";
import { AttendanceRoutes } from "../module/attendance/attendance.route.js";
import { TimelineRoutes } from "../module/timeline/timeline.route.js";
import { ScheduleRoutes } from "../module/schedule/schedule.route.js";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/tenants", TenantRoutes);
router.use("/branches", BranchRoutes);
router.use("/classrooms", ClassroomRoutes);
router.use("/children", ChildRoutes);
router.use("/plans", PlanRoutes);
router.use("/guardian-requests", GuardianRequestRoutes);
router.use("/attendance", AttendanceRoutes);
router.use("/timeline", TimelineRoutes);
router.use("/schedules", ScheduleRoutes);

export const IndexRoutes = router;
