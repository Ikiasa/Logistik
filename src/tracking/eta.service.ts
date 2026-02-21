import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class ETAService {
    private readonly logger = new Logger(ETAService.name);

    constructor(private db: DatabaseService) { }

    async updateShipmentETA(tenantId: string, vehicleId: string, currentLat: number, currentLng: number, currentSpeed: number) {
        // 1. Get active shipment for this vehicle
        const shipmentRes = await this.db.query(
            `SELECT s.id, s.destination_geofence_id, g.area
             FROM shipments s
             LEFT JOIN geofences g ON s.destination_geofence_id = g.id
             WHERE s.tenant_id = $1 AND s.vehicle_id = $2 AND s.status = 'IN_TRANSIT'
             LIMIT 1`,
            [tenantId, vehicleId]
        );

        if (shipmentRes.length === 0 || !shipmentRes[0].destination_geofence_id) {
            return;
        }

        const shipment = shipmentRes[0];

        // 2. Calculate distance to destination center (Spatial)
        const distanceRes = await this.db.query(
            `SELECT ST_Distance(
                ST_SetSRID(ST_Point($1, $2), 4326)::geography,
                ST_Centroid($3)::geography
            ) / 1000 as distance_km`,
            [currentLng, currentLat, shipment.area]
        );

        const distanceKm = distanceRes[0].distance_km;

        // 3. Estimate time (using current speed or fallback to 40km/h)
        const speedKph = currentSpeed > 5 ? currentSpeed : 40;
        const hoursToArrival = distanceKm / speedKph;
        const arrivalTimestamp = new Date(Date.now() + hoursToArrival * 3600 * 1000);

        // 4. Update shipment record
        await this.db.query(
            `UPDATE shipments 
             SET estimated_arrival_at = $1, last_eta_update_at = NOW() 
             WHERE id = $2`,
            [arrivalTimestamp, shipment.id]
        );

        this.logger.debug(`ETA Updated for shipment ${shipment.id}: ${arrivalTimestamp.toISOString()} (${Math.round(distanceKm)}km remaining)`);
    }
}
