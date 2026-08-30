import { Request, Response } from "express";
import { MediaService } from "./media.service";
import { catchAsync } from "../../shared/catchAsync";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "../../lib/prisma";

const uploadMedia = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const { caption } = req.body;

  if (!req.file) {
    throw new AppError(status.BAD_REQUEST, "No image file provided");
  }

  let fileUrl = req.file.path;

  
  if (!fileUrl && req.file.buffer) {
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { 
          folder: "careos_gallery",
          type: "authenticated", 
          transformation: [
            { width: 1200, crop: "limit" }, 
            { quality: "auto", fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.end(req.file!.buffer);
    });
  
    fileUrl = (uploadResult as any).public_id; 
  }

  if (!fileUrl) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to upload image to Cloudinary");
  }

  const result = await MediaService.uploadChildMedia(
    req.user,
    childId as string,
    fileUrl, 
    caption,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Media uploaded successfully",
    data: result,
  });
});

const getMedia = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const result = await MediaService.getChildMedia(req.user, childId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media retrieved successfully",
    data: result,
  });
});

const deleteMedia = catchAsync(async (req: Request, res: Response) => {
  const { mediaId } = req.params;

  const media = await prisma.media.findUnique({ where: { id: mediaId as string} });

  if (media) {
    try {
      await cloudinary.uploader.destroy(media.url, { type: "authenticated" });
    } catch (error) {
      console.error("Failed to delete from Cloudinary:", error);
    }
  }

  await MediaService.deleteChildMedia(req.user, mediaId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Media deleted successfully",
    data: null,
  });
});

export const MediaController = {
  uploadMedia,
  getMedia,
  deleteMedia,
};