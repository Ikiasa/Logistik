import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { SimulationService } from './simulation.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { RolesGuard } from '../common/auth/roles.guard';
import { Roles, UserRole } from '../common/auth/roles.decorator';

@Controller('tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
    constructor(
        private readonly trackingService: TrackingService,
        private readonly simulationService: SimulationService,
    ) { }

    @Get('latest')
    async getLatest(@Query('vehicleId') vehicleId: string) {
        return this.trackingService.getLatestLocation(vehicleId);
    }

    @Get('history')
    async getHistory(
        @Query('vehicleId') vehicleId: string,
        @Query('from') from: string,
        @Query('to') to: string,
    ) {
        return this.trackingService.getHistory(
            vehicleId,
            new Date(from),
            new Date(to),
        );
    }

    @Post('simulate/start')
    @Roles(UserRole.DISPATCHER, UserRole.SUPER_ADMIN)
    async startSimulation(@Req() req: any, @Body('vehicleId') vehicleId: string) {
        // In a real app, tenantId would come from req.user (AsyncLocalStorage/Interceptor)
        // For this mock-heavy module, we'll extract it from the mock token if needed
        const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000';
        this.simulationService.startSimulation(tenantId, vehicleId);
        return { message: 'Simulation started', vehicleId };
    }

    @Post('simulate/stop')
    @Roles(UserRole.DISPATCHER, UserRole.SUPER_ADMIN)
    async stopSimulation(@Body('vehicleId') vehicleId: string) {
        this.simulationService.stopSimulation(vehicleId);
        return { message: 'Simulation stopped', vehicleId };
    }

    @Get('geofences')
    @Roles(UserRole.DISPATCHER, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
    async getGeofences(@Req() req: any) {
        // Mock tenantId for now
        const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000';
        return this.trackingService.getGeofences(tenantId);
    }

    @Get('incidents')
    @Roles(UserRole.DISPATCHER, UserRole.SUPER_ADMIN, UserRole.AUDITOR)
    async getIncidents(@Req() req: any) {
        const tenantId = req.user?.tenantId || '550e8400-e29b-41d4-a716-446655440000';
        return this.trackingService.getIncidents(tenantId);
    }

    @Get('debug-db')
    @Roles(UserRole.SUPER_ADMIN)
    async debugDb() {
        const pool = (this.trackingService as any).pool;
        const config = pool.options;

        let maskedConn = config.connectionString;
        if (maskedConn) {
            maskedConn = maskedConn.replace(/:([^@]+)@/, ':****@');
        }

        return {
            connectionString: maskedConn,
            host: config.host,
            database: config.database,
            user: config.user,
            port: config.port,
            envUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:([^@]+)@/, ':****@') : null
        };
    }
}
