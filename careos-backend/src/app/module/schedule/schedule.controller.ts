import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { ScheduleService } from "./schedule.service.js";

const createShift = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const adminBranchId = req.user!.role === "CENTER_ADMIN" ? req.user!.branchId as string : undefined;

  const result = await ScheduleService.createShift(req.body, tenantId, adminBranchId);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Shift scheduled successfully",
    data: result,
  });
});

const getBranchWeeklySchedule = catchAsync(async (req: Request, res: Response) => {
  const { branchId } = req.params;
  const { start, end } = req.query;
  const tenantId = req.user!.tenantId as string;

  if (!start || !end) throw new Error("Start and end dates are required");

  const result = await ScheduleService.getBranchWeeklySchedule(
    branchId as string, 
    start as string, 
    end as string, 
    tenantId
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Weekly schedule fetched successfully",
    data: result,
  });
});

const getMyUpcomingShifts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id as string;
  
  const result = await ScheduleService.getMyUpcomingShifts(userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Upcoming shifts fetched successfully",
    data: result,
  });
});

const clockIn = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const branchId = req.user!.branchId;

  const result = await ScheduleService.clockIn(userId, role, branchId, req.body.shiftId);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Clocked in successfully",
    data: result,
  });
});

const clockOut = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await ScheduleService.clockOut(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Clocked out successfully",
    data: result,
  });
});

const getCurrentTimesheet = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await ScheduleService.getCurrentTimesheet(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Current timesheet fetched",
    data: result, 
  });
});

const getMyTimesheetHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await ScheduleService.getMyTimesheetHistory(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Timesheet history fetched",
    data: result,
  });
});
export const ScheduleController = {
  createShift,
  getBranchWeeklySchedule,
  getMyUpcomingShifts,
  clockIn,
  clockOut,
  getCurrentTimesheet,
  getMyTimesheetHistory,
};