import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { TrackingService } from '../tracking/tracking.service';

export interface VehicleProfitability {
    vehicleId: string;
    revenue: number;
    // Specific Cost Breakdown
    fuelCosts: number;
    tollCosts: number;
    maintenanceCosts: number;
    driverOvertime: number;
    idleCost: number;
    opExpenses: number; // Other miscellaneous expenses

    totalCosts: number;

    // CFO Performance Metrics
    grossMargin: number; // Revenue - (Fuel + Toll + Overtime + Idle)
    grossMarginPercentage: number;
    netMargin: number; // Gross Margin - Maintenance - Other Op Expenses
    netMarginPercentage: number;

    costPerKm: number;
    costPerShipment: number;
    revenuePerKm: number;
    distanceTraveled: number;
    shipmentCount: number;
    idleTimePercentage: number;
}

export interface FleetProfitability {
    totalRevenue: number;
    totalCosts: number;
    netMargin: number;
    netMarginPercentage: number;
    vehicleCount: number;
    vehicles: VehicleProfitability[];
}

@Injectable()
export class ProfitabilityService {
    private readonly logger = new Logger(ProfitabilityService.name);
    private readonly IDLE_COST_PER_HOUR = 500000; // Increased for IDR (500k per hour)

    constructor(
        private db: DatabaseService,
        private trackingService: TrackingService
    ) { }

    async getVehicleProfitability(
        tenantId: string,
        vehicleId: string,
        startDate: string,
        endDate: string
    ): Promise<VehicleProfitability> {
        // 1. Get distance traveled from tracking service
        const distanceTraveled = await this.trackingService.getTotalDistanceTraveled(
            vehicleId,
            new Date(startDate),
            new Date(endDate)
        );

        // 2. Calculate Idle Cost (Automated from GPS)
        const idleTimeHours = await this.trackingService.getIdleTime(
            vehicleId,
            new Date(startDate),
            new Date(endDate)
        );
        const idleCost = idleTimeHours * this.IDLE_COST_PER_HOUR;

        // 3. Aggregate Revenue and Shipment-specific Costs from Shipments Table
        const shipmentMetricsRes = await this.db.query(
            `SELECT 
                COUNT(s.id) as shipment_count,
                SUM(o.total_amount) as revenue,
                SUM(s.fuel_cost_amount) as fuel_costs,
                SUM(s.toll_cost_amount) as toll_costs,
                SUM(s.driver_overtime_amount) as driver_overtime
             FROM shipments s
             JOIN orders o ON s.order_id = o.id
             WHERE s.tenant_id = $1 AND s.vehicle_id = $2 
             AND s.created_at BETWEEN $3 AND $4`,
            [tenantId, vehicleId, startDate, endDate]
        );

        const metrics = shipmentMetricsRes[0] || {};
        const revenue = Number(metrics.revenue || 0);
        const fuelCosts = Number(metrics.fuel_costs || 0);
        const tollCosts = Number(metrics.toll_costs || 0);
        const driverOvertime = Number(metrics.driver_overtime || 0);
        const shipmentCount = Number(metrics.shipment_count || 0);

        // 4. Get Indirect Costs (Maintenance & Misc Op Expenses)
        const maintRes = await this.db.query(
            `SELECT SUM(cost) as total FROM maintenance_logs 
             WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4`,
            [tenantId, vehicleId, startDate, endDate]
        );
        const maintenanceCosts = Number(maintRes[0]?.total || 0);

        const opRes = await this.db.query(
            `SELECT SUM(amount) as total FROM op_expenses 
             WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4
             AND (type NOT IN ('TOLL', 'FUEL'))`, // Toll/Fuel already tracked in shipments or specific logs
            [tenantId, vehicleId, startDate, endDate]
        );
        const opExpenses = Number(opRes[0]?.total || 0);

        // 5. CFO Calculation Logic
        const directCosts = fuelCosts + tollCosts + driverOvertime + idleCost;
        const totalCosts = directCosts + maintenanceCosts + opExpenses;

        const grossMargin = revenue - directCosts;
        const grossMarginPercentage = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

        const netMargin = revenue - totalCosts;
        const netMarginPercentage = revenue > 0 ? (netMargin / revenue) * 100 : 0;

        // 6. Efficiency Metrics
        const costPerKm = distanceTraveled > 0 ? totalCosts / distanceTraveled : 0;
        const revenuePerKm = distanceTraveled > 0 ? revenue / distanceTraveled : 0;
        const costPerShipment = shipmentCount > 0 ? totalCosts / shipmentCount : 0;

        // Calculate idle time percentage for the period
        const totalTimeHours = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60);
        const idleTimePercentage = totalTimeHours > 0 ? (idleTimeHours / totalTimeHours) * 100 : 0;

        return {
            vehicleId,
            revenue,
            fuelCosts,
            tollCosts,
            maintenanceCosts,
            driverOvertime,
            idleCost,
            opExpenses,
            totalCosts,
            grossMargin,
            grossMarginPercentage,
            netMargin,
            netMarginPercentage,
            costPerKm,
            costPerShipment,
            revenuePerKm,
            distanceTraveled,
            shipmentCount,
            idleTimePercentage
        };
    }

    async getFleetProfitability(
        tenantId: string,
        startDate: string,
        endDate: string
    ): Promise<FleetProfitability> {
        // Get all vehicles for tenant
        const vehiclesRes = await this.db.query(
            `SELECT DISTINCT vehicle_id FROM vehicle_tracking WHERE tenant_id = $1`,
            [tenantId]
        );

        const vehicles: VehicleProfitability[] = [];
        let totalRevenue = 0;
        let totalCosts = 0;

        for (const row of vehiclesRes) {
            const vehicleProfitability = await this.getVehicleProfitability(
                tenantId,
                row.vehicle_id,
                startDate,
                endDate
            );
            vehicles.push(vehicleProfitability);
            totalRevenue += vehicleProfitability.revenue;
            totalCosts += vehicleProfitability.totalCosts;
        }

        const netMargin = totalRevenue - totalCosts;
        const netMarginPercentage = totalRevenue > 0 ? (netMargin / totalRevenue) * 100 : 0;

        return {
            totalRevenue,
            totalCosts,
            netMargin,
            netMarginPercentage,
            vehicleCount: vehicles.length,
            vehicles
        };
    }

    async getMonthlyTrends(
        tenantId: string,
        vehicleId: string,
        months: number = 6
    ): Promise<any[]> {
        const trends = [];
        const now = new Date();

        for (let i = 0; i < months; i++) {
            const endDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const startDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);

            const profitability = await this.getVehicleProfitability(
                tenantId,
                vehicleId,
                startDate.toISOString(),
                endDate.toISOString()
            );

            trends.push({
                month: startDate.toISOString().substring(0, 7),
                ...profitability
            });
        }

        return trends.reverse();
    }
}
