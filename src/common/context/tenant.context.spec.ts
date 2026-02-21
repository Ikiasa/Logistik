
import { TenantContext } from './tenant.context';

describe('TenantContext', () => {
    it('should be undefined outside of run', () => {
        expect(TenantContext.getTenantId()).toBeUndefined();
    });

    it('should propagate tenantId within run', (done) => {
        const tenantId = '123e4567-e89b-12d3-a456-426614174000';
        TenantContext.run(tenantId, () => {
            expect(TenantContext.getTenantId()).toBe(tenantId);
            done();
        });
    });

    it('should isolate concurrent runs', (done) => {
        const tenantA = 'A';
        const tenantB = 'B';

        // Simulate concurrent requests
        let completed = 0;
        const checkDone = () => {
            completed++;
            if (completed === 2) done();
        }

        TenantContext.run(tenantA, () => {
            setTimeout(() => {
                expect(TenantContext.getTenantId()).toBe(tenantA);
                checkDone();
            }, 10);
        });

        TenantContext.run(tenantB, () => {
            setTimeout(() => {
                expect(TenantContext.getTenantId()).toBe(tenantB);
                checkDone();
            }, 5);
        });
    });
});
