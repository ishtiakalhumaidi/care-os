/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";
export interface IMe {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  
  image?: string;
  branch?: { id: string; name: string };
  classroom?: { id: string; name: string };
  guardianProfile?: {
    id: string;
    relationship: string;
    isPrimary: boolean;
    child: {
      id: string;
      childCode: string;
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      photoUrl?: string;
      status: string;
      rejectionReason?: string;
      suspensionReason?: string;
      branch?: { id: string; name: string };
      classroom?: { id: string; name: string };
    };
  }[];
}

export interface IUserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string;
}

export const getUsers = async (queryString: string) => {
  try {
    const response = await serverApi.get(`/users?${queryString}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch users");
  }
};

export const getMe = async () => {
  try {
    const response = await serverApi.get("/users/me");
    return response.data.data as IMe;
  } catch (error: any) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Unknown error";
    console.error(
      `getMe failed (status: ${status ?? "no response"}): ${message}`,
    );

    if (status === 401 || status === 403) {
      return null;
    }
    throw new Error(message);
  }
};

export const updateMe = async (formData: FormData) => {
  try {
    const response = await serverApi.patch("/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update profile",
    );
  }
};
