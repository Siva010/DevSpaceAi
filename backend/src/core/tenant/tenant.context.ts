import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  organizationId: string;
}

export const tenantContext = new AsyncLocalStorage<TenantStore>();
