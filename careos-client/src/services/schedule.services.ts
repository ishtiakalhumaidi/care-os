/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { serverApi } from "@/lib/api-client";

export const createShift = async (payload: any) => {
  try {
    const response = await serverApi.post(`/schedules`, payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create shift");
  }
};

export const getBranchWeeklySchedule = async (branchId: string, startDate: string, endDate: string) => {
  try {
    const response = await serverApi.get(`/schedules/branch/${branchId}/weekly?start=${startDate}&end=${endDate}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch weekly schedule");
  }
};

export const getMyUpcomingShifts = async () => {
  try {
    const response = await serverApi.get(`/schedules/my-upcoming`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch your shifts");
  }
};

export const clockIn = async (shiftId?: string) => {
  try {
    const response = await serverApi.post(`/schedules/timesheet/clock-in`, { shiftId });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to clock in");
  }
};

export const clockOut = async () => {
  try {
    const response = await serverApi.post(`/schedules/timesheet/clock-out`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to clock out");
  }
};

export const getCurrentTimesheet = async () => {
  try {
    const response = await serverApi.get(`/schedules/timesheet/current`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch timesheet status");
  }
};

export const getMyTimesheetHistory = async () => {
  try {
    const response = await serverApi.get(`/schedules/timesheet/history`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch timesheet history");
  }
};