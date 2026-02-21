
import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Pool } from 'pg';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
    private readonly logger = new Logger(IdempotencyInterceptor.name);

    constructor(private readonly db: Pool) { }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();
        const method = req.method;

        // 1. Skip Safe Methods
        if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
            return next.handle();
        }

        // 2. Get Key & Tenant
        const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];
        if (!idempotencyKey) {
            // Optional: Enforce only on POST, or warn. For now, skip if missing (or strict?)
            // Plan says strictly required check -> 400 Bad Request.
            // Let's enforce strictly for POST/PATCH on critical paths. 
            // Since this is applied controller-wide, maybe strict is too much for all non-GET?
            // Let's be strict for now as it's explicit API Hardening.
            throw new BadRequestException('Idempotency-Key header is required');
        }

        const tenantId = TenantContext.getTenantId();
        if (!tenantId) {
            this.logger.error('Tenant Context Missing in IdempotencyInterceptor');
            throw new Error('Tenant Context Missing');
        }

        const client = await this.db.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SET LOCAL app.current_tenant = '${tenantId}'`);

            // 3. Check State (Select for Update)
            const checkQuery = `
                SELECT status, response_body, response_code, locked_at 
                FROM idempotency_keys 
                WHERE key = $1 AND tenant_id = $2
                FOR UPDATE
            `;
            const checkRes = await client.query(checkQuery, [idempotencyKey, tenantId]);

            if (checkRes.rows.length > 0) {
                const { status, response_body, response_code, locked_at } = checkRes.rows[0];

                if (status === 'COMPLETED') {
                    await client.query('COMMIT');
                    // Return Cached Response
                    // Note: This mimics success. Status code might technically be tricky to set on Observable 
                    // without accessing Response object directly.
                    // But we can just return body. 
                    // To set status code: context.switchToHttp().getResponse().status(response_code);
                    const res = context.switchToHttp().getResponse();
                    if (response_code) res.status(response_code);
                    return of(response_body);
                }

                if (status === 'STARTED') {
                    // Check Expiry (e.g., 30s)
                    const now = new Date();
                    const locked = new Date(locked_at);
                    const diff = (now.getTime() - locked.getTime()) / 1000;

                    if (diff < 30) {
                        await client.query('ROLLBACK'); // Release lock
                        throw new ConflictException('Request currently processing (Concurrency)');
                    }
                    // Else: Stale lock, take over (Fall through to Update)
                }

                // If FAILED or Stale STARTED -> Update to STARTED (Retry)
                await client.query(
                    `UPDATE idempotency_keys SET status = 'STARTED', locked_at = NOW() WHERE key = $1 AND tenant_id = $2`,
                    [idempotencyKey, tenantId]
                );
            } else {
                // Insert New
                await client.query(
                    `INSERT INTO idempotency_keys (tenant_id, key, status, locked_at) VALUES ($1, $2, 'STARTED', NOW())`,
                    [tenantId, idempotencyKey]
                );
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            client.release();
            throw err;
        } finally {
            // Must keep connection IF we want to use it in `tap`? 
            // No, `tap` is async later. We release here.
            // BUT wait, if we release, we lose transaction? 
            // We committed the "Lock/Start" state.
            // The actual processing happens in `next.handle()`.
            // Then we need to update to COMPLETED.
            // That will be a NEW transaction (with new SET LOCAL).
            client.release();
        }

        // 4. Execute Handler & Update State
        return next.handle().pipe(
            tap(async (data) => {
                const client = await this.db.connect();
                try {
                    await client.query('BEGIN');
                    await client.query(`SET LOCAL app.current_tenant = '${tenantId}'`);

                    // Capture Status Code (default 201 for POST, 200 otherwise)
                    // We can attempt to read from response object
                    const res = context.switchToHttp().getResponse();
                    const statusCode = res.statusCode || 200;

                    await client.query(
                        `UPDATE idempotency_keys SET status = 'COMPLETED', response_body = $1, response_code = $2 WHERE key = $3 AND tenant_id = $4`,
                        [JSON.stringify(data), statusCode, idempotencyKey, tenantId]
                    );
                    await client.query('COMMIT');
                } catch (e) {
                    await client.query('ROLLBACK');
                    this.logger.error(`Failed to update idempotency success: ${e.message}`);
                    // Don't swallow actual success data? Or do we?
                    // Ideally we should warn but header is arguably fulfilled even if cache update fails.
                } finally {
                    client.release();
                }
            }),
            catchError(async (err) => {
                const client = await this.db.connect();
                try {
                    await client.query('BEGIN');
                    await client.query(`SET LOCAL app.current_tenant = '${tenantId}'`);
                    await client.query(
                        `UPDATE idempotency_keys SET status = 'FAILED' WHERE key = $1 AND tenant_id = $2`,
                        [idempotencyKey, tenantId]
                    );
                    await client.query('COMMIT');
                } catch (e) {
                    await client.query('ROLLBACK');
                    this.logger.error(`Failed to update idempotency failure: ${e.message}`);
                } finally {
                    client.release();
                }
                return throwError(() => err);
            })
        );
    }
}
