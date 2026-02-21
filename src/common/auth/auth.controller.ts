
import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { MockSSOStrategy } from './sso.strategy';

@Controller('v2/auth')
export class AuthController {
    constructor(private readonly ssoStrategy: MockSSOStrategy) { }

    @Post('sso')
    async login(@Headers('x-sso-token') ssoToken: string) {
        if (!ssoToken) {
            throw new UnauthorizedException('SSO Token missing');
        }

        // Explicitly call strategy validate (or use UseGuards(AuthGuard('sso-mock')))
        // For this minimal reconstruction, we call it directly to ensure compatibility.
        const user = await this.ssoStrategy.validate({ headers: { 'x-sso-token': ssoToken } });

        return {
            accessToken: `mock-jwt|${user.userId}|${user.tenantId}|${user.email}|${user.roles.join(',')}`,
            user: {
                id: user.userId,
                email: user.email,
                tenantId: user.tenantId,
                roles: user.roles,
            },
        };
    }
}
