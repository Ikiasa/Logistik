
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MockSSOStrategy } from './sso.strategy';
import { AuthController } from './auth.controller';
import { JwtMockStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [PassportModule],
    controllers: [AuthController],
    providers: [MockSSOStrategy, JwtMockStrategy, RolesGuard],
    exports: [MockSSOStrategy, JwtMockStrategy, PassportModule, RolesGuard],
})
export class AuthModule { }
