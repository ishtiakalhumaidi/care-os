import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { TimelineService } from "./timeline.service.js";

const performerFromReq = (req: Request) => ({
  id: req.user!.id,
  role: req.user!.role,
  tenantId: req.user!.tenantId,
  branchId: req.user!.branchId,
});

const logEvent = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const result = await TimelineService.logEvent(childId as string, req.body, performerFromReq(req));
  
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Timeline event logged successfully",
    data: result,
  });
});

const getDailyTimeline = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const date = (req.query.date as string) || new Date().toISOString();
  
  const result = await TimelineService.getDailyTimeline(childId as string, date, performerFromReq(req));
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Timeline fetched successfully",
    data: result,
  });
});

const getClassroomDailyMatrix = catchAsync(async (req: Request, res: Response) => {
  const { classroomId } = req.params;
  const date = (req.query.date as string) || new Date().toISOString();
  
  const result = await TimelineService.getClassroomDailyMatrix(classroomId as string, date, performerFromReq(req));
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Classroom matrix fetched",
    data: result,
  });
});

const getBranchAuditStream = catchAsync(async (req: Request, res: Response) => {
  const { branchId } = req.params;
  const date = (req.query.date as string) || new Date().toISOString();
  
  const result = await TimelineService.getBranchAuditStream(branchId as string, date, performerFromReq(req));
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Audit stream fetched",
    data: result,
  });
});

export const TimelineController = {
  logEvent,
  getDailyTimeline,
  getClassroomDailyMatrix,
  getBranchAuditStream,
};