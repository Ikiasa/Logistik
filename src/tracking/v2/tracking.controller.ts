import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { TrackingServiceV2, GpsUpdate } from './tracking.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';

@Controller('api/tracking')
export class TrackingControllerV2 {
    constructor(private readonly trackingService: TrackingServiceV2) { }

    @Post('update')
    @UseGuards(JwtAuthGuard)
    async updateGps(@Body() update: Omit<GpsUpdate, 'tenant_id'>, @CurrentUser() user: any) {
        return this.trackingService.handleUpdate({
            ...update,
            tenant_id: user.tenantId,
        });
    }

    @Get('history')
    @UseGuards(JwtAuthGuard)
    async getHistory(
        @Query('vehicle_id') vehicleId: string,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return this.trackingService.getHistory(vehicleId, from, to);
    }

    @Post('simulate')
    async simulate(@Body() body: any) {
        // Dev only simulation endpoint
        const { vehicle_id, tenant_id, driver_id, lat, lng } = body;
        return this.trackingService.handleUpdate({
            vehicle_id,
            driver_id,
            tenant_id,
            latitude: lat + (Math.random() - 0.5) * 0.001,
            longitude: lng + (Math.random() - 0.5) * 0.001,
            speed: Math.random() * 100,
            heading: Math.floor(Math.random() * 360),
            accuracy: 5,
        });
    }
}
