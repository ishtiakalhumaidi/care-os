import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { BroadcastService } from "./broadcast.service.js";

const createBroadcast = catchAsync(async (req: Request, res: Response) => {
  const result = await BroadcastService.createBroadcast(req.user, req.body);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Broadcast dispatched successfully",
    data: result,
  });
});

const getActiveBroadcasts = catchAsync(async (req: Request, res: Response) => {
  const result = await BroadcastService.getActiveBroadcasts(req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Broadcasts retrieved successfully",
    data: result,
  });
});

const acknowledgeBroadcast = catchAsync(async (req: Request, res: Response) => {
  const { broadcastId } = req.params;
  const result = await BroadcastService.acknowledgeBroadcast(
    req.user!.id,
    broadcastId as string,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Broadcast acknowledged",
    data: result,
  });
});

export const BroadcastController = {
  createBroadcast,
  getActiveBroadcasts,
  acknowledgeBroadcast,
};
