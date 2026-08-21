/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export type AttendanceStatus = "PENDING_CHECKIN" | "CHECKED_IN" | "PENDING_CHECKOUT" | "CHECKED_OUT";

export interface IAttendanceRecord {
  id: string;
  childId: string;
  status: AttendanceStatus;
  checkInRequestedAt?: string;
  checkInRequestedBy?: string;
  checkInTime?: string;
  checkedInBy?: string;
  checkOutRequestedAt?: string;
  checkOutRequestedBy?: string;
  checkOutReason?: string;
  checkOutTime?: string;
  checkedOutBy?: string;
  pickedUpByGuardianId?: string;
  child?: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    classroomId?: string;
    guardians?: { id: string; canPickup: boolean; user: { id: string; name: string } }[];
  };
}

export const requestCheckIn = async (childId: string) => {
  try {
    const response = await serverApi.post(`/attendance/${childId}/request-checkin`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to request check-in");
  }
};

export const confirmCheckIn = async (attendanceId: string, offlineTime?: string) => {
  try {
    const response = await serverApi.post(`/attendance/${attendanceId}/confirm-checkin`, {
      offlineTime 
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to confirm check-in");
  }
};

export const requestCheckOut = async (childId: string, reason?: string) => {
  try {
    const response = await serverApi.post(`/attendance/${childId}/request-checkout`, { reason });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to request check-out");
  }
};

export const confirmCheckOut = async (
  attendanceId: string, 
  pickedUpByGuardianId: string,
  offlineTime?: string
) => {
  try {
    const response = await serverApi.post(`/attendance/${attendanceId}/confirm-checkout`, {
      pickedUpByGuardianId,
      offlineTime
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to confirm check-out");
  }
};

export const getCurrentAttendance = async (queryString: string) => {
  try {
    const response = await serverApi.get(`/attendance/current?${queryString}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch attendance");
  }
};

export const getPendingRequests = async (queryString: string) => {
  try {
    const response = await serverApi.get(`/attendance/pending?${queryString}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch pending requests");
  }
};

export const getChildAttendanceHistory = async (childId: string) => {
  try {
    const response = await serverApi.get(`/attendance/child/${childId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch attendance history");
  }
};