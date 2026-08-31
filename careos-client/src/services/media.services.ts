/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export const uploadChildMedia = async (childId: string, formData: FormData) => {
  try {
    const response = await serverApi.post(`/media/${childId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload media");
  }
};

export const getChildMedia = async (childId: string) => {
  try {
    const response = await serverApi.get(`/media/${childId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch media");
  }
};
export const deleteChildMedia = async (mediaId: string) => {
  try {
    const response = await serverApi.delete(`/media/${mediaId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete media");
  }
};
