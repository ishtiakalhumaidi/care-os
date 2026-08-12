import status from "http-status";
import { catchAsync } from "../../shared/catchAsync.js";
import { sendResponse } from "../../shared/sendResponse.js";
import { ChildService } from "./child.service.js";
import { uploadToCloudinary } from "../../config/cloudinary.config.js";
const applyForChild = catchAsync(async (req, res) => {
    const payload = req.body;
    const guardianId = req.user.id;
    const tenantId = req.user.tenantId;
    const branchId = req.user.branchId;
    if (!branchId) {
        return sendResponse(res, {
            httpStatusCode: status.BAD_REQUEST,
            success: false,
            message: "Your account has no branch assigned. Contact your center admin.",
            data: null,
        });
    }
    let uploadedPublicId;
    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, `tenants/${tenantId}/children`);
        payload.photoUrl = result.secure_url;
        uploadedPublicId = result.public_id;
    }
    try {
        const child = await ChildService.applyForChild(payload, guardianId, tenantId, branchId);
        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "Application submitted. A staff member will review it shortly.",
            data: child,
        });
    }
    catch (error) {
        if (uploadedPublicId) {
            const { v2: cloudinary } = await import("cloudinary");
            await cloudinary.uploader.destroy(uploadedPublicId).catch(() => { });
        }
        throw error;
    }
});
const getAllChildren = catchAsync(async (req, res) => {
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const branchId = role === "TENANT_OWNER" ? undefined : req.user.branchId;
    const classroomId = role === "TEACHER" ? req.user.classroomId : undefined;
    const result = await ChildService.getAllChildren(req.query, tenantId, branchId, classroomId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Children fetched successfully",
        data: result.data,
        meta: result.meta,
    });
});
const getChildById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const branchId = role === "TENANT_OWNER" ? undefined : req.user.branchId;
    const classroomId = role === "TEACHER" ? req.user.classroomId : undefined;
    const result = await ChildService.getChildById(id, tenantId, branchId, classroomId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Child fetched successfully",
        data: result,
    });
});
const getMyChildById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const guardianId = req.user.id;
    const tenantId = req.user.tenantId;
    const result = await ChildService.getMyChildById(id, guardianId, tenantId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Child fetched successfully",
        data: result,
    });
});
const updatePickupPermission = catchAsync(async (req, res) => {
    const { id, linkId } = req.params;
    const requesterId = req.user.id;
    const tenantId = req.user.tenantId;
    const result = await ChildService.updatePickupPermission(id, linkId, requesterId, tenantId, req.body);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Pickup permission updated",
        data: result,
    });
});
const selfUnlinkGuardian = catchAsync(async (req, res) => {
    const { id, linkId } = req.params;
    const requesterId = req.user.id;
    const tenantId = req.user.tenantId;
    await ChildService.selfUnlinkGuardian(id, linkId, requesterId, tenantId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Guardian removed",
        data: null,
    });
});
const approveChild = catchAsync(async (req, res) => {
    const { id } = req.params;
    const staffId = req.user.id;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER"
        ? undefined
        : req.user.branchId;
    const result = await ChildService.approveChild(id, req.body, staffId, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Child enrolled successfully",
        data: result,
    });
});
const rejectChild = catchAsync(async (req, res) => {
    const { id } = req.params;
    const staffId = req.user.id;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER"
        ? undefined
        : req.user.branchId;
    const result = await ChildService.rejectChild(id, req.body, staffId, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Application rejected",
        data: result,
    });
});
const linkGuardian = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER"
        ? undefined
        : req.user.branchId;
    const result = await ChildService.linkGuardian(id, req.body, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Guardian linked successfully",
        data: result,
    });
});
const unlinkGuardian = catchAsync(async (req, res) => {
    const { id, linkId } = req.params;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER" ? undefined : req.user.branchId;
    await ChildService.unlinkGuardian(id, linkId, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Guardian removed",
        data: null,
    });
});
const suspendChild = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER"
        ? undefined
        : req.user.branchId;
    const result = await ChildService.suspendChild(id, req.body, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Child suspended",
        data: result,
    });
});
const reactivateChild = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER"
        ? undefined
        : req.user.branchId;
    const result = await ChildService.reactivateChild(id, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Child reactivated",
        data: result,
    });
});
const assignClassroom = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER" ? undefined : req.user.branchId;
    const result = await ChildService.assignClassroom(id, req.body, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Classroom assigned successfully",
        data: result,
    });
});
const unassignClassroom = catchAsync(async (req, res) => {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const staffBranchId = req.user.role === "TENANT_OWNER"
        ? undefined
        : req.user.branchId;
    const result = await ChildService.unassignClassroom(id, tenantId, staffBranchId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Child removed from classroom",
        data: result,
    });
});
export const ChildController = {
    applyForChild,
    getAllChildren,
    getChildById,
    getMyChildById,
    approveChild,
    rejectChild,
    linkGuardian,
    suspendChild,
    reactivateChild,
    unlinkGuardian,
    selfUnlinkGuardian,
    updatePickupPermission,
    assignClassroom,
    unassignClassroom
};
