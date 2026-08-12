export interface ICreateGuardianRequestPayload {
  email: string;
  relationship: string;
  canPickup?: boolean;
}

export interface IDenyGuardianRequestPayload {
  reason?: string;
}