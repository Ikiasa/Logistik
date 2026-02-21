import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class FleetAnalyticsService {
    private readonly logger = new Logger(FleetAnalyticsService.name);

    constructor(private db: DatabaseService) { }

    async getUtilizationMetrics(tenantId: string, startDate: string, endDate: string) {
        // 1. Calculate Utilization Rate (Active vs Shift Time)
        const utilization = await this.db.query(
            `SELECT 
        vehicle_id,
        COUNT(id) as total_shifts,
        SUM(EXTRACT(EPOCH FROM (COALESCE(end_at, NOW()) - start_at))/3600) as total_hours,
        SUM(end_odometer - start_odometer) as total_km
       FROM shift_logs
       WHERE tenant_id = $1 AND start_at BETWEEN $2 AND $3
       GROUP BY vehicle_id`,
            [tenantId, startDate, endDate]
        );

        // 2. Revenue Integration (Mocking for now based on shipments)
        // In production, join with shipment_revenue
        const revenueStats = {
            avg_revenue_per_km: 15.50,
            avg_revenue_per_vehicle: 2500.00,
            idle_cost_per_hour: 45.00
        };

        return utilization.map(u => ({
            ...u,
            utilization_rate: (u.total_hours / (24 * 30)) * 100, // Monthly theoretical max
            total_revenue: u.total_km * revenueStats.avg_revenue_per_km,
            revenue_per_km: revenueStats.avg_revenue_per_km,
            idle_cost_estimation: (24 * 30 - u.total_hours) * revenueStats.idle_cost_per_hour
        }));
    }

    async getDriverPerformance(tenantId: string) {
        return this.db.query(
            `SELECT 
            d.name,
            COUNT(s.id) as shifts,
            AVG(vt.speed) as avg_speed,
            COUNT(CASE WHEN vt.status = 'OVERSPEED' THEN 1 END) as overspeed_events
           FROM drivers d
           LEFT JOIN shift_logs s ON d.id = s.driver_id
           LEFT JOIN vehicle_tracking vt ON s.vehicle_id = vt.vehicle_id
           WHERE d.tenant_id = $1
           GROUP BY d.id, d.name`,
            [tenantId]
        );
    }
}
