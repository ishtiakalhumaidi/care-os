/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverApi } from "@/lib/api-client";

export interface IChildGuardianEntry {
  id: string;
  relationship: string;
  isPrimary: boolean;
  canPickup: boolean;
  user: { id: string; name: string; email: string };
}
export interface ILinkGuardianPayload {
  userId: string;
  relationship: string;
  isPrimary?: boolean;
  canPickup?: boolean;
}


export interface IChild {
  id: string;
  childCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  photoUrl?: string;
  medicalNotes?: string;
  viewerLink?: IChildGuardianEntry;
  allergies?: string;
  status:
    | "APPLIED"
    | "WAITLISTED"
    | "ENROLLED"
    | "SUSPENDED"
    | "REJECTED"
    | "GRADUATED"
    | "ARCHIVED";
  rejectionReason?: string;
  suspensionReason?: string;
  branchId: string;
  classroomId?: string;
  branch?: { id: string; name: string };
  classroom?: { id: string; name: string };
  guardians?: IChildGuardianEntry[];
  createdAt: string;
}

export const applyForChild = async (formData: FormData) => {
  try {
    const response = await serverApi.post("/children/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to submit application",
    );
  }
};

export const getChildren = async (queryString: string) => {
  try {
    const response = await serverApi.get(`/children?${queryString}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch children",
    );
  }
};

export const getChildById = async (id: string) => {
  try {
    const response = await serverApi.get(`/children/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch child");
  }
};

export const approveChild = async (
  id: string,
  payload: { classroomId?: string },
) => {
  try {
    const response = await serverApi.patch(`/children/${id}/approve`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to approve child");
  }
};

export const rejectChild = async (
  id: string,
  payload: { rejectionReason: string },
) => {
  try {
    const response = await serverApi.patch(`/children/${id}/reject`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to reject child");
  }
};

export const linkGuardian = async (
  childId: string,
  payload: ILinkGuardianPayload,
) => {
  try {
    const response = await serverApi.post(
      `/children/${childId}/guardians`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to link guardian");
  }
};

export const suspendChild = async (id: string, payload: { reason: string }) => {
  try {
    const response = await serverApi.patch(`/children/${id}/suspend`, payload);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to suspend child");
  }
};

export const reactivateChild = async (id: string) => {
  try {
    const response = await serverApi.patch(`/children/${id}/reactivate`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to reactivate child",
    );
  }
};

export const unlinkGuardian = async (childId: string, linkId: string) => {
  try {
    const response = await serverApi.delete(`/children/${childId}/guardians/${linkId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to remove guardian");
  }
};

export const getMyChildById = async (id: string) => {
  try {
    const response = await serverApi.get(`/children/mine/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch child");
  }
};

export const updatePickupPermission = async (
  childId: string,
  linkId: string,
  payload: { canPickup: boolean },
) => {
  try {
    const response = await serverApi.patch(
      `/children/${childId}/guardians/${linkId}/pickup`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update pickup permission",
    );
  }
};

export const selfLinkGuardian = async (
  childId: string,
  payload: { email: string; relationship: string; canPickup?: boolean },
) => {
  try {
    const response = await serverApi.post(
      `/children/${childId}/guardians/self`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to add guardian");
  }
};
export const assignClassroom = async (childId: string, classroomId: string) => {
  try {
    const response = await serverApi.patch(`/children/${childId}/classroom`, { classroomId });
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to assign classroom");
  }
};

export const unassignClassroom = async (childId: string) => {
  try {
    const response = await serverApi.patch(`/children/${childId}/classroom/remove`);
    return response.data;
  } catch (error: any) {
    console.error("Backend Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to remove child from classroom",
    );
  }
};


export const selfUnlinkGuardian = async (childId: string, linkId: string) => {
  try {
    const response = await serverApi.delete(
      `/children/${childId}/guardians/${linkId}/self`,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to remove guardian");
  }
};