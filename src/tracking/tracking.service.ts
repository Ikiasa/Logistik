import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

export interface VehicleCoordinate {
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    recordedAt?: Date;
}

@Injectable()
export class TrackingService {
    private readonly logger = new Logger(TrackingService.name);

    constructor(private readonly pool: Pool) { }

    async saveCoordinate(tenantId: string, coord: VehicleCoordinate): Promise<void> {
        const query = `
            INSERT INTO vehicle_tracking (tenant_id, vehicle_id, latitude, longitude, speed, heading)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
            tenantId,
            coord.vehicleId,
            coord.latitude,
            coord.longitude,
            coord.speed,
            coord.heading,
        ];

        try {
            await this.pool.query(query, values);
        } catch (error) {
            this.logger.error(`Failed to save coordinate for vehicle ${coord.vehicleId}: ${error.message}`);
        }
    }

    async getLatestLocation(vehicleId: string): Promise<any> {
        const query = `
            SELECT * FROM vehicle_tracking 
            WHERE vehicle_id = $1 
            ORDER BY recorded_at DESC 
            LIMIT 1
        `;
        const result = await this.pool.query(query, [vehicleId]);
        return result.rows[0];
    }

    async getHistory(vehicleId: string, from: Date, to: Date): Promise<any[]> {
        const query = `
            SELECT * FROM vehicle_tracking 
            WHERE vehicle_id = $1 
              AND recorded_at BETWEEN $2 AND $3
            ORDER BY recorded_at ASC
        `;
        const result = await this.pool.query(query, [vehicleId, from, to]);
        return result.rows;
    }

    /**
     * Calculate total distance traveled using Haversine formula
     */
    async getTotalDistanceTraveled(vehicleId: string, from: Date, to: Date): Promise<number> {
        const history = await this.getHistory(vehicleId, from, to);

        if (history.length < 2) {
            return 0;
        }

        let totalDistance = 0;
        for (let i = 1; i < history.length; i++) {
            const prev = history[i - 1];
            const curr = history[i];

            // Filter out stationary points (speed < 5 km/h)
            if (curr.speed < 5) {
                continue;
            }

            totalDistance += this.haversineDistance(
                prev.latitude,
                prev.longitude,
                curr.latitude,
                curr.longitude
            );
        }

        return totalDistance;
    }

    /**
     * Calculate idle time (speed = 0 or < 5 km/h) in hours
     */
    async getIdleTime(vehicleId: string, from: Date, to: Date): Promise<number> {
        const query = `
            SELECT 
                SUM(EXTRACT(EPOCH FROM (LEAD(recorded_at) OVER (ORDER BY recorded_at) - recorded_at))) / 3600 as idle_hours
            FROM vehicle_tracking 
            WHERE vehicle_id = $1 
              AND recorded_at BETWEEN $2 AND $3
              AND speed < 5
        `;
        const result = await this.pool.query(query, [vehicleId, from, to]);
        return Number(result.rows[0]?.idle_hours || 0);
    }

    /**
     * Calculate average operational speed (excluding idle time)
     */
    async getAverageSpeed(vehicleId: string, from: Date, to: Date): Promise<number> {
        const query = `
            SELECT AVG(speed) as avg_speed 
            FROM vehicle_tracking 
            WHERE vehicle_id = $1 
              AND recorded_at BETWEEN $2 AND $3
              AND speed >= 5
        `;
        const result = await this.pool.query(query, [vehicleId, from, to]);
        return Number(result.rows[0]?.avg_speed || 0);
    }

    /**
     * Haversine formula to calculate distance between two GPS coordinates
     * Returns distance in kilometers
     */
    private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    async getGeofences(tenantId: string): Promise<any[]> {
        const query = `
            SELECT id, name, type, ST_AsGeoJSON(area)::json as geometry, address 
            FROM geofences 
            WHERE tenant_id = $1
        `;
        const result = await this.pool.query(query, [tenantId]);
        return result.rows;
    }

    async getIncidents(tenantId: string): Promise<any[]> {
        const query = `
            SELECT * FROM incidents 
            WHERE tenant_id = $1 AND status = 'ACTIVE'
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        const result = await this.pool.query(query, [tenantId]);
        return result.rows;
    }
}
