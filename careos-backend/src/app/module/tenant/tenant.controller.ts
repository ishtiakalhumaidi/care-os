import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { TenantService } from "./tenant.service.js";
import { IQuery } from "../../interfaces/query.interface.js";
import AppError from "../../errorHelpers/AppError.js";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";

const getAllTenants = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await TenantService.getAllTenants(query as IQuery);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenants fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getTenantById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "TENANT_OWNER" && req.user!.tenantId !== id) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this tenant");
  }

  const result = await TenantService.getTenantById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenant retrieved successfully",
    data: result,
  });
});

const updateTenant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (req.user!.role === "TENANT_OWNER" && req.user!.tenantId !== id) {
    throw new AppError(status.FORBIDDEN, "You do not have access to this tenant");
  }

  const payload = req.body;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, `tenants/${id}/logo`);
    payload.logoUrl = result.secure_url;
  }

  // ← FIX: pass role so service can reject planId changes by owner
  const result = await TenantService.updateTenant(
    id as string,
    payload,
    req.user!.role,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenant updated successfully",
    data: result,
  });
});

const suspendTenant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TenantService.suspendTenant(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenant suspended successfully",
    data: result,
  });
});

const activateTenant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TenantService.activateTenant(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenant activated successfully",
    data: result,
  });
});

const getTenantAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TenantService.getTenantAnalytics(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenant analytics fetched successfully",
    data: result,
  });
});

export const TenantController = {
  getAllTenants,
  getTenantById,
  updateTenant,
  suspendTenant,
  activateTenant,
  getTenantAnalytics,
};