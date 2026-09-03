import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { DashboardController } from "./dashboard.controller.js";
import { DashboardValidation } from "./dashboard.validation.js";

const router = Router();

router.get(
  "/",
  checkAuth(),
  DashboardController.getDashboard,
);

export const DashboardRoutes = router;