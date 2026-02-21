import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/sso
 * Mock SSO authentication endpoint — mirrors the original NestJS AuthController.
 * Accepts an x-sso-token header and returns a mock JWT + user object.
 */
export async function POST(request: NextRequest) {
    const ssoToken = request.headers.get('x-sso-token');

    if (!ssoToken) {
        return NextResponse.json(
            { message: 'SSO Token missing' },
            { status: 401 }
        );
    }

    // Mock Identity Mapping (mirrors sso.strategy.ts)
    let tenantId: string;
    let userId: string;
    let email: string;
    let roles: string[];

    if (ssoToken === 'valid-token-tenant-a') {
        tenantId = '550e8400-e29b-41d4-a716-446655440000';
        userId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
        email = 'alice@corp-a.com';
        roles = ['SUPER_ADMIN'];
    } else if (ssoToken === 'valid-token-tenant-b') {
        tenantId = '660f9511-f30c-52e5-b827-557766551111';
        userId = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
        email = 'bob@corp-b.com';
        roles = ['DISPATCHER'];
    } else {
        return NextResponse.json(
            { message: 'Invalid SSO Token' },
            { status: 401 }
        );
    }

    // Return mock JWT + user object (mirrors auth.controller.ts)
    const accessToken = `mock-jwt|${userId}|${tenantId}|${email}|${roles.join(',')}`;

    return NextResponse.json({
        accessToken,
        user: {
            id: userId,
            email,
            tenantId,
            roles,
        },
    });
}
