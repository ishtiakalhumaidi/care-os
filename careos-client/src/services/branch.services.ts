/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export interface ICreateBranchPayload {
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseNumber?: string;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
}

export interface IUpdateBranchPayload {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseNumber?: string;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
  isActive?: boolean;
}

export interface IBranch {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseNumber?: string;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const getLiveRatioMetrics = async (branchId: string) => {
  try {
    const response = await serverApi.get(`/branches/${branchId}/live-ratio`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch live ratio");
  }
};

export const createBranch = async (payload: ICreateBranchPayload) => {
  try {
    const response = await serverApi.post("/branches", payload);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create branch");
  }
};

export const getBranches = async (queryString: string) => {
  try {
    const response = await serverApi.get(`/branches?${queryString}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch branches",
    );
  }
};

export const getBranchById = async (id: string) => {
  try {
    const response = await serverApi.get(`/branches/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch branch");
  }
};

export const updateBranch = async (
  id: string,
  payload: IUpdateBranchPayload,
) => {
  try {
    const response = await serverApi.patch(`/branches/${id}`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update branch");
  }
};

export const deleteBranch = async (id: string) => {
  try {
    const response = await serverApi.delete(`/branches/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to delete branch");
  }
};
