import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";
import status from "http-status";
import { generatePDFBuffer } from "../../utils/pdf.util.js";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

const BRAND = {
  primary: "#2563eb",
  primarySoft: "#eff6ff",
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  border: "#e2e8f0",
  surface: "#f8fafc",
  success: "#059669",
  successSoft: "#ecfdf5",
  danger: "#dc2626",
  dangerSoft: "#fef2f2",
};

const careOSMark = (color: string) => `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="12" cy="12" r="4" fill="${color}" />
  <circle cx="20" cy="16" r="2.8" fill="${color}" opacity="0.75" />
  <path d="M7 17C8.5 23 13 27 18.5 27C23.5 27 27.5 23.5 29 18"
    stroke="${color}" stroke-width="4" stroke-linecap="round" />
</svg>`;

const REPORT_LABEL: Record<"ATTENDANCE" | "BILLING" | "ACTIVITY", string> = {
  ATTENDANCE: "Attendance Report",
  BILLING: "Billing Report",
  ACTIVITY: "Activity Report",
};

export const generateComplianceReport = async (
  tenantId: string,
  reportType: "ATTENDANCE" | "BILLING" | "ACTIVITY",
  startDate: string,
  endDate: string,
  branchId?: string,
  classroomId?: string,
  guardianId?: string,
) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const childFilter: any = { tenantId };
  if (branchId) childFilter.branchId = branchId;
  if (classroomId) childFilter.classroomId = classroomId;
  if (guardianId) childFilter.guardians = { some: { userId: guardianId } };

  let orgName = "Care OS";
  let licenseNumber: string | null = null;
  if (branchId) {
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    if (branch) {
      orgName = branch.name;
      licenseNumber = branch.licenseNumber || null;
    }
  } else {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) orgName = tenant.name;
  }

  const generatedAt = new Date();

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 96, 40, 56],
    defaultStyle: { font: "Helvetica", fontSize: 10, color: BRAND.body },

    styles: {
      title: { fontSize: 22, bold: true, color: BRAND.ink },
      subtitle: { fontSize: 10.5, color: BRAND.muted, margin: [0, 4, 0, 0] },
      sectionLabel: {
        fontSize: 8.5,
        bold: true,
        color: BRAND.muted,
        characterSpacing: 0.6,
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        color: "#ffffff",
        fillColor: BRAND.primary,
        margin: [6, 6, 6, 6],
      },
      tableHeaderRight: {
        bold: true,
        fontSize: 9,
        color: "#ffffff",
        fillColor: BRAND.primary,
        alignment: "right",
        margin: [6, 6, 6, 6],
      },
      tableHeaderCenter: {
        bold: true,
        fontSize: 9,
        color: "#ffffff",
        fillColor: BRAND.primary,
        alignment: "center",
        margin: [6, 6, 6, 6],
      },
      amount: { alignment: "right", bold: true, color: BRAND.ink },
    },

    header: (currentPage, pageCount) => ({
      margin: [40, 24, 40, 0],
      stack: [
        {
          columns: [
            {
              svg: careOSMark(BRAND.primary),
              width: 22,
              height: 22,
            },
            {
              width: "auto",
              margin: [8, 1, 0, 0],
              stack: [
                {
                  text: [
                    { text: "Care", color: BRAND.ink, bold: true },
                    { text: "OS", color: BRAND.primary, bold: true },
                  ],
                  fontSize: 13,
                },
              ],
            },
            {
              width: "*",
              alignment: "right",
              stack: [
                { text: orgName, bold: true, color: BRAND.ink, fontSize: 9.5 },
                licenseNumber
                  ? {
                      text: `License No. ${licenseNumber}`,
                      color: BRAND.faint,
                      fontSize: 8,
                    }
                  : { text: "", fontSize: 8 },
              ],
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 12,
              x2: 515,
              y2: 12,
              lineWidth: 1,
              lineColor: BRAND.border,
            },
          ],
        },
      ],
    }),

    footer: (currentPage, pageCount) => ({
      margin: [40, 10, 40, 0],
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: BRAND.border,
            },
          ],
        },
        {
          margin: [0, 8, 0, 0],
          columns: [
            {
              text: "Care OS — Confidential",
              fontSize: 8,
              color: BRAND.faint,
              width: "*",
            },
            {
              text: `Page ${currentPage} of ${pageCount}`,
              fontSize: 8,
              color: BRAND.faint,
              alignment: "center",
              width: "*",
            },
            {
              text: `Generated ${generatedAt.toLocaleDateString()} ${generatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              fontSize: 8,
              color: BRAND.faint,
              alignment: "right",
              width: "*",
            },
          ],
        },
      ],
    }),

    content: [
      {
        columns: [
          {
            width: 4,
            canvas: [
              {
                type: "rect",
                x: 0,
                y: 4,
                w: 4,
                h: 30,
                r: 2,
                color: BRAND.primary,
              },
            ],
          },
          {
            width: "*",
            margin: [12, 0, 0, 0],
            stack: [
              { text: REPORT_LABEL[reportType], style: "title" },
              {
                text: `${start.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}  —  ${end.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`,
                style: "subtitle",
              },
            ],
          },
        ],
        margin: [0, 0, 0, 24],
      },
    ],
  };

  const reportTableLayout = {
    hLineWidth: (i: number, node: any) =>
      i === 0 || i === node.table.body.length ? 0 : 1,
    vLineWidth: () => 0,
    hLineColor: () => BRAND.border,
    paddingLeft: () => 8,
    paddingRight: () => 8,
    paddingTop: () => 7,
    paddingBottom: () => 7,
    fillColor: (rowIndex: number) =>
      rowIndex > 0 && rowIndex % 2 === 0 ? BRAND.surface : null,
  };

  const badge = (text: string, tone: "success" | "danger" | "neutral") => {
    const palette = {
      success: { fg: BRAND.success, bg: BRAND.successSoft },
      danger: { fg: BRAND.danger, bg: BRAND.dangerSoft },
      neutral: { fg: BRAND.muted, bg: BRAND.surface },
    }[tone];
    return {
      text,
      alignment: "center",
      bold: true,
      fontSize: 8.5,
      color: palette.fg,
      fillColor: palette.bg,
      margin: [4, 4, 4, 4],
    };
  };

  const metricCard = (label: string, value: string, accent?: string) => ({
    stack: [
      { text: label.toUpperCase(), style: "sectionLabel" },
      {
        text: value,
        fontSize: 17,
        bold: true,
        color: accent || BRAND.ink,
        margin: [0, 4, 0, 0],
      },
    ],
    margin: [16, 14, 16, 14],
  });

  if (reportType === "BILLING") {
    const invoices = await prisma.invoice.findMany({
      where: {
        child: childFilter,
        createdAt: { gte: start, lte: end },
        status: { not: "DRAFT" },
      },
      include: { child: true },
      orderBy: { createdAt: "desc" },
    });

    const billable = invoices.filter((i) => i.status !== "VOID");
    console.log(billable);
    const totalBilled = billable.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = billable
      .filter((i) => i.status === "PAID" )
      .reduce((sum, inv) => sum + inv.amount, 0);
    const totalDue = totalBilled - totalCollected;

    (docDefinition.content as any[]).push({
      table: {
        widths: ["*", "*", "*"],
        body: [
          [
            metricCard("Total Invoiced", `$${totalBilled.toFixed(2)}`),
            metricCard(
              "Total Collected",
              `$${totalCollected.toFixed(2)}`,
              BRAND.success,
            ),
            metricCard(
              "Outstanding Due",
              `$${totalDue.toFixed(2)}`,
              totalDue > 0 ? BRAND.danger : BRAND.ink,
            ),
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: (i: number) => (i === 1 || i === 2 ? 1 : 0),
        hLineColor: () => BRAND.border,
        vLineColor: () => BRAND.border,
      },
      margin: [0, 0, 0, 20],
    });

    const tableBody: any[][] = [
      [
        { text: "Invoice Date", style: "tableHeader" },
        { text: "Student", style: "tableHeader" },
        { text: "Due Date", style: "tableHeader" },
        { text: "Amount", style: "tableHeaderRight" },
        { text: "Status", style: "tableHeaderCenter" },
      ],
    ];

    invoices.forEach((inv) => {
      tableBody.push([
        {
          text: new Date(inv.createdAt).toLocaleDateString(),
          color: BRAND.muted,
        },
        {
          text: `${inv.child.firstName} ${inv.child.lastName}`,
          bold: true,
          color: BRAND.ink,
        },
        {
          text: new Date(inv.dueDate).toLocaleDateString(),
          color: inv.status === "UNPAID" ? BRAND.danger : BRAND.muted,
        },
        { text: `$${inv.amount.toFixed(2)}`, style: "amount" },
        inv.status === "PAID"
          ? badge("PAID", "success")
          : badge("DUE", "danger"),
      ]);
    });

    (docDefinition.content as any[]).push({
      table: {
        headerRows: 1,
        widths: ["auto", "*", "auto", "auto", "auto"],
        body: tableBody,
      },
      layout: reportTableLayout,
    });
  } else if (reportType === "ATTENDANCE") {
    const attendance = await prisma.attendance.findMany({
      where: { child: childFilter, checkInTime: { gte: start, lte: end } },
      include: { child: true },
      orderBy: { checkInTime: "asc" },
    });

    const tableBody: any[][] = [
      [
        { text: "Student", style: "tableHeader" },
        { text: "Check-In", style: "tableHeader" },
        { text: "Check-Out", style: "tableHeader" },
      ],
    ];

    attendance.forEach((rec) => {
      tableBody.push([
        {
          text: `${rec.child.firstName} ${rec.child.lastName}`,
          bold: true,
          color: BRAND.ink,
        },
        {
          text: rec.checkInTime
            ? new Date(rec.checkInTime).toLocaleString()
            : "N/A",
          color: BRAND.muted,
        },
        rec.checkOutTime
          ? {
              text: new Date(rec.checkOutTime).toLocaleString(),
              color: BRAND.muted,
            }
          : badge("ACTIVE", "success"),
      ]);
    });

    (docDefinition.content as any[]).push({
      table: { headerRows: 1, widths: ["*", "auto", "auto"], body: tableBody },
      layout: reportTableLayout,
    });
  } else if (reportType === "ACTIVITY") {
    const events = await prisma.timelineEvent.findMany({
      where: { child: childFilter, loggedAt: { gte: start, lte: end } },
      include: { child: true },
      orderBy: { loggedAt: "desc" },
    });

    const tableBody: any[][] = [
      [
        { text: "Date & Time", style: "tableHeader" },
        { text: "Student", style: "tableHeader" },
        { text: "Event Type", style: "tableHeader" },
        { text: "Description", style: "tableHeader" },
      ],
    ];

    events.forEach((ev) => {
      tableBody.push([
        { text: new Date(ev.loggedAt).toLocaleString(), color: BRAND.muted },
        {
          text: `${ev.child.firstName} ${ev.child.lastName}`,
          bold: true,
          color: BRAND.ink,
        },
        badge(ev.eventType, "neutral"),
        { text: ev.description || "—", color: BRAND.body },
      ]);
    });

    (docDefinition.content as any[]).push({
      table: {
        headerRows: 1,
        widths: ["auto", "auto", "auto", "*"],
        body: tableBody,
      },
      layout: reportTableLayout,
    });
  }

  return await generatePDFBuffer(docDefinition);
};

export const ComplianceService = { generateComplianceReport };
