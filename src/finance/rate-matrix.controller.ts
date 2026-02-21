
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RateMatrixService } from './rate-matrix.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/auth/roles.guard';
import { Roles, UserRole } from '../common/auth/roles.decorator';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('finance/rates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RateMatrixController {
    constructor(private readonly rateMatrixService: RateMatrixService) { }

    @Get()
    @Roles(UserRole.FINANCE, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
    async getRates(@CurrentUser() user: any) {
        return this.rateMatrixService.getRateMatrix(user.tenantId);
    }

    @Post()
    @Roles(UserRole.FINANCE, UserRole.SUPER_ADMIN)
    async updateRates(@CurrentUser() user: any, @Body() tiers: any[]) {
        return this.rateMatrixService.updateRateMatrix(user.tenantId, tiers);
    }
}
