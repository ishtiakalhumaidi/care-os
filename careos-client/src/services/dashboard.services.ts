/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export type DashboardPeriod = "7d" | "30d" | "90d";

export interface IMetric {
  label: string;
  value: number | string;
  subtext?: string;
}

export interface IAlert {
  message: string;
  type: "info" | "warning" | "critical";
}

export interface IDashboardData {
  role: string;
  period: string;
  metrics: IMetric[];
  alerts: IAlert[];
  recents: Record<string, any>[];
  details: Record<string, any>;
}

export const getDashboard = async (period: DashboardPeriod = "7d") => {
  try {
    const response = await serverApi.get(`/dashboard?period=${period}`);
    return response.data.data as IDashboardData;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch dashboard"
    );
  }
};  