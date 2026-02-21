
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersServiceV2 } from './orders.service.v2';
import { Pool } from 'pg';
import { TenantContext } from '../common/context/tenant.context';
import { CreateOrderDtoV2 } from './dto/create-order.v2.dto';

// Mock Pool/Client
const mockQuery = jest.fn();
const mockClient = {
    query: mockQuery,
    release: jest.fn(),
};
const mockPool = {
    connect: jest.fn().mockResolvedValue(mockClient),
};

describe('OrdersServiceV2 RLS', () => {
    let service: OrdersServiceV2;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrdersServiceV2,
                { provide: Pool, useValue: mockPool },
            ],
        }).compile();

        service = module.get<OrdersServiceV2>(OrdersServiceV2);
    });

    it('should set local tenant variable in transaction', async () => {
        const tenantId = '123e4567-e89b-12d3-a456-426614174000';
        const dto: CreateOrderDtoV2 = {
            tenant_id: tenantId, // Ignored by logic now
            customer_name: 'Test Customer',
            delivery_address: {
                country_code: 'US',
                postal_code: '90210',
                street: 'Beverly Hills',
                number: '123',
                city: 'Los Angeles'
            }
        };

        // We must run inside TenantContext
        await new Promise<void>((resolve, reject) => {
            TenantContext.run(tenantId, async () => {
                try {
                    // Mocks - Add extra returns just in case
                    mockQuery.mockResolvedValueOnce({}); // BEGIN
                    mockQuery.mockResolvedValueOnce({}); // SET LOCAL
                    mockQuery.mockResolvedValueOnce({ rows: [] }); // Select Address (Empty)
                    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'new-addr-id' }] }); // Insert Address
                    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'order-id' }] }); // Insert Order
                    mockQuery.mockResolvedValueOnce({}); // COMMIT
                    mockQuery.mockResolvedValue({ rows: [] }); // Fallback

                    // Verify Context is working
                    if (TenantContext.getTenantId() !== tenantId) {
                        throw new Error('Test harness context failure');
                    }

                    await service.create_v2(dto);

                    // Verification
                    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('SET LOCAL app.current_tenant'));
                    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining(tenantId));

                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        });
    });

    it('should fail if TenantContext is missing', async () => {
        // Run WITHOUT TenantContext.run
        const dto = {} as any;

        await expect(service.create_v2(dto)).rejects.toThrow('Tenant Context Missing');

        // Should NOT have called connect or BEGIN
        expect(mockQuery).toHaveBeenCalledTimes(0);
        expect(mockPool.connect).not.toHaveBeenCalled();
    });
});
