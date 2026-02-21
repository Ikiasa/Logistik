
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

@Injectable()
export class MockSSOStrategy extends PassportStrategy(Strategy, 'sso-mock') {
    constructor() {
        super();
    }

    async validate(req: any): Promise<any> {
        // Simulate extraction from SAML/OIDC Token (e.g., Header)
        const ssoToken = req.headers['x-sso-token'];

        if (!ssoToken) {
            // If no token, we pass. Deployment might use other guards.
            // For this strategy, if invoked, it expects a token.
            throw new UnauthorizedException('SSO Token missing');
        }

        // Mock Identity Mapping (IdP -> Internal Tenant)
        // In real world, verify signature and claim lookup.
        let tenantId: string;
        let userId: string;
        let email: string;

        if (ssoToken === 'valid-token-tenant-a') {
            tenantId = '550e8400-e29b-41d4-a716-446655440000';
            userId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
            email = 'alice@corp-a.com';
        } else if (ssoToken === 'valid-token-tenant-b') {
            tenantId = '660f9511-f30c-52e5-b827-557766551111';
            userId = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
            email = 'bob@corp-b.com';
        } else {
            throw new UnauthorizedException('Invalid SSO Token');
        }

        // Return User Object compatible with Request
        return {
            userId,
            tenantId,
            email,
            roles: ssoToken === 'valid-token-tenant-a' ? ['SUPER_ADMIN'] : ['DISPATCHER'],
        };
    }
}
