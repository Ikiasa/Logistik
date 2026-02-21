import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { TrackingGateway } from './tracking.gateway';

export enum GeofenceEventType {
    ENTER = 'ENTER',
    EXIT = 'EXIT'
}

@Injectable()
export class GeofenceService {
    private readonly logger = new Logger(GeofenceService.name);

    constructor(
        private db: DatabaseService,
        private gateway: TrackingGateway
    ) { }

    async checkGeofenceIntersections(tenantId: string, vehicleId: string, lat: number, lng: number) {
        // 1. Find all geofences that contain this point
        // Using PostGIS ST_Contains
        const query = `
            SELECT id, name, type 
            FROM geofences 
            WHERE tenant_id = $1 
              AND ST_Contains(area, ST_SetSRID(ST_Point($2, $3), 4326))
        `;
        const activeGeofences = await this.db.query(query, [tenantId, lng, lat]); // Note: ST_Point(lng, lat)

        // 2. Get last known geofence state from Redis or DB
        // For simplicity, we'll check the last entry in geofence_history
        const lastEventRes = await this.db.query(
            `SELECT geofence_id, event_type FROM geofence_history 
             WHERE vehicle_id = $1 AND tenant_id = $2 
             ORDER BY recorded_at DESC LIMIT 1`,
            [vehicleId, tenantId]
        );

        const lastGeofenceId = lastEventRes[0]?.geofence_id;
        const lastEventType = lastEventRes[0]?.event_type;

        // 3. Logic: If current geofences contain one that wasn't the last ENTERed, trigger ENTER
        for (const gf of activeGeofences) {
            if (gf.id !== lastGeofenceId || lastEventType === GeofenceEventType.EXIT) {
                await this.triggerEvent(tenantId, vehicleId, gf.id, gf.name, GeofenceEventType.ENTER);
            }
        }

        // 4. Logic: If last geofence ENTERed is NOT in current active list, trigger EXIT
        if (lastGeofenceId && lastEventType === GeofenceEventType.ENTER) {
            const stillInside = activeGeofences.some(gf => gf.id === lastGeofenceId);
            if (!stillInside) {
                await this.triggerEvent(tenantId, vehicleId, lastGeofenceId, 'Unknown', GeofenceEventType.EXIT);
            }
        }
    }

    private async triggerEvent(tenantId: string, vehicleId: string, geofenceId: string, geofenceName: string, eventType: GeofenceEventType) {
        this.logger.log(`Vehicle ${vehicleId} ${eventType} geofence ${geofenceName} (${geofenceId})`);

        // Record history
        await this.db.query(
            `INSERT INTO geofence_history (tenant_id, vehicle_id, geofence_id, event_type)
             VALUES ($1, $2, $3, $4)`,
            [tenantId, vehicleId, geofenceId, eventType]
        );

        // Notify gateway
        this.gateway.broadcastAlert(tenantId, {
            type: 'GEOFENCE',
            vehicleId,
            geofenceId,
            geofenceName,
            eventType,
            timestamp: new Date().toISOString()
        });

        // CFO/Operational Integration: Auto-update Shipment Status if it matches destination
        if (eventType === GeofenceEventType.ENTER) {
            await this.db.query(
                `UPDATE shipments 
                 SET status = 'ARRIVED', updated_at = NOW() 
                 WHERE tenant_id = $1 AND vehicle_id = $2 AND destination_geofence_id = $3 AND status = 'IN_TRANSIT'`,
                [tenantId, vehicleId, geofenceId]
            );
        }
    }

    async createGeofence(tenantId: string, data: { name: string; type: string; areaWkt: string; address?: string }) {
        // areaWkt should be in 'POLYGON((lng lat, ...))' format
        return this.db.query(
            `INSERT INTO geofences (tenant_id, name, type, area, address)
             VALUES ($1, $2, $3, ST_GeomFromText($4, 4326), $5)
             RETURNING id, name, type`,
            [tenantId, data.name, data.type, data.areaWkt, data.address]
        );
    }
}
