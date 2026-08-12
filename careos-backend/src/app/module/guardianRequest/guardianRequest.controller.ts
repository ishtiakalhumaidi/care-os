import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { GuardianRequestService } from "./guardianRequest.service.js";

const createRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const requesterId = req.user!.id;
  const tenantId = req.user!.tenantId as string;

  const result = await GuardianRequestService.createRequest(
    id as string,
    requesterId,
    tenantId,
    req.body,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Request submitted. Staff will review it shortly.",
    data: result,
  });
});

const getRequestsForChild = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;

  const result = await GuardianRequestService.getRequestsForChild(id as string, tenantId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Requests fetched successfully",
    data: result,
  });
});

const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const branchId = req.user!.role === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);

  const result = await GuardianRequestService.getPendingRequests(tenantId, branchId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Pending requests fetched successfully",
    data: result,
  });
});

const approveRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const staffId = req.user!.id;
  const tenantId = req.user!.tenantId as string;
  const staffRole = req.user!.role;
  const staffBranchId = staffRole === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);

  const result = await GuardianRequestService.approveRequest(
    id as string,
    staffId,
    tenantId,
    staffRole,
    staffBranchId,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Request approved. Invitation sent.",
    data: result,
  });
});

const denyRequest = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId as string;
  const staffBranchId = req.user!.role === "TENANT_OWNER" ? undefined : (req.user!.branchId as string);

  const result = await GuardianRequestService.denyRequest(
    id as string,
    tenantId,
    staffBranchId,
    req.body,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Request denied",
    data: result,
  });
});

export const GuardianRequestController = {
  createRequest,
  getRequestsForChild,
  getPendingRequests,
  approveRequest,
  denyRequest,
};