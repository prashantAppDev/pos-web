export const API_BASE_URL = 'http://localhost:8080/api';

export const QUERY_KEYS = {
  tenants: 'tenants',
  tenant: 'tenant',
  me: 'me',
  stores: 'stores',
  store: 'store',
  counters: 'counters',
  counter: 'counter',
  saStores: 'saStores',
  saStore: 'saStore',
  saCounters: 'saCounters',
} as const;

export const PAGE_SIZE_DEFAULT = 10;