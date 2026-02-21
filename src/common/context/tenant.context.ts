
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantContext {
    private static readonly storage = new AsyncLocalStorage<Map<string, any>>();

    static run<R>(tenantId: string, callback: () => R): R {
        const store = new Map<string, any>();
        store.set('tenantId', tenantId);
        return this.storage.run(store, callback);
    }

    static getTenantId(): string | undefined {
        const store = this.storage.getStore();
        const tenantId = store?.get('tenantId');
        console.log(`[TenantContext] getTenantId called. Found: ${tenantId}`);
        return tenantId;
    }
}
