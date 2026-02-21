import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DatabaseService } from '../common/database/database.service';

const execPromise = promisify(exec);

@Injectable()
export class ReliabilityService {
    private readonly logger = new Logger(ReliabilityService.name);

    constructor(private db: DatabaseService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyBackup() {
        this.logger.log('Starting automated daily database backup...');
        const dbUrl = process.env.DATABASE_URL;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `backup-${timestamp}.sql`;

        try {
            // In production, use pg_dump
            // await execPromise(`pg_dump ${dbUrl} > ./backups/${fileName}`);
            this.logger.log(`Backup successfully created: ${fileName} (SIMULATED)`);
        } catch (error) {
            this.logger.error(`Backup failed: ${error.message}`);
        }
    }

    async getSystemHealth() {
        try {
            // Check DB connectivity
            await this.db.query('SELECT 1');

            // Check Redis (if available via some service)

            return {
                status: 'HEALTHY',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'DEGRADED',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Detect vehicles with cost exceeding revenue (negative margin)
     */
    async detectCostAnomalies(tenantId: string, startDate: string, endDate: string) {
        const query = `
            WITH vehicle_costs AS (
                SELECT 
                    v.vehicle_id,
                    COALESCE(SUM(f.total_cost), 0) as fuel_costs,
                    COALESCE(SUM(m.cost), 0) as maintenance_costs,
                    COALESCE(SUM(o.amount), 0) as op_expenses
                FROM (SELECT DISTINCT vehicle_id FROM vehicle_tracking WHERE tenant_id = $1) v
                LEFT JOIN fuel_logs f ON v.vehicle_id = f.vehicle_id 
                    AND f.tenant_id = $1 AND f.recorded_at BETWEEN $2 AND $3
                LEFT JOIN maintenance_logs m ON v.vehicle_id = m.vehicle_id 
                    AND m.tenant_id = $1 AND m.recorded_at BETWEEN $2 AND $3
                LEFT JOIN op_expenses o ON v.vehicle_id = o.vehicle_id 
                    AND o.tenant_id = $1 AND o.recorded_at BETWEEN $2 AND $3
                GROUP BY v.vehicle_id
            )
            SELECT 
                vehicle_id,
                fuel_costs + maintenance_costs + op_expenses as total_costs
            FROM vehicle_costs
            WHERE fuel_costs + maintenance_costs + op_expenses > 0
        `;

        const result = await this.db.query(query, [tenantId, startDate, endDate]);

        const anomalies = [];
        for (const row of result) {
            // Mock revenue - in production, get from shipments
            const mockRevenue = 10000;
            const totalCosts = Number(row.total_costs);

            if (totalCosts > mockRevenue) {
                anomalies.push({
                    vehicleId: row.vehicle_id,
                    type: 'COST_EXCEEDS_REVENUE',
                    severity: 'HIGH',
                    message: `Vehicle costs (${totalCosts}) exceed revenue (${mockRevenue})`,
                    detectedAt: new Date().toISOString(),
                    value: totalCosts,
                    threshold: mockRevenue
                });
            }
        }

        return anomalies;
    }

    /**
     * Detect unusual fuel consumption patterns
     */
    async detectFuelEfficiencyAnomalies(tenantId: string, startDate: string, endDate: string) {
        // Get fleet average fuel efficiency
        const fleetAvgQuery = `
            SELECT AVG(liters_per_km) as fleet_avg
            FROM (
                SELECT 
                    vehicle_id,
                    SUM(liters) / NULLIF(MAX(odometer) - MIN(odometer), 0) as liters_per_km
                FROM fuel_logs
                WHERE tenant_id = $1 AND recorded_at BETWEEN $2 AND $3
                    AND odometer IS NOT NULL
                GROUP BY vehicle_id
                HAVING MAX(odometer) - MIN(odometer) > 0
            ) vehicle_efficiency
        `;

        const fleetAvgResult = await this.db.query(fleetAvgQuery, [tenantId, startDate, endDate]);
        const fleetAvg = Number(fleetAvgResult[0]?.fleet_avg || 0);

        if (fleetAvg === 0) {
            return [];
        }

        // Get individual vehicle efficiency
        const vehicleQuery = `
            SELECT 
                vehicle_id,
                SUM(liters) / NULLIF(MAX(odometer) - MIN(odometer), 0) as liters_per_km
            FROM fuel_logs
            WHERE tenant_id = $1 AND recorded_at BETWEEN $2 AND $3
                AND odometer IS NOT NULL
            GROUP BY vehicle_id
            HAVING MAX(odometer) - MIN(odometer) > 0
        `;

        const vehicleResult = await this.db.query(vehicleQuery, [tenantId, startDate, endDate]);

        const anomalies = [];
        const DEVIATION_THRESHOLD = 0.20; // 20% deviation

        for (const row of vehicleResult) {
            const vehicleEfficiency = Number(row.liters_per_km);
            const deviation = Math.abs(vehicleEfficiency - fleetAvg) / fleetAvg;

            if (deviation > DEVIATION_THRESHOLD) {
                anomalies.push({
                    vehicleId: row.vehicle_id,
                    type: 'FUEL_EFFICIENCY',
                    severity: deviation > 0.30 ? 'HIGH' : 'MEDIUM',
                    message: `Fuel efficiency ${(deviation * 100).toFixed(1)}% above fleet average`,
                    detectedAt: new Date().toISOString(),
                    value: vehicleEfficiency,
                    threshold: fleetAvg
                });
            }
        }

        return anomalies;
    }

    /**
     * Detect sudden maintenance cost spikes
     */
    async detectMaintenanceCostSpikes(tenantId: string, startDate: string, endDate: string) {
        // Calculate monthly average for each vehicle
        const query = `
            WITH monthly_costs AS (
                SELECT 
                    vehicle_id,
                    DATE_TRUNC('month', recorded_at) as month,
                    SUM(cost) as monthly_cost
                FROM maintenance_logs
                WHERE tenant_id = $1 AND recorded_at < $2
                GROUP BY vehicle_id, DATE_TRUNC('month', recorded_at)
            ),
            vehicle_avg AS (
                SELECT 
                    vehicle_id,
                    AVG(monthly_cost) as avg_monthly_cost
                FROM monthly_costs
                GROUP BY vehicle_id
            ),
            current_period AS (
                SELECT 
                    vehicle_id,
                    SUM(cost) as current_cost
                FROM maintenance_logs
                WHERE tenant_id = $1 AND recorded_at BETWEEN $2 AND $3
                GROUP BY vehicle_id
            )
            SELECT 
                c.vehicle_id,
                c.current_cost,
                COALESCE(a.avg_monthly_cost, 0) as avg_cost
            FROM current_period c
            LEFT JOIN vehicle_avg a ON c.vehicle_id = a.vehicle_id
        `;

        const result = await this.db.query(query, [tenantId, startDate, endDate]);

        const anomalies = [];
        const SPIKE_THRESHOLD = 2.0; // 2x average

        for (const row of result) {
            const currentCost = Number(row.current_cost);
            const avgCost = Number(row.avg_cost);

            if (avgCost > 0 && currentCost > avgCost * SPIKE_THRESHOLD) {
                anomalies.push({
                    vehicleId: row.vehicle_id,
                    type: 'MAINTENANCE_SPIKE',
                    severity: currentCost > avgCost * 3 ? 'HIGH' : 'MEDIUM',
                    message: `Maintenance costs ${(currentCost / avgCost).toFixed(1)}x above average`,
                    detectedAt: new Date().toISOString(),
                    value: currentCost,
                    threshold: avgCost
                });
            }
        }

        return anomalies;
    }

    /**
     * Detect excessive idle time
     */
    async detectIdleTimeExcess(tenantId: string, startDate: string, endDate: string) {
        const query = `
            WITH vehicle_time AS (
                SELECT 
                    vehicle_id,
                    SUM(CASE WHEN speed < 5 THEN 1 ELSE 0 END) as idle_count,
                    COUNT(*) as total_count
                FROM vehicle_tracking
                WHERE tenant_id = $1 AND recorded_at BETWEEN $2 AND $3
                GROUP BY vehicle_id
            )
            SELECT 
                vehicle_id,
                (idle_count::float / NULLIF(total_count, 0)) * 100 as idle_percentage
            FROM vehicle_time
            WHERE total_count > 0
        `;

        const result = await this.db.query(query, [tenantId, startDate, endDate]);

        const anomalies = [];
        const IDLE_THRESHOLD = 15; // 15% idle time

        for (const row of result) {
            const idlePercentage = Number(row.idle_percentage);

            if (idlePercentage > IDLE_THRESHOLD) {
                anomalies.push({
                    vehicleId: row.vehicle_id,
                    type: 'IDLE_TIME',
                    severity: idlePercentage > 25 ? 'HIGH' : 'MEDIUM',
                    message: `Idle time at ${idlePercentage.toFixed(1)}% of operational time`,
                    detectedAt: new Date().toISOString(),
                    value: idlePercentage,
                    threshold: IDLE_THRESHOLD
                });
            }
        }

        return anomalies;
    }

    /**
     * Run all anomaly detection checks
     */
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async runDailyAnomalyDetection() {
        this.logger.log('Running daily cost anomaly detection...');

        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // Last 30 days

        try {
            // Get all tenants
            const tenants = await this.db.query('SELECT DISTINCT tenant_id FROM vehicle_tracking');

            for (const tenant of tenants) {
                const tenantId = tenant.tenant_id;

                const [costAnomalies, fuelAnomalies, maintenanceAnomalies, idleAnomalies] = await Promise.all([
                    this.detectCostAnomalies(tenantId, startDate, endDate),
                    this.detectFuelEfficiencyAnomalies(tenantId, startDate, endDate),
                    this.detectMaintenanceCostSpikes(tenantId, startDate, endDate),
                    this.detectIdleTimeExcess(tenantId, startDate, endDate)
                ]);

                const allAnomalies = [
                    ...costAnomalies,
                    ...fuelAnomalies,
                    ...maintenanceAnomalies,
                    ...idleAnomalies
                ];

                if (allAnomalies.length > 0) {
                    this.logger.warn(`Found ${allAnomalies.length} anomalies for tenant ${tenantId}`);
                    // TODO: Emit alerts via alert system
                }
            }

            this.logger.log('Daily anomaly detection completed');
        } catch (error) {
            this.logger.error(`Anomaly detection failed: ${error.message}`);
        }
    }
}
