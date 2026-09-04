/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  FileDown,
  ShieldCheck,
  Receipt,
  Activity,
  Calendar,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";
import { downloadComplianceReport } from "@/services/compliance.services";

type ReportType = "ATTENDANCE" | "BILLING" | "ACTIVITY";

interface ReportOption {
  id: ReportType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

const reportTypes: ReportOption[] = [
  {
    id: "ATTENDANCE",
    label: "Ratio & Attendance",
    description: "Staff-to-child ratios, check-in/out logs, and daily headcounts for licensing audits.",
    icon: ShieldCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-900",
  },
  {
    id: "BILLING",
    label: "Billing & Vouchers",
    description: "Invoice summaries, payment records, and guardian billing splits for financial review.",
    icon: Receipt,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900",
  },
  {
    id: "ACTIVITY",
    label: "Activity Logs",
    description: "Timeline events, incident reports, and daily activity records per child.",
    icon: Activity,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900",
  },
];

export default function ComplianceDashboard() {
  const [reportType, setReportType] = useState<ReportType>("ATTENDANCE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentDownloads, setRecentDownloads] = useState<
    { type: ReportType; date: string; timestamp: number }[]
  >([]);

  const activeReport = reportTypes.find((r) => r.id === reportType)!;

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast.error("Start date must be before end date.");
      return;
    }

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      toast.error("Date range cannot exceed 1 year.");
      return;
    }

    try {
      setIsGenerating(true);

      const response = await downloadComplianceReport({
        type: reportType,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
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
      link.setAttribute(
        "download",
        `compliance_${reportType.toLowerCase()}_${Date.now()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setRecentDownloads((prev) => [
        { type: reportType, date: new Date().toLocaleString(), timestamp: Date.now() },
        ...prev.slice(0, 4),
      ]);

      toast.success("Report downloaded successfully", {
        description: `${activeReport.label} · ${start.toLocaleDateString()} – ${end.toLocaleDateString()}`,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearDates = () => {
    setStartDate("");
    setEndDate("");
  };

  const isRangeValid = startDate && endDate && new Date(startDate) <= new Date(endDate);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Compliance & Audits
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate state licensing and financial PDF reports for audits and record-keeping.
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Date Range */}
        <div className="border-b p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Calendar className="size-4 text-muted-foreground" />
              Date Range
            </h3>
            {(startDate || endDate) && (
              <button
                onClick={clearDates}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-3" />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {isRangeValid && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span>
                {Math.ceil(
                  (new Date(endDate).getTime() - new Date(startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days selected
              </span>
            </div>
          )}
        </div>

        {/* Report Type Selection */}
        <div className="border-b p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Select Report Type
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {reportTypes.map((type) => {
              const isActive = reportType === type.id;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`relative flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all ${
                    isActive
                      ? `${type.border} ${type.bg} ring-1 ring-offset-0`
                      : "border-border bg-card hover:border-muted-foreground/25 hover:bg-muted/30"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-3 top-3">
                      <div className={`flex size-5 items-center justify-center rounded-full ${type.bg} ${type.border} border`}>
                        <CheckCircle2 className={`size-3.5 ${type.color}`} />
                      </div>
                    </div>
                  )}
                  <div
                    className={`mb-3 flex size-10 items-center justify-center rounded-lg ${
                      isActive ? "bg-white dark:bg-background shadow-sm" : "bg-muted"
                    }`}
                  >
                    <Icon className={`size-5 ${isActive ? type.color : "text-muted-foreground"}`} />
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {type.label}
                  </span>
                  <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {type.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Action */}
        <div className="p-6">
          <button
            onClick={handleDownload}
            disabled={isGenerating || !isRangeValid}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="size-4" />
                Generate & Download Report
              </>
            )}
          </button>

          {!isRangeValid && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="size-3" />
              Select a date range to generate the report
            </p>
          )}
        </div>
      </div>

      {/* Report Preview / Info */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          What&apos;s included in this report
        </h3>
        <div className="space-y-2">
          {reportType === "ATTENDANCE" && (
            <>
              <InfoRow icon={CheckCircle2} text="Daily check-in and check-out timestamps" />
              <InfoRow icon={CheckCircle2} text="Staff-to-child ratio compliance per classroom" />
              <InfoRow icon={CheckCircle2} text="Absentee and tardy summaries" />
              <InfoRow icon={CheckCircle2} text="Guardian pickup authorization logs" />
            </>
          )}
          {reportType === "BILLING" && (
            <>
              <InfoRow icon={CheckCircle2} text="Invoice generation and payment status" />
              <InfoRow icon={CheckCircle2} text="Guardian billing split percentages" />
              <InfoRow icon={CheckCircle2} text="Outstanding balances and overdue accounts" />
              <InfoRow icon={CheckCircle2} text="Revenue summary for the selected period" />
            </>
          )}
          {reportType === "ACTIVITY" && (
            <>
              <InfoRow icon={CheckCircle2} text="Timeline events logged by staff" />
              <InfoRow icon={CheckCircle2} text="Meal, nap, and activity records" />
              <InfoRow icon={CheckCircle2} text="Incident reports and observations" />
              <InfoRow icon={CheckCircle2} text="Photo and media upload audit trail" />
            </>
          )}
        </div>
      </div>

      {/* Recent Downloads */}
      {recentDownloads.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="size-4 text-muted-foreground" />
            Recent Downloads
          </h3>
          <div className="space-y-2">
            {recentDownloads.map((dl, i) => {
              const rt = reportTypes.find((r) => r.id === dl.type)!;
              const Icon = rt.icon;
              return (
                <div
                  key={dl.timestamp}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${rt.bg}`}>
                      <Icon className={`size-4 ${rt.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{rt.label}</p>
                      <p className="text-xs text-muted-foreground">{dl.date}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    Downloaded
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper ─── */
function InfoRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <Icon className="size-4 text-emerald-500" />
      {text}
    </div>
  );
}