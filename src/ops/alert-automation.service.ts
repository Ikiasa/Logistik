import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { TrackingGateway } from '../tracking/tracking.gateway';

@Injectable()
export class AlertAutomationService {
    private readonly logger = new Logger(AlertAutomationService.name);

    constructor(
        private db: DatabaseService,
        private gateway: TrackingGateway
    ) { }

    // Check for prolonged idling (> 20 mins)
    async checkIdleAlerts(tenantId: string) {
        const threshold = 20; // minutes
        const idleVehicles = await this.db.query(
            `SELECT vehicle_id, EXTRACT(EPOCH FROM (NOW() - MAX(recorded_at))) / 60 as idle_minutes
       FROM vehicle_tracking
       WHERE tenant_id = $1 AND speed = 0
       GROUP BY vehicle_id
       HAVING EXTRACT(EPOCH FROM (NOW() - MAX(recorded_at))) / 60 > $2`,
            [tenantId, threshold]
        );

        for (const v of idleVehicles) {
            this.gateway.server.to(`tenant:${tenantId}`).emit('alert:idle', {
                vehicle_id: v.vehicle_id,
                duration: Math.round(v.idle_minutes),
                severity: 'MEDIUM'
            });
        }
    }

    // Check for ETA Misses
    async checkETAAlerts(tenantId: string) {
        // In production, compare current position with destination and original ETA
        this.logger.log(`Checking ETA alerts for tenant: ${tenantId}`);
    }

    // Check for Safety Violations (Overspeed 3x)
    async checkSafetyViolation(tenantId: string, vehicleId: string) {
        const violations = await this.db.query(
            `SELECT COUNT(*) as count FROM vehicle_tracking
           WHERE tenant_id = $1 AND vehicle_id = $2 AND status = 'OVERSPEED'
           AND recorded_at > NOW() - INTERVAL '24 hours'`,
            [tenantId, vehicleId]
        );

        if (violations[0].count >= 3) {
            this.gateway.server.to(`tenant:${tenantId}`).emit('alert:safety', {
                vehicle_id: vehicleId,
                message: 'HIGH FREQUENCY OVERSPEED DETECTED (3x in 24h)',
                severity: 'HIGH'
            });
        }
    }
}
