import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { ChildService } from "./child.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";
import { IQuery } from "../../interfaces/query.interface.js";

const applyForChild = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const guardianId = req.user!.id;
  const tenantId = req.user!.tenantId as string;
  const branchId = req.user!.branchId as string;

  if (!branchId) {
    return sendResponse(res, {
      httpStatusCode: status.BAD_REQUEST,
      success: false,
      message:
        "Your account has no branch assigned. Contact your center admin.",
      data: null,
    });
  }

  let uploadedPublicId: string | undefined;

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      `tenants/${tenantId}/children`,
    );
    payload.photoUrl = result.secure_url;
    uploadedPublicId = result.public_id;
  }

  try {
    const child = await ChildService.applyForChild(
      payload,
      guardianId,
      tenantId,
      branchId,
    );

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Application submitted. A staff member will review it shortly.",
      data: child,
    });
  } catch (error) {
    if (uploadedPublicId) {
      const { v2: cloudinary } = await import("cloudinary");
      await cloudinary.uploader.destroy(uploadedPublicId).catch(() => {});
    }
    throw error;
  }
});
const getAllChildren = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const role = req.user!.role;
  const branchId = role === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);
  const classroomId = role === "TEACHER" ? (req.user!.classroomId as string) : undefined;

  const result = await ChildService.getAllChildren(req.query as IQuery, tenantId, branchId, classroomId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Children fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getChildById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const role = req.user!.role;
  const branchId = role === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);
  const classroomId = role === "TEACHER" ? (req.user!.classroomId as string) : undefined;

  const result = await ChildService.getChildById(id as string, tenantId, branchId, classroomId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Child fetched successfully",
    data: result,
  });
});

const getMyChildById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const guardianId = req.user!.id;
  const tenantId = req.user!.tenantId as string;

  const result = await ChildService.getMyChildById(id as string, guardianId, tenantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Child fetched successfully",
    data: result,
  });
});

const updatePickupPermission = catchAsync(async (req: Request, res: Response) => {
  const { id, linkId } = req.params;
  const requesterId = req.user!.id;
  const tenantId = req.user!.tenantId as string;

  const result = await ChildService.updatePickupPermission(
    id as string,
    linkId as string,
    requesterId,
    tenantId,
    req.body,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pickup permission updated",
    data: result,
  });
});


const selfUnlinkGuardian = catchAsync(async (req: Request, res: Response) => {
  const { id, linkId } = req.params;
  const requesterId = req.user!.id;
  const tenantId = req.user!.tenantId as string;

  await ChildService.selfUnlinkGuardian(id as string, linkId as string, requesterId, tenantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Guardian removed",
    data: null,
  });
});

const approveChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const staffId = req.user!.id;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);

  const result = await ChildService.approveChild(
    id as string,
    req.body,
    staffId,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Child enrolled successfully",
    data: result,
  });
});

const rejectChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const staffId = req.user!.id;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);

  const result = await ChildService.rejectChild(
    id as string,
    req.body,
    staffId,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Application rejected",
    data: result,
  });
});

const linkGuardian = catchAsync(async (req: Request, res: Response) => {
  
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);

  const result = await ChildService.linkGuardian(
    id as string,
    req.body,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Guardian linked successfully",
    data: result,
  });
});

const unlinkGuardian = catchAsync(async (req: Request, res: Response) => {
  const { id, linkId } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId = req.user!.role === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);
  await ChildService.unlinkGuardian(id as string, linkId as string, tenantId, staffBranchId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Guardian removed",
    data: null,
  });
});

const suspendChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);
  const result = await ChildService.suspendChild(
    id as string,
    req.body,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Child suspended",
    data: result,
  });
});

const reactivateChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);
  const result = await ChildService.reactivateChild(
    id as string,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Child reactivated",
    data: result,
  });
});
const assignClassroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId = req.user!.role === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);

  const result = await ChildService.assignClassroom(id as string, req.body, tenantId, staffBranchId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Classroom assigned successfully",
    data: result,
  });
});

const unassignClassroom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);

  const result = await ChildService.unassignClassroom(
    id as string,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Child removed from classroom",
    data: result,
  });
});

const updateGuardianSplits = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { splits } = req.body;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId =
    req.user!.role === "TENANT_OWNER"
      ? undefined
      : (req.user!.branchId as string);

  const result = await ChildService.updateGuardianSplits(
    id as string,
    splits,
    tenantId,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Guardian billing splits updated",
    data: result,
  });
});

export const ChildController = {
  applyForChild,
  getAllChildren,
  getChildById,
  getMyChildById,
  approveChild,
  rejectChild,
  linkGuardian,
  suspendChild,
  reactivateChild,
  unlinkGuardian,
  selfUnlinkGuardian,
  updatePickupPermission,
  assignClassroom,
  unassignClassroom,
  updateGuardianSplits
};