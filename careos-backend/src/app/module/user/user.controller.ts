import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { UserService } from "./user.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";
import type { IQuery } from "../../interfaces/query.interface.js";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const result = await UserService.getAllUsers(
    req.query as IQuery,
    tenantId,
    req.user!.role,
    req.user!.branchId as string | undefined,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMe(req.user!.id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      `users/${req.user!.id}/avatar`,
    );
    payload.image = result.secure_url;
  }

  const result = await UserService.updateMe(req.user!.id, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
  getMe,
  updateMe,
  getAllUsers,
};