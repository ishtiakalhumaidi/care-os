export interface ICreateBranchPayload {
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseNumber?: string;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
  tenantId: string;
}

export interface IUpdateBranchPayload {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  licenseNumber?: string;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
}