/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, FileDown } from "lucide-react";
import { downloadComplianceReport } from "@/services/compliance.services";

interface DownloadReportButtonProps {
  reportType: "ATTENDANCE" | "BILLING" | "ACTIVITY";
  label: string;
  daysBack?: number;
  classroomId?: string;
}

export default function DownloadReportButton({ 
  reportType, 
  label, 
  daysBack = 30,
  classroomId 
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - daysBack);

      const params: any = {
        type: reportType,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
      
      if (classroomId) params.classroomId = classroomId;

      // 1. Fetch the Base64 response from the server action
      const response = await downloadComplianceReport(params);

      // 2. Decode the Base64 string into raw binary characters
      const byteCharacters = atob(response.base64Data);
      
      // 3. Convert those characters into a typed byte array
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // 4. Construct the Blob using the raw bytes
      const pdfBlob = new Blob([byteArray], { type: "application/pdf" });

      // 5. Generate the download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${reportType.toLowerCase()}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate PDF report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 shadow-sm"
    >
      {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <FileDown className="size-4" />}
      {label}
    </button>
  );
}