import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { multerUpload } from "../../config/multer.config.js";
import { DocumentController } from "./document.controller.js";
import { Role } from "../../../generated/prisma/enums.js";
import { handleMulterError } from "../../middleware/handleMulterError.js";

const router = Router();

// Admins/Owners can upload and delete documents
router.post(
  "/child/:childId",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  multerUpload.single("file"),
  handleMulterError,
  DocumentController.uploadDocument
);

router.delete(
  "/:documentId",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  DocumentController.deleteDocument
);

// Guardians and Staff can view documents
router.get(
  "/child/:childId",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN, Role.GUARDIAN, Role.TEACHER),
  DocumentController.getChildDocuments
);

// Only Guardians sign documents
router.patch(
  "/:documentId/sign",
  checkAuth(Role.GUARDIAN),
  DocumentController.signDocument
);

export const DocumentRoutes = router;