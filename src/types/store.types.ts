export interface StoreResponse {
  id: string;
  storeCode: string;
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreRequest {
  name: string;
  address: string;
  phone?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  address?: string;
  phone?: string;
}

export interface StoreListParams {
  page?: number;
  size?: number;
  search?: string;
  isActive?: boolean;
}

export interface CounterResponse {
  id: string;
  counterCode: string;
  storeId: string;
  name: string;
  deviceId: string | null;
  isActive: boolean;
}

export interface CreateCounterRequest {
  name: string;
  deviceId?: string;
}

export interface UpdateCounterRequest {
  name?: string;
  deviceId?: string;
}

export interface CounterListParams {
  page?: number;
  size?: number;
  search?: string;
  isActive?: boolean;
}