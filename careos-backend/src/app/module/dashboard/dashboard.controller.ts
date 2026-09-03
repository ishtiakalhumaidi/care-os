import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { DashboardService } from "./dashboard.service.js";
import type { DashboardPeriod } from "./dashboard.interface.js";

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const period = (req.query.period as DashboardPeriod) ?? "7d";


  const result = await DashboardService.getDashboard(req.user!, period);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Dashboard fetched successfully",
    data: result,
  });
});

export const DashboardController = { getDashboard };