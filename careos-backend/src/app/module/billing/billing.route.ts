import express, { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { BillingController } from "./billing.controller.js";

const router = Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  BillingController.handleStripeWebhook,
);
router.get("/plans", BillingController.getPlans);
router.post(
  "/seed-plans",
  checkAuth(Role.SUPER_ADMIN),
  BillingController.seedPlans,
);
router.patch(
  "/plans/:id",
  checkAuth(Role.SUPER_ADMIN),
  BillingController.updatePlan,
);
router.post(
  "/tenant/subscribe",
  checkAuth(Role.TENANT_OWNER),
  BillingController.createTenantCheckout,
);
router.post(
  "/tenant/downgrade",
  checkAuth(Role.TENANT_OWNER),
  BillingController.downgradeTenantPlan,
);

router.post(
  "/invoices",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  BillingController.createInvoice,
);

router.get(
  "/invoices/overview",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  BillingController.getTenantInvoices,
);

router.get(
  "/tenant/invoices",
  checkAuth(Role.TENANT_OWNER, Role.CENTER_ADMIN),
  BillingController.getTenantInvoices
);

router.get(
  "/guardian/my-invoices",
  checkAuth(Role.GUARDIAN),
  BillingController.getMyGuardianInvoices,
);

router.post(
  "/guardian/pay",
  checkAuth(Role.GUARDIAN),
  BillingController.payGuardianInvoice,
);

export const BillingRoutes = router;
