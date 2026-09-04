import express from "express";
import { MediaController } from "./media.controller.js";
import { checkAuth } from "../../middleware/checkAuth.js";
import { multerUpload } from "../../config/multer.config.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = express.Router();

router.post(
  "/:childId",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  multerUpload.single("file"),
  MediaController.uploadMedia,
);

router.get(
  "/:childId",
  checkAuth(Role.GUARDIAN, Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  MediaController.getMedia,
);
router.delete(
  "/:mediaId",
  checkAuth(Role.TEACHER, Role.CENTER_ADMIN, Role.TENANT_OWNER),
  MediaController.deleteMedia,
);
export const MediaRoutes = router;