export type ReceiptStatus = 'DRAFT' | 'CONFIRMED';

export interface CreateReceiptRequest {
  supplierName?: string;
  notes?: string;
}

export interface AddItemRequest {
  barcode: string;
  productName?: string;
  gstRate?: number;
  categoryId?: string;
  quantity: number;
  mrp: number;
  costPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface UpdateItemRequest {
  quantity?: number;
  mrp?: number;
  costPrice?: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface UpdateBatchPriceRequest {
  mrp?: number;
  sellingPrice?: number;
}

export interface ReceiptItemResponse {
  id: string;
  productId: string;
  productName: string;
  barcode: string | null;
  sku: string;
  quantity: number;
  mrp: number;
  costPrice: number | null;
  batchNumber: string | null;
  expiryDate: string | null;
}

export interface ReceiptResponse {
  id: string;
  storeId: string;
  status: ReceiptStatus;
  supplierName: string | null;
  notes: string | null;
  items: ReceiptItemResponse[];
  createdById: string;
  createdByName: string;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptSummaryResponse {
  id: string;
  storeId: string;
  status: ReceiptStatus;
  supplierName: string | null;
  itemCount: number;
  confirmedAt: string | null;
  createdAt: string;
}

export interface StockLevelResponse {
  productId: string;
  productName: string;
  barcode: string | null;
  sku: string;
  quantity: number;
  reservedQuantity: number;
  lastRestockAt: string | null;
}

export interface BatchResponse {
  id: string;
  mrp: number;
  sellingPrice: number;
  costPrice: number | null;
  quantityReceived: number;
  quantityRemaining: number;
  batchNumber: string | null;
  expiryDate: string | null;
  receivedAt: string;
}

export interface ReceiptImportResult {
  total: number;
  added: number;
  merged: number;
  failed: number;
  errors: ReceiptImportError[];
}

export interface ReceiptImportError {
  row: number;
  reason: string;
}

export interface ReceiptListParams {
  page?: number;
  size?: number;
  status?: ReceiptStatus;
}

export interface StockListParams {
  page?: number;
  size?: number;
  search?: string;
}