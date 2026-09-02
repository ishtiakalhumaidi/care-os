import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync.js";
import { ComplianceService } from "./compliance.service.js";

const downloadReport = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.tenantId as string;
  const role = req.user!.role;
  const { type, startDate, endDate } = req.query;

  let branchId = req.query.branchId as string | undefined;
  let classroomId = req.query.classroomId as string | undefined;
  let guardianId = undefined;

  if (role === "GUARDIAN") {
    guardianId = req.user!.id; 
    branchId = undefined;     
    classroomId = undefined;  
  } 
  else if (role === "TEACHER") {
    classroomId = req.user!.classroomId as string; 
    branchId = req.user!.branchId as string;
  }
  else if (role === "CENTER_ADMIN") {
    branchId = req.user!.branchId as string; 
  }


  const pdfBuffer = await ComplianceService.generateComplianceReport(
    tenantId,
    type as any,
    startDate as string,
    endDate as string,
    branchId,
    classroomId,
    guardianId
  );

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=report-${type}-${new Date().getTime()}.pdf`);
  res.setHeader("Content-Length", pdfBuffer.length);
  
  res.end(pdfBuffer);
});

export const ComplianceController = { downloadReport };