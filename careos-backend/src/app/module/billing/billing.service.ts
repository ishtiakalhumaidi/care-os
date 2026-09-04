/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { envVars } from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";
import { InvoiceStatus, Role } from "../../../generated/prisma/enums.js";
import { QueryBuilder } from "../../builder/QueryBuilder.js";
import { BranchService } from "../branch/branch.service.js";

export const stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia",
});

// PLATFORM SAAS BILLING

const createTenantSubscriptionCheckout = async (
  tenantId: string,
  planId: string,
  userEmail: string,
) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });

  const selectedPlan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!tenant)
    throw new AppError(status.NOT_FOUND, "Tenant organization not found");
  if (!selectedPlan)
    throw new AppError(status.NOT_FOUND, "Subscription plan not found");

  let customerId = tenant.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: tenant.name,
      email: userEmail,
      metadata: { tenantId: tenant.id },
    });
    customerId = customer.id;

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { stripeCustomerId: customerId },
    });
  } else {
    await stripe.customers.update(customerId, { email: userEmail });
  }

  if (tenant.stripeSubscriptionId) {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${envVars.FRONTEND_URL}/owner/dashboard/billing`,
    });
    return { url: portalSession.url };
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${selectedPlan.name} Plan`,
            description: `Up to ${selectedPlan.maxStudents} students & ${selectedPlan.maxBranches} branches`,
          },
          unit_amount: Math.round(selectedPlan.price * 100),
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${envVars.FRONTEND_URL}/owner/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/owner/dashboard/billing?canceled=true`,
    client_reference_id: tenantId,
    metadata: {
      billingType: "PLATFORM_SAAS",
      tenantId: tenant.id,
      planId: selectedPlan.id,
    },
  });

  return { url: session.url };
};

const getAvailablePlans = async () => {
  return await prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" },
  });
};

const updatePlanConfig = async (
  planId: string,
  payload: {
    name?: string;
    price?: number;
    maxStudents?: number;
    maxBranches?: number;
  },
) => {
  return await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: payload,
  });
};

const seedPlanConfigs = async () => {
  const defaultPlans = [
    { name: "Starter", price: 49, maxStudents: 30, maxBranches: 1 },
    { name: "Growth", price: 149, maxStudents: 100, maxBranches: 3 },
    { name: "Enterprise", price: 299, maxStudents: 500, maxBranches: 10 },
  ];

  for (const plan of defaultPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  return { message: "Subscription plans seeded successfully" };
};

// TUITION BILLING & SPLIT-CUSTODY (Guardians -> Center)

const createChildInvoice = async (
  user: any,
  payload: {
    childId: string;
    amount: number;
    dueDate: Date;
    billingPeriodId: string;
  },
) => {
  const child = await prisma.child.findFirst({
    where: {
      id: payload.childId,
      ...(user.role === Role.CENTER_ADMIN
        ? { branchId: user.branchId }
        : { tenantId: user.tenantId }),
    },
  });

  if (!child)
    throw new AppError(status.NOT_FOUND, "Child not found or unauthorized");

  return await prisma.invoice.create({
    data: {
      childId: payload.childId,
      amount: payload.amount,
      dueDate: new Date(payload.dueDate),
      billingPeriodId: payload.billingPeriodId,
      status: InvoiceStatus.UNPAID,
    },
  });
};

const getGuardianInvoices = async (userId: string) => {
  const guardianLinks = await prisma.childGuardian.findMany({
    where: { 
      userId,
      child: {
        status: { not: "REJECTED" }
      }
    },
    include: {
      child: {
        include: {
          branch: { select: { name: true } },
          invoices: {
            orderBy: { dueDate: "desc" },
            include: { payments: true },
          },
        },
      },
    },
  });

  return guardianLinks.map((link) => {
    const splitRatio = link.splitPercentage / 100;

    const childInvoices = link.child.invoices.map((inv) => {
      const myTotalShare = Number((inv.amount * splitRatio).toFixed(2));
      const myPaidAmount = inv.payments
        .filter((p) => p.payerId === userId && p.status === InvoiceStatus.PAID)
        .reduce((sum, p) => sum + p.amount, 0);

      const remainingBalance = Math.max(
        0,
        Number((myTotalShare - myPaidAmount).toFixed(2)),
      );

      return {
        id: inv.id,
        totalInvoiceAmount: inv.amount,
        splitPercentage: link.splitPercentage,
        myShare: myTotalShare,
        myPaidAmount,
        remainingBalance,
        dueDate: inv.dueDate,
        billingPeriodId: inv.billingPeriodId,
        isFullyPaid: remainingBalance === 0,
        overallStatus: inv.status,
      };
    });

    return {
      childId: link.child.id,
      childName: `${link.child.firstName} ${link.child.lastName}`,
      branchName: link.child.branch?.name,
      splitPercentage: link.splitPercentage,
      invoices: childInvoices,
    };
  });
};

const createGuardianTuitionCheckout = async (
  userId: string,
  invoiceId: string,
  amount: number,
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { child: true },
  });

  if (!user || !invoice)
    throw new AppError(status.NOT_FOUND, "Invoice or user record not found");

  const guardianLink = await prisma.childGuardian.findFirst({
    where: { childId: invoice.childId, userId },
  });

  if (!guardianLink)
    throw new AppError(status.FORBIDDEN, "Unauthorized for this child invoice");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: user.email,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Tuition for ${invoice.child.firstName} ${invoice.child.lastName}`,
            description: `Invoice ID: ${invoice.id.slice(0, 8)} (${guardianLink.splitPercentage}% split share)`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      billingType: "GUARDIAN_TUITION",
      invoiceId: invoice.id,
      payerId: userId,
      childId: invoice.childId,
    },
    success_url: `${envVars.FRONTEND_URL}/guardian/dashboard/billing/success`,
    cancel_url: `${envVars.FRONTEND_URL}/guardian/dashboard/billing?canceled=true`,
  });

  return { url: session.url };
};

