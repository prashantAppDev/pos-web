import type { PaymentMethod } from './sale.types';

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  amount: number;
}

export interface SaleTransactionRow {
  transactionId: string;
  createdAt: string;
  itemCount: number;
  totalAmount: number;
  taxAmount: number;
  paymentMethod: PaymentMethod;
}

export interface SalesReportSummary {
  totalTransactions: number;
  totalRevenue: number;
  totalTax: number;
  totalReturns: number;
  returnCount: number;
  netRevenue: number;
  byPaymentMethod: PaymentMethodBreakdown[];
}

export interface SalesReportResponse {
  storeId: string;
  storeName: string;
  from: string;
  to: string;
  summary: SalesReportSummary;
  transactions: SaleTransactionRow[] | null;
}

export interface ProductSalesRow {
  productId: string;
  productName: string;
  barcode: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  transactionCount: number;
}

export interface TopProductsReportResponse {
  storeId: string;
  storeName: string;
  from: string;
  to: string;
  products: ProductSalesRow[];
}

export interface ReportDateParams {
  from: string;
  to: string;
}

export interface SalesReportParams extends ReportDateParams {
  detail?: boolean;
}

export interface TopProductsReportParams extends ReportDateParams {
  limit?: number;
}