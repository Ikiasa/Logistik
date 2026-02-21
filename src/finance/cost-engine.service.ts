import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class CostEngineService {
    private readonly logger = new Logger(CostEngineService.name);

    constructor(private db: DatabaseService) { }

    async getVehicleProfitability(tenantId: string, vehicleId: string, startDate: string, endDate: string) {
        // 1. Get Revenue (Mocked for now)
        const revenue = 15000.00; // In production, sum of shipment prices for this vehicle

        // 2. Aggregate Fuel Costs
        const fuelRes = await this.db.query(
            `SELECT SUM(total_cost) as total FROM fuel_logs 
       WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4`,
            [tenantId, vehicleId, startDate, endDate]
        );
        const fuelCosts = Number(fuelRes[0]?.total || 0);

        // 3. Aggregate Maintenance Costs
        const maintRes = await this.db.query(
            `SELECT SUM(cost) as total FROM maintenance_logs 
       WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4`,
            [tenantId, vehicleId, startDate, endDate]
        );
        const maintenanceCosts = Number(maintRes[0]?.total || 0);

        // 4. Aggregate Operational Expenses
        const opRes = await this.db.query(
            `SELECT SUM(amount) as total FROM op_expenses 
       WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4`,
            [tenantId, vehicleId, startDate, endDate]
        );
        const opExpenses = Number(opRes[0]?.total || 0);

        const totalCosts = fuelCosts + maintenanceCosts + opExpenses;
        const netMargin = revenue - totalCosts;

        return {
            revenue,
            fuelCosts,
            maintenanceCosts,
            opExpenses,
            totalCosts,
            netMargin,
            marginPercentage: (netMargin / revenue) * 100
        };
    }

    async addFuelLog(tenantId: string, data: any) {
        return this.db.query(
            `INSERT INTO fuel_logs (tenant_id, vehicle_id, driver_id, liters, cost_per_liter, odometer, location, receipt_photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [tenantId, data.vehicle_id, data.driver_id, data.liters, data.cost_per_liter, data.odometer, data.location, data.receipt_photo]
        );
    }

    async addMaintenanceLog(tenantId: string, data: any) {
        return this.db.query(
            `INSERT INTO maintenance_logs (tenant_id, vehicle_id, type, description, cost, odometer, vendor_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [tenantId, data.vehicle_id, data.type, data.description, data.cost, data.odometer, data.vendor_name]
        );
    }

    async addOperationalExpense(tenantId: string, data: any) {
        return this.db.query(
            `INSERT INTO op_expenses (tenant_id, shipment_id, vehicle_id, driver_id, type, amount, receipt_photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [tenantId, data.shipment_id, data.vehicle_id, data.driver_id, data.type, data.amount, data.receipt_photo]
        );
    }

    async getFuelEfficiency(tenantId: string, vehicleId: string, startDate: string, endDate: string) {
        const result = await this.db.query(
            `SELECT 
                SUM(liters) as total_liters,
                MAX(odometer) - MIN(odometer) as distance_traveled,
                COUNT(*) as refuel_count,
                AVG(cost_per_liter) as avg_cost_per_liter
             FROM fuel_logs 
             WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4
             AND odometer IS NOT NULL`,
            [tenantId, vehicleId, startDate, endDate]
        );

        const data = result[0];
        const totalLiters = Number(data?.total_liters || 0);
        const distanceTraveled = Number(data?.distance_traveled || 0);
        const litersPer100Km = distanceTraveled > 0 ? (totalLiters / distanceTraveled) * 100 : 0;

        return {
            totalLiters,
            distanceTraveled,
            litersPer100Km,
            refuelCount: Number(data?.refuel_count || 0),
            avgCostPerLiter: Number(data?.avg_cost_per_liter || 0)
        };
    }

    async getCostBreakdown(tenantId: string, vehicleId: string, startDate: string, endDate: string) {
        const fuelRes = await this.db.query(
            `SELECT SUM(total_cost) as total FROM fuel_logs 
             WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4`,
            [tenantId, vehicleId, startDate, endDate]
        );

        const maintRes = await this.db.query(
            `SELECT type, SUM(cost) as total FROM maintenance_logs 
             WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4
             GROUP BY type`,
            [tenantId, vehicleId, startDate, endDate]
        );

        const opRes = await this.db.query(
            `SELECT type, SUM(amount) as total FROM op_expenses 
             WHERE tenant_id = $1 AND vehicle_id = $2 AND recorded_at BETWEEN $3 AND $4
             GROUP BY type`,
            [tenantId, vehicleId, startDate, endDate]
        );

        return {
            fuel: Number(fuelRes[0]?.total || 0),
            maintenance: maintRes.reduce((acc, row) => {
                acc[row.type] = Number(row.total);
                return acc;
            }, {}),
            operational: opRes.reduce((acc, row) => {
                acc[row.type] = Number(row.total);
                return acc;
            }, {})
        };
    }

    async getIdleCostImpact(tenantId: string, vehicleId: string, startDate: string, endDate: string, idleTimeHours: number) {
        const IDLE_COST_PER_HOUR = 50; // Configurable idle cost rate
        const idleCost = idleTimeHours * IDLE_COST_PER_HOUR;

        // Get total operational costs
        const profitability = await this.getVehicleProfitability(tenantId, vehicleId, startDate, endDate);
        const totalCostsWithIdle = profitability.totalCosts + idleCost;

        return {
            idleTimeHours,
            idleCostPerHour: IDLE_COST_PER_HOUR,
            totalIdleCost: idleCost,
            totalCostsWithIdle,
            idleCostPercentage: totalCostsWithIdle > 0 ? (idleCost / totalCostsWithIdle) * 100 : 0
        };
    }
}
