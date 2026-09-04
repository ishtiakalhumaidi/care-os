/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export interface IGuardianRequest {
  id: string;
  email: string;
  relationship: string;
  canPickup: boolean;

  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "DENIED";
  createdAt: string;
  child: {
    id: string;
    firstName: string;
    lastName: string;
    childCode: string;
    branchId: string;
  };
  requestedBy: { id: string; name: string; email: string };
}

export const requestGuardian = async (
  childId: string,
  payload: { email: string; relationship: string; canPickup?: boolean },
) => {
  try {
    const response = await serverApi.post(
      `/guardian-requests/children/${childId}`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to submit request",
    );
  }
};

export const getPendingGuardianRequests = async () => {
  try {
    const response = await serverApi.get("/guardian-requests");
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch requests",
    );
  }
};

export const approveGuardianRequest = async (id: string) => {
  try {
    const response = await serverApi.patch(`/guardian-requests/${id}/approve`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to approve request",
    );
  }
};

export const denyGuardianRequest = async (id: string, reason?: string) => {
  try {
    const response = await serverApi.patch(`/guardian-requests/${id}/deny`, {
      reason,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to deny request");
  }
};
