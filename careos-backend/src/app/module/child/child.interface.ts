export interface IApplyForChildPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalNotes?: string;
  allergies?: string;
  relationship: string;
  photoUrl?: string;
}

export interface IApproveChildPayload {
  classroomId?: string;
}

export interface IRejectChildPayload {
  rejectionReason: string;
}

export interface ILinkGuardianPayload {
  userId: string;
  relationship: string;
  isPrimary?: boolean;
  canPickup?: boolean;
}

export interface ISuspendChildPayload {
  reason: string;
}

export interface IUpdatePickupPayload {
  canPickup: boolean;
}

export interface ISelfLinkGuardianPayload {
  email: string;
  relationship: string;
  canPickup?: boolean;
}

export interface IAssignClassroomPayload {
  classroomId: string;
}