import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { BranchService } from "./branch.service.js";
import { IQuery } from "../../interfaces/query.interface.js";

const getLiveRatio = catchAsync(async (req, res) => {
  const { branchId } = req.params;
  const tenantId = req.user!.tenantId as string;
  
  const result = await BranchService.getLiveRatio(branchId as string, tenantId as string);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Live ratio metrics fetched successfully",
    data: result,
  });
});

const createBranch = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  payload.tenantId = req.user!.tenantId; 

  const result = await BranchService.createBranch(payload);
  
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Branch created successfully",
    data: result,
  });
});

const getAllBranches = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId;
  const result = await BranchService.getAllBranches(req.query as IQuery, tenantId as string);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Branches fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getBranchById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;
  const result = await BranchService.getBranchById(id as string, tenantId as string);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Branch fetched successfully",
    data: result,
  });
});

const updateBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const tenantId = req.user!.tenantId;
  const result = await BranchService.updateBranch(id as string, payload, tenantId as string);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Branch updated successfully",
    data: result,
  });
});

const deleteBranch = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.user!.tenantId;
  const result = await BranchService.deleteBranch(id as string, tenantId as string);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Branch deleted successfully",
    data: result,
  });
});

export const BranchController = {
  getLiveRatio,
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};