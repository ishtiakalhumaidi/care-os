/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export const getGuardianInvoices = async () => {
  try {
    const response = await serverApi.get("/billing/guardian/my-invoices");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch guardian invoices",
    );
  }
};

export const payGuardianInvoice = async (invoiceId: string, amount: number) => {
  try {
    const response = await serverApi.post("/billing/guardian/pay", {
      invoiceId,
      amount,
    });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to process invoice payment",
    );
  }
};

export const getPlans = async () => {
  try {
    const response = await serverApi.get("/billing/plans");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch billing plans",
    );
  }
};

export const subscribeTenant = async (planId: string) => {
  try {
    const response = await serverApi.post("/billing/tenant/subscribe", {
      planId,
    });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to subscribe tenant",
    );
  }
};

export const downgradeTenant = async () => {
  try {
    const response = await serverApi.post("/billing/tenant/downgrade");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to schedule downgrade",
    );
  }
};

export const createInvoice = async (data: {
  childId: string;
  amount: number;
  dueDate: string;
  billingPeriodId: string;
}) => {
  try {
    const response = await serverApi.post("/billing/invoices", data);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to create invoice",
    );
  }
};

export const getTenantInvoicesOverview = async () => {
  try {
    const response = await serverApi.get("/billing/tenant/invoices");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch tenant invoices",
    );
  }
};