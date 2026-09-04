/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { publicApi, serverApi } from "@/lib/api-client";

export interface IPlan {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxStudents: number;
  _count?: { tenants: number };
}

export const getPlans = async () => {
  try {
    const response = await serverApi.get("/plans");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch plans");
  }
};

export const getPublicPlans = async (): Promise<IPlan[]> => {
  try {
    const response = await publicApi.get("/plans");
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch plans");
  }
};
 

export const createPlan = async (payload: Omit<IPlan, "id" | "_count">) => {
  try {
    const response = await serverApi.post("/plans", payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create plan");
  }
};

export const updatePlan = async (id: string, payload: Partial<Omit<IPlan, "id" | "_count">>) => {
  try {
    const response = await serverApi.patch(`/plans/${id}`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update plan");
  }
};

export const deletePlan = async (id: string) => {
  try {
    const response = await serverApi.delete(`/plans/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete plan");
  }
};

export const seedDefaultPlans = async () => {
  try {
    const response = await serverApi.post("/plans/seed");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to seed plans");
  }
};