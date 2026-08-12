import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { AttendanceService } from "./attendance.service.js";

const performerFromReq = (req: Request) => ({
  id: req.user!.id,
  role: req.user!.role,
  tenantId: req.user!.tenantId,
  branchId: req.user!.branchId,
});

const requestCheckIn = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const result = await AttendanceService.requestCheckIn(childId as string, performerFromReq(req));
  sendResponse(res, { httpStatusCode: status.CREATED, success: true, message: "Check-in requested", data: result });
});

const confirmCheckIn = catchAsync(async (req: Request, res: Response) => {
  const { attendanceId } = req.params;
  const result = await AttendanceService.confirmCheckIn(attendanceId as string, performerFromReq(req));
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Check-in confirmed", data: result });
});

const requestCheckOut = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const result = await AttendanceService.requestCheckOut(
    childId as string,
    performerFromReq(req),
    req.body?.reason,
  );
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Check-out requested", data: result });
});

const confirmCheckOut = catchAsync(async (req: Request, res: Response) => {
  const { attendanceId } = req.params;
  const result = await AttendanceService.confirmCheckOut(
    attendanceId as string,
    performerFromReq(req),
    req.body.pickedUpByGuardianId,
  );
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Check-out confirmed", data: result });
});

const getCurrentAttendance = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const branchId = req.user!.role === "TENANT_OWNER" ? (req.query.branchId as string | undefined) : (req.user!.branchId as string);
  const classroomId = req.query.classroomId as string | undefined;
  const result = await AttendanceService.getCurrentAttendance(tenantId, branchId, classroomId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Current attendance fetched", data: result });
});

const getPendingRequests = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const branchId = req.user!.role === "TENANT_OWNER" ? (req.query.branchId as string | undefined) : (req.user!.branchId as string);
  const classroomId = req.query.classroomId as string | undefined;
  const result = await AttendanceService.getPendingRequests(tenantId, branchId, classroomId);
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "Pending requests fetched", data: result });
});

const getChildAttendanceHistory = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const result = await AttendanceService.getChildAttendanceHistory(childId as string, performerFromReq(req));
  sendResponse(res, { httpStatusCode: status.OK, success: true, message: "History fetched", data: result });
});

export const AttendanceController = {
  requestCheckIn,
  confirmCheckIn,
  requestCheckOut,
  confirmCheckOut,
  getCurrentAttendance,
  getPendingRequests,
  getChildAttendanceHistory,
};