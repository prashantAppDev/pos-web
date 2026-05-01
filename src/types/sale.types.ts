export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';
export type PaymentStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface SaleItemRequest {
  productId: string;
  quantity: number;
  mrp: number;
}

export interface CreateSaleRequest {
  counterId: string;
  items: SaleItemRequest[];
  paymentMethod: PaymentMethod;
  upiRefNumber?: string;
}

export interface SaleItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
}

export interface SaleResponse {
  id: string;
  transactionId: string;
  storeId: string;
  counterId: string;
  cashierId: string;
  cashierName: string;
  items: SaleItemResponse[];
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  upiRefNumber: string | null;
  createdAt: string;
}

export interface SaleSummaryResponse {
  id: string;
  transactionId: string;
  totalAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: string;
}

export interface SaleListParams {
  page?: number;
  size?: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  barcode: string | null;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  availableQty: number;
}