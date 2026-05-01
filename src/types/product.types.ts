export interface ProductResponse {
  id: string;
  name: string;
  barcode: string | null;
  sku: string;
  categoryId: string | null;
  categoryName: string | null;
  gstRate: number;
  hsnCode: string | null;
  trackInventory: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  gstRate: number;
  barcode?: string;
  categoryId?: string;
  hsnCode?: string;
  trackInventory: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  barcode?: string;
  categoryId?: string;
  gstRate?: number;
  hsnCode?: string;
  trackInventory?: boolean;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export interface ProductImportError {
  row: number;
  reason: string;
}

export interface ProductImportResult {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  errors: ProductImportError[];
}