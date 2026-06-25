import { AsyncLocalStorage } from 'async_hooks';
export interface TenantStore {
    organizationId: string;
}
export declare const tenantContext: AsyncLocalStorage<TenantStore>;
