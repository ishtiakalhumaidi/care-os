import { Request, Response } from "express";
import status from "http-status";
import { MessageService } from "./message.service.js";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";

const getMyConversations = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await MessageService.getUserConversations(user.id, user.role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result,
  });
});

const getConversation = catchAsync(async (req: Request, res: Response) => {
  const { childId } = req.params;
  const result = await MessageService.getOrCreateConversation(childId as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Conversation retrieved successfully",
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const userId = req.user!.id;

  const result = await MessageService.getMessages(conversationId as string, userId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result,
  });
});


const getContacts = catchAsync(async (req: Request, res: Response) => {
  const result = await MessageService.getPermittedContacts(req.user);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Contacts retrieved successfully",
    data: result,
  });
});
const createClassroomMessage = catchAsync(async (req: Request, res: Response) => {
  const { classroomId } = req.body;
  const result = await MessageService.getOrCreateClassroomConversation(classroomId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Classroom conversation retrieved",
    data: result,
  });
});
const createDirectMessage = catchAsync(async (req: Request, res: Response) => {
  const { targetId } = req.body;
  const userId = req.user!.id;
  
  const result = await MessageService.getOrCreateDirectMessage(userId, targetId);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Direct message conversation created",
    data: result,
  });
});

export const MessageController = {
  getConversation,
  getMyConversations,
  getMessages,
  getContacts, 
  createDirectMessage ,
  createClassroomMessage
};