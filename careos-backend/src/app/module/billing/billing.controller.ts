/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { BillingService, stripe } from "./billing.service.js";
import { envVars } from "../../config/env.js";

const createTenantCheckout = catchAsync(async (req: Request, res: Response) => {
  const { planId } = req.body;
  const tenantId = (req as any).user.tenantId;
  const userEmail = (req as any).user.email;

  const result = await BillingService.createTenantSubscriptionCheckout(tenantId, planId, userEmail);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tenant checkout session initiated",
    data: result,
  });
});

const getPlans = catchAsync(async (_req: Request, res: Response) => {
  const result = await BillingService.getAvailablePlans();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Plans retrieved successfully",
    data: result,
  });
});

const updatePlan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BillingService.updatePlanConfig(id as string, req.body);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Plan updated successfully",
    data: result,
  });
});

const seedPlans = catchAsync(async (_req: Request, res: Response) => {
  const result = await BillingService.seedPlanConfigs();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Plans seeded successfully",
    data: result,
  });
});

const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const result = await BillingService.createChildInvoice((req as any).user, req.body);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Child invoice created successfully",
    data: result,
  });
});

const getMyGuardianInvoices = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const result = await BillingService.getGuardianInvoices(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Guardian invoices retrieved successfully",
    data: result,
  });
});

const payGuardianInvoice = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { invoiceId, amount } = req.body;

  const result = await BillingService.createGuardianTuitionCheckout(userId, invoiceId, amount);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Tuition payment session created",
    data: result,
  });
});

const getTenantInvoices = catchAsync(async (req: Request, res: Response) => {
  const result = await BillingService.getTenantBillingOverview((req as any).user, req.query);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Invoices overview retrieved",
    data: result,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(status.BAD_REQUEST).json({ message: "Missing webhook signature or secret" });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    return res.status(status.BAD_REQUEST).json({ message: `Webhook Error: ${err.message}` });
  }

  const result = await BillingService.handleStripeWebhookEvent(event);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Webhook processed",
    data: result,
  });
});
const downgradeTenantPlan = catchAsync(async (req: Request, res: Response) => {
  const tenantId = (req as any).user.tenantId;
  const result = await BillingService.scheduleTenantDowngrade(tenantId);
  
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Plan scheduled to downgrade at the end of the billing cycle.",
    data: result,
  });
});


export const BillingController = {
  createTenantCheckout,
  getPlans,
  updatePlan,
  seedPlans,
  createInvoice,
  getMyGuardianInvoices,
  payGuardianInvoice,
  getTenantInvoices,
  handleStripeWebhook,
  downgradeTenantPlan
};