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
import { MessageRoutes } from "../module/message/message.route.js";
import { BroadcastRoutes } from "../module/broadcast/broadcast.route.js";
import { MediaRoutes } from "../module/media/media.route.js";
import { BillingRoutes } from "../module/billing/billing.route.js";
import { DocumentRoutes } from "../module/document/document.route.js";
import { ComplianceRoutes } from "../module/compliance/compliance.route.js";

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
router.use("/messages", MessageRoutes);
router.use("/broadcasts", BroadcastRoutes);
router.use("/media", MediaRoutes)
router.use("/billing", BillingRoutes)
router.use("/documents", DocumentRoutes);
router.use("/compliance", ComplianceRoutes);

export const IndexRoutes = router;
