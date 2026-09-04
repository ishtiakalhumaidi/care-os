/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export const uploadDocument = async (childId: string, formData: FormData) => {
  try {
    const response = await serverApi.post(`/documents/child/${childId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload document");
  }
};

export const getChildDocuments = async (childId: string) => {
  try {
    const response = await serverApi.get(`/documents/child/${childId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch documents");
  }
};

export const signDocument = async (documentId: string) => {
  try {
    const response = await serverApi.patch(`/documents/${documentId}/sign`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to sign document");
  }
};

export const deleteDocument = async (documentId: string) => {
  try {
    const response = await serverApi.delete(`/documents/${documentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete document");
  }
};