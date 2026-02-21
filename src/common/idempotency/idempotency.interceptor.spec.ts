
import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyInterceptor } from './idempotency.interceptor';
import { Pool } from 'pg';
import { ExecutionContext, CallHandler, ConflictException, BadRequestException } from '@nestjs/common';
import { TenantContext } from '../context/tenant.context';
import { of, throwError } from 'rxjs';

const mockQuery = jest.fn();
const mockClient = {
    query: mockQuery,
    release: jest.fn(),
};
const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
};

const mockHandler: CallHandler = {
    handle: jest.fn(() => of({ result: 'success' })),
};

describe('IdempotencyInterceptor', () => {
    let interceptor: IdempotencyInterceptor;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IdempotencyInterceptor,
                { provide: Pool, useValue: mockPool },
            ],
        }).compile();

        interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);
    });

    const createMockContext = (method: string, headers: any) => ({
        switchToHttp: () => ({
            getRequest: () => ({ method, headers }),
            getResponse: () => ({ statusCode: 200, status: jest.fn() }),
        }),
    } as unknown as ExecutionContext);

    it('should skip GET requests', async () => {
        const context = createMockContext('GET', {});
        await interceptor.intercept(context, mockHandler);
        expect(mockPool.connect).not.toHaveBeenCalled();
        expect(mockHandler.handle).toHaveBeenCalled();
    });

    it('should throw if header is missing for POST', async () => {
        const context = createMockContext('POST', {});
        await expect(interceptor.intercept(context, mockHandler)).rejects.toThrow(BadRequestException);
    });

    it('should lock and process new request', async () => {
        const tenantId = '123e4567-e89b-12d3-a456-426614174000';
        const key = 'req-1';
        const context = createMockContext('POST', { 'idempotency-key': key });

        await TenantContext.run(tenantId, async () => {
            // Mocks
            mockQuery.mockResolvedValueOnce({}); // BEGIN
            mockQuery.mockResolvedValueOnce({}); // SET LOCAL
            mockQuery.mockResolvedValueOnce({ rows: [] }); // Check (Empty) -> Insert
            mockQuery.mockResolvedValueOnce({}); // Insert 'STARTED'
            mockQuery.mockResolvedValueOnce({}); // COMMIT (Pre-process)

            // Post-process (tap)
            mockQuery.mockResolvedValueOnce({}); // BEGIN (Update)
            mockQuery.mockResolvedValueOnce({}); // SET LOCAL
            mockQuery.mockResolvedValueOnce({}); // Update 'COMPLETED'
            mockQuery.mockResolvedValueOnce({}); // COMMIT

            const obs = await interceptor.intercept(context, mockHandler);
            await obs.toPromise(); // Trigger tap

            // Wait for async tap to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Debug
            console.log('Mock Query Calls:', mockQuery.mock.calls.map(c => c[0]));

            expect(mockQuery).toHaveBeenCalledWith(expect.stringMatching(/INSERT INTO idempotency_keys/), expect.anything());
            expect(mockQuery).toHaveBeenCalledWith(expect.stringMatching(/UPDATE idempotency_keys/), expect.anything());
        });
    });

    it('should return cached response if COMPLETED', async () => {
        const tenantId = 'tenant-1';
        const key = 'req-1';
        const cachedBody = { foo: 'bar' };

        const context = createMockContext('POST', { 'idempotency-key': key });

        await TenantContext.run(tenantId, async () => {
            mockQuery.mockResolvedValueOnce({}); // BEGIN
            mockQuery.mockResolvedValueOnce({}); // SET LOCAL
            mockQuery.mockResolvedValueOnce({
                rows: [{ status: 'COMPLETED', response_body: cachedBody, response_code: 200 }]
            }); // Check -> Found
            mockQuery.mockResolvedValueOnce({}); // COMMIT

            const obs = await interceptor.intercept(context, mockHandler);
            const result = await obs.toPromise();

            expect(result).toEqual(cachedBody);
            expect(mockHandler.handle).not.toHaveBeenCalled(); // Short-circuit
        });
    });

    it('should throw Conflict if STARTED and fresh', async () => {
        const tenantId = 'tenant-1';
        const key = 'req-1';
        const context = createMockContext('POST', { 'idempotency-key': key });

        await TenantContext.run(tenantId, async () => {
            mockQuery.mockResolvedValueOnce({}); // BEGIN
            mockQuery.mockResolvedValueOnce({}); // SET LOCAL
            mockQuery.mockResolvedValueOnce({
                rows: [{ status: 'STARTED', locked_at: new Date() }]
            }); // Check -> Started Now
            mockQuery.mockResolvedValueOnce({}); // ROLLBACK

            await expect(interceptor.intercept(context, mockHandler)).rejects.toThrow(ConflictException);
        });
    });
});
