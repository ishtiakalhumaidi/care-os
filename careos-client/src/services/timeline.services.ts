/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export type EventType =
  | "MEAL"
  | "NAP"
  | "BATHROOM"
  | "INCIDENT"
  | "NOTE"
  | "LEARNING";

export interface ITimelineEvent {
  id: string;
  childId: string;
  eventType: EventType;
  description: string | null;
  loggedBy: string;
  loggedAt: string;
}

export const logTimelineEvent = async (
  childId: string,
  payload: { eventType: EventType; description?: string },
) => {
  try {
    const response = await serverApi.post(
      `/timeline/${childId}/events`,
      payload
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to log timeline event"
    );
  }
};

export const getDailyTimeline = async (childId: string, date?: string) => {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    const response = await serverApi.get(
      `/timeline/${childId}/events${query}`
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch daily timeline"
    );
  }
};

export const getClassroomDailyMatrix = async (classroomId: string, date?: string) => {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    const response = await serverApi.get(`/timeline/classroom/${classroomId}/matrix${query}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch classroom matrix");
  }
};

export const getBranchAuditStream = async (branchId: string, date?: string) => {
  try {
    const query = date ? `?date=${encodeURIComponent(date)}` : "";
    const response = await serverApi.get(`/timeline/branch/${branchId}/audit${query}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch audit stream");
  }
};

export const getChildDailyTimeline = async (childId: string, date?: string) => {
  try {
    const query = date ? `?date=${date}` : "";
    const response = await serverApi.get(`/timeline/${childId}/events${query}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch timeline");
  }
};