/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2, FileDown, ShieldCheck, Receipt, Activity } from "lucide-react";
import { downloadComplianceReport } from "@/services/compliance.services";

export default function ComplianceDashboard() {
  const [reportType, setReportType] = useState<"ATTENDANCE" | "BILLING" | "ACTIVITY">("ATTENDANCE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

const handleDownload = async () => {
    if (!startDate || !endDate) return toast.error("Please select a date range.");
    
    try {
      setIsGenerating(true);
      
      const response = await downloadComplianceReport({ 
        type: reportType, 
        startDate: new Date(startDate).toISOString(), 
        endDate: new Date(endDate).toISOString() 
      });

      const byteCharacters = atob(response.base64Data);
      
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `compliance_${reportType.toLowerCase()}_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance & Audits</h1>
        <p className="text-muted-foreground mt-1 text-sm">Generate state licensing and financial PDF reports.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Report Parameters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1.5">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <h3 className="text-sm font-medium text-muted-foreground mb-3">Report Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { id: "ATTENDANCE", label: "Ratio & Attendance", icon: ShieldCheck },
            { id: "BILLING", label: "Billing & Vouchers", icon: Receipt },
            { id: "ACTIVITY", label: "Activity Logs", icon: Activity }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as any)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                reportType === type.id ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <type.icon className="size-6 mb-2" />
              <span className="text-sm font-semibold">{type.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="size-5 animate-spin" /> : <FileDown className="size-5" />}
          Generate & Download PDF
        </button>
      </div>
    </div>
  );
}