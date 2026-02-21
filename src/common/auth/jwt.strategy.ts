
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { DatabaseService } from '../database/database.service';
import { UserRole } from './roles.decorator';

@Injectable()
export class JwtMockStrategy extends PassportStrategy(Strategy, 'jwt-mock') {
    constructor(private db: DatabaseService) {
        super();
    }

    async validate(req: any): Promise<any> {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Bearer Token missing');
        }

        const token = authHeader.split(' ')[1];

        // Format: mock-jwt|userId|tenantId|email|ROLE1,ROLE2
        const parts = token.split('|');

        if (parts[0] !== 'mock-jwt' || parts.length < 4) {
            throw new UnauthorizedException('Invalid Mock Token format');
        }

        const [, userId, tenantId, email, rolesStr] = parts;

        // Roles are embedded in the token — no DB lookup needed
        if (rolesStr) {
            const roles = rolesStr.split(',').filter(Boolean);
            return { userId, tenantId, email, roles };
        }

        // Legacy fallback: try DB lookup, then default by email pattern
        try {
            const userRes = await this.db.query(
                'SELECT role FROM users WHERE email = $1 AND tenant_id = $2',
                [email, tenantId]
            );
            if (userRes[0]) {
                return { userId, tenantId, email, roles: [userRes[0].role] };
            }
        } catch {
            // users table may not exist — use email-based fallback
        }

        const roles = [UserRole.SUPER_ADMIN];
        return { userId, tenantId, email, roles };
    }
}
