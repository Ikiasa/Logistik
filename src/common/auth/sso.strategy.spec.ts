
import { MockSSOStrategy } from './sso.strategy';
import { UnauthorizedException } from '@nestjs/common';

describe('MockSSOStrategy', () => {
    let strategy: MockSSOStrategy;

    beforeEach(() => {
        strategy = new MockSSOStrategy();
    });

    it('should validate valid token for tenant A', async () => {
        const req = { headers: { 'x-sso-token': 'valid-token-tenant-a' } };
        const user = await strategy.validate(req);

        expect(user).toEqual({
            userId: 'user-alice-uuid',
            tenantId: 'tenant-a-uuid',
            email: 'alice@corp-a.com',
            roles: ['user'],
        });
    });

    it('should validate valid token for tenant B', async () => {
        const req = { headers: { 'x-sso-token': 'valid-token-tenant-b' } };
        const user = await strategy.validate(req);

        expect(user).toEqual({
            userId: 'user-bob-uuid',
            tenantId: 'tenant-b-uuid',
            email: 'bob@corp-b.com',
            roles: ['user'],
        });
    });

    it('should throw UnauthorizedException if token missing', async () => {
        const req = { headers: {} };
        await expect(strategy.validate(req)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token invalid', async () => {
        const req = { headers: { 'x-sso-token': 'invalid-token' } };
        await expect(strategy.validate(req)).rejects.toThrow(UnauthorizedException);
    });
});
