import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProfitabilityService } from './profitability.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('finance/profitability')
@UseGuards(JwtAuthGuard)
export class ProfitabilityController {
    constructor(private readonly profitabilityService: ProfitabilityService) { }

    @Get('vehicle/:id')
    async getVehicleProfitability(
        @Query('vehicle_id') vehicleId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.profitabilityService.getVehicleProfitability(
            user.tenantId,
            vehicleId,
            start,
            end
        );
    }

    @Get('fleet')
    async getFleetProfitability(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.profitabilityService.getFleetProfitability(
            user.tenantId,
            start,
            end
        );
    }

    @Get('trends')
    async getMonthlyTrends(
        @Query('vehicle_id') vehicleId: string,
        @Query('months') months: string,
        @CurrentUser() user: any
    ) {
        return this.profitabilityService.getMonthlyTrends(
            user.tenantId,
            vehicleId,
            parseInt(months) || 6
        );
    }
}
