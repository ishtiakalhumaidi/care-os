import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";
import { DocumentType, DocumentStatus } from "../../../generated/prisma/enums.js";

const uploadDocument = async (
  childId: string,
  type: DocumentType,
  fileUrl: string,
  tenantId: string,
  expiresAt?: Date
) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  // Auto-increment version if a document of this type already exists
  const existingDocs = await prisma.document.count({
    where: { childId, type },
  });

  return await prisma.document.create({
    data: {
      childId,
      type,
      fileUrl,
      status: DocumentStatus.PENDING_SIGNATURE,
      version: existingDocs + 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
};

const getChildDocuments = async (childId: string, tenantId: string) => {
  const child = await prisma.child.findUnique({ where: { id: childId } });
  if (!child || child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Child not found");
  }

  return await prisma.document.findMany({
    where: { childId },
    orderBy: { createdAt: "desc" },
    include: {
      signedBy: { select: { name: true, email: true } },
    },
  });
};

const signDocument = async (documentId: string, userId: string, tenantId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { child: true },
  });

  if (!document || document.child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Document not found");
  }

  if (document.status === DocumentStatus.SIGNED) {
    throw new AppError(status.CONFLICT, "Document is already signed");
  }

  // Verify the user signing is actually a linked guardian for this child
  const guardianLink = await prisma.childGuardian.findUnique({
    where: { childId_userId: { childId: document.childId, userId } },
  });

  if (!guardianLink) {
    throw new AppError(status.FORBIDDEN, "You are not authorized to sign documents for this child");
  }

  return await prisma.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.SIGNED,
      signedAt: new Date(),
      signedById: userId,
    },
  });
};

const deleteDocument = async (documentId: string, tenantId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { child: true },
  });

  if (!document || document.child.tenantId !== tenantId) {
    throw new AppError(status.NOT_FOUND, "Document not found");
  }

  await prisma.document.delete({ where: { id: documentId } });
  return null;
};

export const DocumentService = {
  uploadDocument,
  getChildDocuments,
  signDocument,
  deleteDocument,
};