
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OpsAnalyticsService } from './ops-analytics.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/auth/roles.guard';
import { Roles, UserRole } from '../common/auth/roles.decorator';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('v2/analytics/ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE, UserRole.DISPATCHER)
export class OpsAnalyticsController {
    constructor(private readonly analyticsService: OpsAnalyticsService) { }

    @Get('heatmap')
    async getHeatmap(@CurrentUser() user: any, @Query('hours') hours?: number) {
        return this.analyticsService.getHeatmapData(user.tenantId, hours);
    }

    @Get('utilization')
    async getUtilization(@CurrentUser() user: any) {
        return this.analyticsService.getFleetUtilization(user.tenantId);
    }

    @Get('sla')
    async getSLA(@CurrentUser() user: any) {
        return this.analyticsService.getSLAPerformance(user.tenantId);
    }

    @Get('sla-trends')
    async getSLATrends(@CurrentUser() user: any) {
        return this.analyticsService.getSLATrends(user.tenantId);
    }
}
