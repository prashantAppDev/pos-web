export type SubscriptionPlan = 'BASIC';

export interface TenantResponse {
  id: string;
  tenantCode: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber: string | null;
  subscription: SubscriptionPlan;
  isPlatform: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantCreatedResponse {
  tenant: TenantResponse;
  inviteLink: string;
}

export interface CreateTenantRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
}

export interface UpdateTenantRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

export interface TenantListParams {
  page?: number;
  size?: number;
  search?: string;
  isActive?: boolean;
}
