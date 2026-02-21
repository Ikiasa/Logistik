import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FleetAnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('ops/analytics')
@UseGuards(JwtAuthGuard)
export class OpsAnalyticsController {
    constructor(private readonly analyticsService: FleetAnalyticsService) { }

    @Get('utilization')
    async getUtilization(
        @Query('start') start: string,
        @Query('end') end: string,
        @CurrentUser() user: any
    ) {
        return this.analyticsService.getUtilizationMetrics(user.tenantId, start, end);
    }

    @Get('driver-performance')
    async getDriverPerformance(@CurrentUser() user: any) {
        return this.analyticsService.getDriverPerformance(user.tenantId);
    }
}
