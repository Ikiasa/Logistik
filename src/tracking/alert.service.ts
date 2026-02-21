import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { TrackingGateway } from './tracking.gateway';
import { RedisService } from '../common/redis/redis.service';

export enum IncidentType {
    STOPPED = 'STOPPED',
    OFFLINE = 'OFFLINE',
    OVERSPEED = 'OVERSPEED',
    OFF_ROUTE = 'OFF_ROUTE'
}

@Injectable()
export class AlertService {
    private readonly logger = new Logger(AlertService.name);

    constructor(
        private db: DatabaseService,
        private gateway: TrackingGateway,
        private redis: RedisService
    ) { }

    async monitorIncidents(tenantId: string, vehicleId: string, lat: number, lng: number, speed: number) {
        // 1. Overspeed Check
        if (speed > 80) {
            await this.triggerIncident(tenantId, vehicleId, IncidentType.OVERSPEED, 'HIGH', `Vehicle exceeded speed limit: ${speed} km/h`, lat, lng);
        }

        // 2. Stationary Check (If speed = 0 for > 15 mins)
        // We can leverage the Redis 'latest_position' or a specific stationary clock
        const stopKey = `vehicle:stop_time:${vehicleId}`;
        if (speed < 5) {
            const stopEntry = await this.redis.get(stopKey);
            if (!stopEntry) {
                await this.redis.set(stopKey, { startTime: Date.now() }, 3600);
            } else {
                const durationMinutes = (Date.now() - stopEntry.startTime) / (60 * 1000);
                if (durationMinutes > 15) {
                    await this.triggerIncident(tenantId, vehicleId, IncidentType.STOPPED, 'MEDIUM', `Vehicle stationary for ${Math.round(durationMinutes)} mins`, lat, lng);
                }
            }
        } else {
            await this.redis.del(stopKey); // Reset if moving
        }

        // 3. Heartbeat / Offline Check
        // This usually runs on a cron, but we can update the last seen here
        await this.redis.set(`vehicle:heartbeat:${vehicleId}`, { timestamp: Date.now(), tenantId }, 3600);
    }

    async triggerIncident(tenantId: string, vehicleId: string, type: IncidentType, severity: string, description: string, lat: number, lng: number) {
        this.logger.warn(`Incident Triggered [${type}]: ${description} for Vehicle ${vehicleId}`);

        // Avoid duplicate active incidents of the same type in a short interval (e.g., 5 mins)
        const throttleKey = `incident:throttle:${vehicleId}:${type}`;
        if (await this.redis.get(throttleKey)) return;

        // Persist to DB
        const result = await this.db.query(
            `INSERT INTO incidents (tenant_id, vehicle_id, type, severity, description, location_lat, location_lng)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [tenantId, vehicleId, type, severity, description, lat, lng]
        );

        // Broadcast via Gateway
        const incident = result[0];
        this.gateway.broadcastAlert(tenantId, {
            type: 'INCIDENT',
            ...incident
        });

        // Throttling: 5 mins
        await this.redis.set(throttleKey, true, 300);
    }

    // Cron job or background task would call this to detect OFFLINE
    async checkOfflineVehicles() {
        // Mock: In a real app, scan Redis for heartbeats > 3 mins old
        // For this demo, we'll keep it simple
    }
}
