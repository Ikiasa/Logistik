import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';
import { RedisService } from '../../common/redis/redis.service';
import { TrackingGateway } from '../tracking.gateway';
import { GeofenceService } from '../geofence.service';
import { AlertService } from '../alert.service';
import { ETAService } from '../eta.service';

export interface GpsUpdate {
    vehicle_id: string;
    driver_id: string;
    tenant_id: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
}

@Injectable()
export class TrackingServiceV2 {
    private readonly logger = new Logger(TrackingServiceV2.name);

    constructor(
        private db: DatabaseService,
        private redis: RedisService,
        private gateway: TrackingGateway,
        private geofence: GeofenceService,
        private alerts: AlertService,
        private eta: ETAService,
    ) { }

    async handleUpdate(update: GpsUpdate) {
        const { vehicle_id, tenant_id, speed, latitude, longitude } = update;

        // 1. Determine Status (Basic Intelligence Rules)
        let status = 'MOVING';
        if (speed > 80) status = 'OVERSPEED';
        else if (speed === 0) {
            const lastPos = await this.redis.get(`latest_position:${vehicle_id}`);
            if (lastPos && lastPos.speed === 0) {
                const idleTime = Date.now() - new Date(lastPos.timestamp).getTime();
                if (idleTime > 5 * 60 * 1000) status = 'IDLE';
            }
        }

        const payload = {
            ...update,
            status,
            recorded_at: new Date().toISOString(),
        };

        // 2. Persist to Postgres
        await this.db.query(
            `INSERT INTO vehicle_tracking 
      (tenant_id, vehicle_id, latitude, longitude, speed, heading, recorded_at)
      VALUES ($1, $2::uuid, $3, $4, $5, $6, $7)`,
            [
                tenant_id, vehicle_id,
                latitude, longitude, speed,
                update.heading, payload.recorded_at
            ]
        );

        // 3. Command Center Intelligence Layer
        try {
            // Check Geofences (Spatial)
            await this.geofence.checkGeofenceIntersections(tenant_id, vehicle_id, latitude, longitude);

            // Monitor Incidents (Stationary, Overspeed, Offline)
            await this.alerts.monitorIncidents(tenant_id, vehicle_id, latitude, longitude, speed);

            // Update Arrival Predictions (ETA)
            await this.eta.updateShipmentETA(tenant_id, vehicle_id, latitude, longitude, speed);
        } catch (err) {
            this.logger.error(`Intelligence layer failure for vehicle ${vehicle_id}: ${err.message}`);
        }


        // 3. Cache to Redis
        await this.redis.set(`latest_position:${vehicle_id}`, payload, 3600);

        // 4. Emit to WebSocket rooms
        this.gateway.server.to(`tenant:${tenant_id}`).emit('tracking:update', payload);
        this.gateway.server.to('global').emit('tracking:update', payload);
        this.gateway.server.to(`vehicle_${vehicle_id}`).emit('tracking:update', payload);


        return payload;
    }

    async getHistory(vehicleId: string, from: string, to: string) {
        return this.db.query(
            `SELECT * FROM vehicle_tracking 
       WHERE vehicle_id = $1 AND recorded_at BETWEEN $2 AND $3
       ORDER BY recorded_at ASC`,
            [vehicleId, from, to]
        );
    }
}
