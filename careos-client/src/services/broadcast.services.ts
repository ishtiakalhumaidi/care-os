/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export interface CreateBroadcastPayload {
  title: string;
  body: string;
  priority: "INFO" | "WARNING" | "CRITICAL";
  audience: "TENANT" | "BRANCH" | "CLASSROOM";
  branchId?: string;
  classroomId?: string;
}

export const createBroadcast = async (data: CreateBroadcastPayload) => {
  try {
    const response = await serverApi.post("/broadcasts", data);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to dispatch broadcast",
    );
  }
};

export const getActiveBroadcasts = async () => {
  try {
    const response = await serverApi.get("/broadcasts");
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch active broadcasts",
    );
  }
};

export const acknowledgeBroadcast = async (broadcastId: string) => {
  try {
    const response = await serverApi.post(`/broadcasts/${broadcastId}/acknowledge`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to acknowledge broadcast",
    );
  }
};