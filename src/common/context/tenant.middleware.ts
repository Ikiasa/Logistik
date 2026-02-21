
import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContext } from './tenant.context';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        // 1. Prefer Authenticated User's Tenant (SSO/JWT)
        let tenantId = req.user?.tenantId;

        // 2. Fallback to Header (Public/System calls)
        if (!tenantId) {
            tenantId = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
        }

        if (!tenantId) {
            // For now, allow missing if not strictly enforced globally (or throw?)
            // Context will be undefined, Service will throw if needed.
            // next();
            // return;
            throw new BadRequestException('X-Tenant-ID header is required');
        }

        if (Array.isArray(tenantId)) {
            throw new BadRequestException('Multiple X-Tenant-ID headers not allowed');
        }

        // Basic UUID format check (regex)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(tenantId)) {
            throw new BadRequestException('Invalid Tenant ID format');
        }

        TenantContext.run(tenantId, () => {
            next();
        });
    }
}
