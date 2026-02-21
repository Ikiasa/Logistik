
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // In this system, AuthGuard ('sso-mock') populates request.user
        console.log(`[TenantInterceptor] Request User: ${JSON.stringify(request.user)}`);
        const tenantId = request.user?.tenantId || request.headers['x-tenant-id'];
        console.log(`[TenantInterceptor] Found TenantId: ${tenantId}`);

        if (!tenantId) {
            console.error('[TenantInterceptor] Tenant Context Missing in request');
            // We only throw if it's not a public route. 
            // For simplicity in this reconstruction, we throw.
            throw new UnauthorizedException('Tenant Context Missing');
        }

        return new Observable(subscriber => {
            TenantContext.run(tenantId, () => {
                next.handle().subscribe(subscriber);
            });
        });
    }
}
