import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReliabilityService } from './reliability.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('ops/anomalies')
@UseGuards(JwtAuthGuard)
export class AnomalyController {
    constructor(private readonly reliabilityService: ReliabilityService) { }

    @Get('cost')
    async getCostAnomalies(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.reliabilityService.detectCostAnomalies(user.tenantId, start, end);
    }

    @Get('fuel-efficiency')
    async getFuelEfficiencyAnomalies(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.reliabilityService.detectFuelEfficiencyAnomalies(user.tenantId, start, end);
    }

    @Get('maintenance')
    async getMaintenanceAnomalies(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.reliabilityService.detectMaintenanceCostSpikes(user.tenantId, start, end);
    }

    @Get('idle-time')
    async getIdleTimeAnomalies(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.reliabilityService.detectIdleTimeExcess(user.tenantId, start, end);
    }

    @Get('all')
    async getAllAnomalies(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        const [cost, fuel, maintenance, idle] = await Promise.all([
            this.reliabilityService.detectCostAnomalies(user.tenantId, start, end),
            this.reliabilityService.detectFuelEfficiencyAnomalies(user.tenantId, start, end),
            this.reliabilityService.detectMaintenanceCostSpikes(user.tenantId, start, end),
            this.reliabilityService.detectIdleTimeExcess(user.tenantId, start, end)
        ]);

        return {
            cost,
            fuel,
            maintenance,
            idle,
            total: cost.length + fuel.length + maintenance.length + idle.length
        };
    }
}
