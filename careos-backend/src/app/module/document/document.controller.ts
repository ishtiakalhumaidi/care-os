import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { DocumentService } from "./document.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";
import AppError from "../../errorHelpers/AppError.js";
import { DocumentType } from "../../../generated/prisma/enums.js";
const uploadDocument = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const { expiresAt } = req.body;
  const type = req.body.type as DocumentType;
  const tenantId = req.user!.tenantId as string;

  if (!req.file) {
    throw new AppError(status.BAD_REQUEST, "Document file is required");
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    `tenants/${tenantId}/documents/${childId}`,
    req.file.mimetype
  );

  const document = await DocumentService.uploadDocument(
    childId as string,
    type,
    result.secure_url,
    tenantId,
    expiresAt
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Document uploaded successfully",
    data: document,
  });
});

const getChildDocuments = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const tenantId = req.user!.tenantId as string;

  const documents = await DocumentService.getChildDocuments(childId as string, tenantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Documents retrieved successfully",
    data: documents,
  });
});

const signDocument = catchAsync(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const userId = req.user!.id;
  const tenantId = req.user!.tenantId as string;

  const document = await DocumentService.signDocument(documentId as string, userId, tenantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Document signed successfully",
    data: document,
  });
});

const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const tenantId = req.user!.tenantId as string;

  await DocumentService.deleteDocument(documentId as string, tenantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Document deleted successfully",
    data: null,
  });
});

export const DocumentController = {
  uploadDocument,
  getChildDocuments,
  signDocument,
  deleteDocument,
};