import express from "express";
import { MediaController } from "./media.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { Role } from "../../../generated/prisma/enums";

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