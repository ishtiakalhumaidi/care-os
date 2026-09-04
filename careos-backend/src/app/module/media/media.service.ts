import status from "http-status";
import AppError from "../../errorHelpers/AppError.js";
import { prisma } from "../../lib/prisma.js";
import { v2 as cloudinary } from "cloudinary";

const uploadChildMedia = async (user: any, childId: string, fileUrl: string, caption?: string) => {
  const child = await prisma.child.findFirst({
    where: { id: childId, tenantId: user.tenantId },
  });

  if (!child) {
    throw new AppError(status.NOT_FOUND, "Child not found or access denied");
  }

  const media = await prisma.media.create({
    data: {
      url: fileUrl,
      caption: caption || null,
      childId,
      uploadedBy: user.id,
    },
    include: {
      uploader: {
        select: { name: true, role: true, image: true },
      },
    },
  });

  const signedUrl = cloudinary.url(media.url, {
    type: "authenticated",
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600, 
  });

  return { ...media, url: signedUrl };
};

const getChildMedia = async (user: any, childId: string) => {
  if (user.role === "GUARDIAN") {
    const guardianLink = await prisma.childGuardian.findFirst({
      where: { childId, userId: user.id },
    });
    if (!guardianLink) throw new AppError(status.FORBIDDEN, "Access denied to this gallery");
  }

  if (user.role === "TEACHER") {
     const teacherLink = await prisma.classroomTeacher.findFirst({
         where: { teacherId: user.id }
     });
     const child = await prisma.child.findUnique({ where: { id: childId }});
     if (child?.classroomId !== teacherLink?.classroomId) {
         throw new AppError(status.FORBIDDEN, "Child is not in your classroom");
     }
  }

  if (user.role === "CENTER_ADMIN") {
      const child = await prisma.child.findUnique({ where: { id: childId }});
      if (child?.branchId !== user.branchId) {
          throw new AppError(status.FORBIDDEN, "Child is not in your branch");
      }
  }


  const mediaList = await prisma.media.findMany({
    where: { childId },
    orderBy: { createdAt: "desc" },
    include: {
      uploader: {
        select: { name: true, role: true },
      },
    },
  });


  const mediaWithSignedUrls = mediaList.map((media) => {
    const signedUrl = cloudinary.url(media.url, {
      type: "authenticated",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    return {
      ...media,
      url: signedUrl, 
    };
  });

  return mediaWithSignedUrls;
};

const deleteChildMedia = async (user: any, mediaId: string) => {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  
  if (!media) {
    throw new AppError(status.NOT_FOUND, "Media not found");
  }

  if (media.uploadedBy !== user.id && !["CENTER_ADMIN", "TENANT_OWNER"].includes(user.role)) {
    throw new AppError(status.FORBIDDEN, "Not authorized to delete this media");
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return media;
};

export const MediaService = {
  uploadChildMedia,
  getChildMedia,
  deleteChildMedia
};