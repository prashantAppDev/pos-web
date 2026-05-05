import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../config/constants';
import { getSalesReport, getTopProductsReport } from '../api/report.api';
import type { SalesReportParams, TopProductsReportParams } from '../../../types/report.types';

export const useSalesReport = (
  storeId: string,
  params: SalesReportParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: [QUERY_KEYS.salesReport, storeId, params],
    queryFn: () => getSalesReport(storeId, params),
    enabled,
  });

export const useTopProductsReport = (
  storeId: string,
  params: TopProductsReportParams,
  enabled: boolean
) =>
  useQuery({
    queryKey: [QUERY_KEYS.topProductsReport, storeId, params],
    queryFn: () => getTopProductsReport(storeId, params),
    enabled,
  });