// BRANCH & TENANT REVENUE ANALYTICS

const getTenantBillingOverview = async (
  user: any,
  query: Record<string, unknown>,
) => {
  if (![Role.TENANT_OWNER, Role.CENTER_ADMIN].includes(user.role)) {
    throw new AppError(status.FORBIDDEN, "Unauthorized");
  }

  const childWhere =
    user.role === Role.CENTER_ADMIN
      ? { branchId: user.branchId }
      : { tenantId: user.tenantId };

  const allowedChildren = await prisma.child.findMany({
    where: childWhere,
    select: { id: true },
  });
  const allowedChildIds = allowedChildren.map((c) => c.id);

  if (allowedChildIds.length === 0) {
    return {
      data: [],
      meta: {
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
        total: 0,
      },
      totalBilled: 0,
      totalInvoicesCount: 0,
    };
  }

  const scopedQuery = {
    ...query,
    childId:
      query.childId && allowedChildIds.includes(query.childId as string)
        ? query.childId
        : { in: allowedChildIds },
  };

  const invoiceQuery = new QueryBuilder(prisma.invoice, scopedQuery, {
    searchableFields: ["billingPeriodId"],
    filterableFields: ["status", "childId"],
  })
    .filter()
    .paginate()
    .sort()
    .dynamicInclude({
      child: {
        select: {
          firstName: true,
          lastName: true,
          childCode: true,
          branch: { select: { id: true, name: true } },
        },
      },
      payments: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
          payerId: true,
        },
      },
    });

  const executedInvoices = await invoiceQuery.execute();

  const aggregateSummary = await prisma.invoice.aggregate({
    where: {
      childId: { in: allowedChildIds },
      ...(query.status ? { status: query.status as InvoiceStatus } : {}),
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  return {
    ...executedInvoices,
    totalBilled: aggregateSummary._sum.amount || 0,
    totalInvoicesCount: aggregateSummary._count.id,
  };
};
// STRIPE WEBHOOK RECONCILIATION

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case "customer.subscription.updated": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!tenant) break;

      const startDate = new Date(subscription.current_period_start * 1000);
      const endDate = new Date(subscription.current_period_end * 1000);

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          currentPeriodStart: startDate,
          currentPeriodEnd: endDate,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          isActive: subscription.status === "active",
        },
      });

      const syncResult = await BranchService.syncBranchActivationToPlan(tenant.id);
      if (syncResult.activated.length > 0) {
        console.log(`Unlocked ${syncResult.activated.length} branches for Tenant ${tenant.id}`);
      }
      if (syncResult.locked.length > 0) {
        console.log(`Locked ${syncResult.locked.length} excess branches for Tenant ${tenant.id}`);
      }
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const billingType = session.metadata?.billingType;

      try {
        if (billingType === "PLATFORM_SAAS") {
          const tenantId = session.metadata?.tenantId || (session.client_reference_id as string);
          const planId = session.metadata?.planId;

          const subscription = session.subscription;
          const subscriptionId = typeof subscription === "string" ? subscription : (subscription as any)?.id;

          if (tenantId && planId) {
            let startDate = new Date();
            let endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            if (subscriptionId) {
              const stripeSub = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
              if (stripeSub.current_period_start) {
                startDate = new Date(stripeSub.current_period_start * 1000);
              }
              if (stripeSub.current_period_end) {
                endDate = new Date(stripeSub.current_period_end * 1000);
              }
            }

            await prisma.tenant.update({
              where: { id: tenantId },
              data: {
                planId: planId,
                isActive: true,
                stripeSubscriptionId: subscriptionId || null,
                currentPeriodStart: startDate,
                currentPeriodEnd: endDate,
                cancelAtPeriodEnd: false,
              },
            });

            const syncResult = await BranchService.syncBranchActivationToPlan(tenantId);
            if (syncResult.activated.length > 0) {
              console.log(`Unlocked ${syncResult.activated.length} branches for Tenant ${tenantId} after upgrade`);
            }

            console.log(`Tenant ${tenantId} successfully upgraded to plan ${planId}`);
          }
        }

        if (billingType === "GUARDIAN_TUITION") {
          const invoiceId = session.metadata?.invoiceId;
          const payerId = session.metadata?.payerId;
          const amountPaid = (session.amount_total || 0) / 100;
          const transactionId = (session.payment_intent as string) || session.id;

          if (invoiceId && payerId) {
            await prisma.payment.upsert({
              where: { transactionId },
              update: {},
              create: {
                amount: amountPaid,
                transactionId,
                stripeEventId: event.id,
                status: InvoiceStatus.PAID,
                invoiceId,
                payerId,
              },
            });

            const invoice = await prisma.invoice.findUnique({
              where: { id: invoiceId },
              include: { payments: true },
            });

            if (invoice) {
              const totalCollected = invoice.payments
                .filter((p) => p.status === InvoiceStatus.PAID)
                .reduce((sum, p) => sum + p.amount, 0);

              if (totalCollected >= invoice.amount) {
                await prisma.invoice.update({
                  where: { id: invoiceId },
                  data: { status: InvoiceStatus.PAID },
                });
              }
            }
            console.log(`Guardian payment logged for invoice ${invoiceId}`);
          }
        }
      } catch (error: any) {
        console.error("WEBHOOK CRASH IN CHECKOUT.SESSION.COMPLETED:", error.message);
      }
      break;
    }

    case "invoice.paid":
    case "invoice.payment_succeeded": {
      const stripeInvoice = event.data.object as any;
      const customerId = stripeInvoice.customer as string;

      const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (tenant) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { isActive: true },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      const tenant = await prisma.tenant.findFirst({
        where: { stripeCustomerId: customerId },
      });

      if (!tenant) {
        return { message: "Tenant not found for this subscription." };
      }

      const freePlan = await prisma.subscriptionPlan.findFirst({
        where: { price: 0 },
      });

      if (!freePlan)
        throw new Error("CRITICAL: Free plan not found in database.");

      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          planId: freePlan.id,
          stripeSubscriptionId: null,
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        },
      });

      // ─── FIX: Bidirectional sync after downgrade to free plan ───
      const syncResult = await BranchService.syncBranchActivationToPlan(tenant.id);
      if (syncResult.locked.length > 0) {
        console.log(
          `Locked ${syncResult.locked.length} excess branches for Tenant ${tenant.id} due to downgrade.`,
        );
      }
      if (syncResult.activated.length > 0) {
        console.log(
          `Unlocked ${syncResult.activated.length} branches for Tenant ${tenant.id} (within free plan limit).`,
        );
      }

      break;
    }

    default:
      break;
  }

  return { message: `Webhook event ${event.id} handled successfully` };
};

const scheduleTenantDowngrade = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

  if (!tenant || !tenant.stripeSubscriptionId) {
    throw new AppError(
      status.BAD_REQUEST,
      "No active paid subscription found.",
    );
  }

  if (tenant.cancelAtPeriodEnd) {
    return tenant; 
  }

  await stripe.subscriptions.update(tenant.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { cancelAtPeriodEnd: true },
  });

  return updatedTenant;
};

export const BillingService = {
  createTenantSubscriptionCheckout,
  getAvailablePlans,
  updatePlanConfig,
  seedPlanConfigs,
  createChildInvoice,
  getGuardianInvoices,
  createGuardianTuitionCheckout,
  getTenantBillingOverview,
  handleStripeWebhookEvent,
  scheduleTenantDowngrade,
};
