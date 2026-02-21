import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { SopService } from './sop.service';
import { ReliabilityService } from './reliability.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('ops')
@UseGuards(JwtAuthGuard)
export class SopController {
    constructor(
        private readonly sopService: SopService,
        private readonly reliabilityService: ReliabilityService
    ) { }

    @Get('health')
    async getHealth() {
        return this.reliabilityService.getSystemHealth();
    }

    @Post('sop/shift/start')
    async startShift(@Body() body: any, @CurrentUser() user: any) {
        return this.sopService.startShift(user.tenantId, user.id, body.vehicle_id, body.odometer, body.checklist);
    }

    @Post('sop/shift/end')
    async endShift(@Body() body: any, @CurrentUser() user: any) {
        return this.sopService.endShift(body.id, user.tenantId, body.odometer);
    }

    @Post('inspection')
    async createInspection(@Body() body: any, @CurrentUser() user: any) {
        return this.sopService.createInspection(
            user.tenantId, body.vehicle_id, user.id, body.type, body.items, body.has_issues, body.details
        );
    }

    @Post('incident')
    async reportIncident(@Body() body: any, @CurrentUser() user: any) {
        return this.sopService.reportIncident(
            user.tenantId, body.vehicle_id, user.id, body.type, body.severity, body.description, body.lat, body.lng, body.photos
        );
    }

    @Post('verify')
    async verifyDelivery(@Body() body: any, @CurrentUser() user: any) {
        return this.sopService.verifyDelivery(
            user.tenantId, body.shipment_id, user.id, body.recipient, body.signature, body.photos, body.lat, body.lng, body.notes
        );
    }
}
