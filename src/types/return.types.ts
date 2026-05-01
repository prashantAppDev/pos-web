export type ReturnReason = 'DEFECTIVE' | 'EXPIRED' | 'WRONG_ITEM' | 'CUSTOMER_CHANGED_MIND' | 'OTHER';

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  DEFECTIVE: 'Defective',
  EXPIRED: 'Expired',
  WRONG_ITEM: 'Wrong Item',
  CUSTOMER_CHANGED_MIND: 'Changed Mind',
  OTHER: 'Other',
};

export interface ReturnItemRequest {
  saleItemId: string;
  quantity: number;
  reason: ReturnReason;
}

export interface CreateReturnRequest {
  saleId: string;
  items: ReturnItemRequest[];
  notes?: string;
}

export interface ReturnItemResponse {
  id: string;
  saleItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  totalPrice: number;
  reason: ReturnReason;
}

export interface ReturnResponse {
  id: string;
  saleId: string;
  transactionId: string;
  storeId: string;
  processedById: string;
  processedByName: string;
  items: ReturnItemResponse[];
  totalAmount: number;
  notes: string | null;
  createdAt: string;
}

export interface ReturnSummaryResponse {
  id: string;
  saleId: string;
  transactionId: string;
  itemCount: number;
  totalAmount: number;
  createdAt: string;
}