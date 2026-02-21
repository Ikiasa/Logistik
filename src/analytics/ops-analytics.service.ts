
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class OpsAnalyticsService {
    private readonly logger = new Logger(OpsAnalyticsService.name);

    constructor(private db: DatabaseService) { }

    async getHeatmapData(tenantId: string, timeframeHours: number = 24) {
        try {
            // Use simple rounding instead of PostGIS ST_SnapToGrid — works without PostGIS extension
            const query = `
                SELECT 
                    ROUND(latitude::numeric, 2) as lat,
                    ROUND(longitude::numeric, 2) as lng,
                    COUNT(*)::int as weight
                FROM vehicle_tracking
                WHERE tenant_id = $1 
                  AND recorded_at > NOW() - INTERVAL '1 hour' * $2
                GROUP BY ROUND(latitude::numeric, 2), ROUND(longitude::numeric, 2)
                ORDER BY weight DESC
                LIMIT 500
            `;
            return await this.db.query(query, [tenantId, timeframeHours]);
        } catch (err) {
            this.logger.warn(`Heatmap query failed (returning empty): ${err.message}`);
            return [];
        }
    }

    async getFleetUtilization(tenantId: string) {
        try {
            const query = `
                SELECT 
                    vehicle_id,
                    SUM(CASE WHEN speed >= 5 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0)::float as utilization_ratio,
                    COUNT(*) FILTER (WHERE speed < 5)::int as idle_pings,
                    COUNT(*) FILTER (WHERE speed >= 5)::int as active_pings
                FROM vehicle_tracking
                WHERE tenant_id = $1
                  AND recorded_at > NOW() - INTERVAL '7 days'
                GROUP BY vehicle_id
                ORDER BY utilization_ratio DESC
                LIMIT 20
            `;
            const stats = await this.db.query(query, [tenantId]);

            return stats.map(s => {
                const totalHours = 24 * 7;
                const total = (Number(s.active_pings) + Number(s.idle_pings)) || 1;
                const activeHours = Math.round((Number(s.active_pings) / total) * totalHours);
                const idleHours = totalHours - activeHours;

                return {
                    vehicleId: s.vehicle_id,
                    utilization: Math.round((s.utilization_ratio || 0) * 100),
                    idleHours,
                    activeHours
                };
            });
        } catch (err) {
            this.logger.warn(`Fleet utilization query failed (returning empty): ${err.message}`);
            return [];
        }
    }

    async getSLATrends(tenantId: string) {
        try {
            // Use geofence_history + shipments join (requires 009 migration)
            // Falls back to empty if tables don't exist yet
            const query = `
                SELECT 
                    DATE_TRUNC('week', gh.recorded_at) as week,
                    COUNT(*)::int as total_deliveries,
                    COUNT(*) FILTER (WHERE gh.recorded_at <= s.estimated_arrival_at)::int as on_time_deliveries,
                    COALESCE(AVG(
                        EXTRACT(EPOCH FROM (gh.recorded_at - s.estimated_arrival_at)) / 60
                    ) FILTER (WHERE gh.recorded_at > s.estimated_arrival_at), 0) as avg_delay_minutes
                FROM shipments s
                JOIN geofence_history gh 
                    ON gh.vehicle_id = s.vehicle_id 
                    AND gh.geofence_id = s.destination_geofence_id
                    AND gh.event_type = 'ENTER'
                WHERE s.tenant_id = $1
                  AND s.status = 'DELIVERED'
                  AND s.estimated_arrival_at IS NOT NULL
                  AND gh.recorded_at > NOW() - INTERVAL '30 days'
                GROUP BY 1
                ORDER BY 1 ASC
            `;
            const data = await this.db.query(query, [tenantId]);

            return data.map(d => ({
                period: d.week,
                onTimeRate: Math.round((Number(d.on_time_deliveries) / (Number(d.total_deliveries) || 1)) * 100),
                avgDelay: Math.round(Number(d.avg_delay_minutes || 0))
            }));
        } catch (err) {
            this.logger.warn(`SLA trends query failed (returning empty): ${err.message}`);
            return [];
        }
    }

    async getSLAPerformance(tenantId: string) {
        try {
            const query = `
                SELECT 
                    s.id as shipment_id,
                    s.estimated_arrival_at,
                    gh.recorded_at as actual_arrival_at,
                    EXTRACT(EPOCH FROM (gh.recorded_at - s.estimated_arrival_at)) / 60 as delay_minutes
                FROM shipments s
                JOIN geofence_history gh 
                    ON gh.vehicle_id = s.vehicle_id 
                    AND gh.geofence_id = s.destination_geofence_id
                    AND gh.event_type = 'ENTER'
                    AND gh.recorded_at > s.created_at
                WHERE s.tenant_id = $1
                  AND s.estimated_arrival_at IS NOT NULL
                  AND s.status = 'DELIVERED'
                ORDER BY gh.recorded_at DESC
                LIMIT 100
            `;
            const data = await this.db.query(query, [tenantId]);

            const onTimeCount = data.filter(d => Number(d.delay_minutes) <= 0).length;
            const total = data.length || 1;

            return {
                onTimeRate: Math.round((onTimeCount / total) * 100),
                avgDelayMinutes: Math.round(
                    data.reduce((acc, d) => acc + Math.max(0, Number(d.delay_minutes)), 0) / total
                ),
                history: data.slice(0, 10)
            };
        } catch (err) {
            this.logger.warn(`SLA performance query failed (returning fallback): ${err.message}`);
            // Return a safe fallback instead of throwing a 500
            return {
                onTimeRate: 0,
                avgDelayMinutes: 0,
                history: []
            };
        }
    }
}
