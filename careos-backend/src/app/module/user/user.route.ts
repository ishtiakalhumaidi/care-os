import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { multerUpload } from "../../config/multer.config.js";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
  "/",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  UserController.getAllUsers,
);

router.get("/me", checkAuth(), UserController.getMe);

router.patch(
  "/me",
  checkAuth(),
  multerUpload.single("avatar"),
  validateRequest(UserValidation.updateMeZodSchema),
  UserController.updateMe,
);

export const UserRoutes = router;