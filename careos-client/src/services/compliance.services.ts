/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export interface ComplianceReportParams {
  type: "ATTENDANCE" | "BILLING" | "ACTIVITY";
  startDate: string;
  endDate: string;
  branchId?: string;
  classroomId?: string;
}

export const downloadComplianceReport = async (params: ComplianceReportParams) => {
  try {
    const response = await serverApi.get("/compliance/reports", {
      params,
      responseType: "arraybuffer", 
    });
    
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    
    return { success: true, base64Data: base64 };
  } catch (error: any) {
  
    if (error.response?.data) {
      try {
    
        const errorText = Buffer.from(error.response.data).toString("utf8");
  
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || "Backend error generating PDF");
      } catch (parseError) {

        throw new Error(`Server Error: ${error.message}`);
      }
    }
    throw new Error(error.message || "Failed to connect to the backend");
  }
};