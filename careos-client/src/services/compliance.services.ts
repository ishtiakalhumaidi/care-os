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
    // 1. Check if the error response contains binary data
    if (error.response?.data) {
      try {
        // 2. Decode the binary buffer back into a UTF-8 string
        const errorText = Buffer.from(error.response.data).toString("utf8");
        // 3. Parse the JSON to extract the real backend message
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || "Backend error generating PDF");
      } catch (parseError) {
        // Fallback if the backend completely crashed and returned HTML/Text
        throw new Error(`Server Error: ${error.message}`);
      }
    }
    throw new Error(error.message || "Failed to connect to the backend");
  }
};