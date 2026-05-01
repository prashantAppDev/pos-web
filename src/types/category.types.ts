export interface CategoryResponse {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}

export interface CategoryListParams {
  page?: number;
  size?: number;
  search?: string;
  isActive?: boolean;
}