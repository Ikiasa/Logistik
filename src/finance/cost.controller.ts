import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { CostEngineService } from './cost-engine.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('finance/costs')
@UseGuards(JwtAuthGuard)
export class CostController {
    constructor(private readonly costService: CostEngineService) { }

    @Get('profitability')
    async getProfitability(
        @Query('vehicle_id') vehicleId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.costService.getVehicleProfitability(user.tenantId, vehicleId, start, end);
    }

    @Post('fuel')
    async logFuel(@Body() body: any, @CurrentUser() user: any) {
        return this.costService.addFuelLog(user.tenantId, {
            ...body,
            driver_id: user.id
        });
    }

    @Post('maintenance')
    async logMaintenance(@Body() body: any, @CurrentUser() user: any) {
        return this.costService.addMaintenanceLog(user.tenantId, body);
    }

    @Post('operational')
    async logOperational(@Body() body: any, @CurrentUser() user: any) {
        return this.costService.addOperationalExpense(user.tenantId, {
            ...body,
            driver_id: user.id
        });
    }

    @Get('fuel-efficiency')
    async getFuelEfficiency(
        @Query('vehicle_id') vehicleId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.costService.getFuelEfficiency(user.tenantId, vehicleId, start, end);
    }

    @Get('breakdown')
    async getCostBreakdown(
        @Query('vehicle_id') vehicleId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.costService.getCostBreakdown(user.tenantId, vehicleId, start, end);
    }

    @Get('idle-impact')
    async getIdleCostImpact(
        @Query('vehicle_id') vehicleId: string,
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('idle_hours') idleHours: string,
        @CurrentUser() user: any
    ) {
        return this.costService.getIdleCostImpact(
            user.tenantId,
            vehicleId,
            start,
            end,
            parseFloat(idleHours)
        );
    }
}
