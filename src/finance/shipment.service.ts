import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { InvoiceService } from './invoice.service';

export enum ShipmentStatus {
    PENDING = 'PENDING',
    IN_TRANSIT = 'IN_TRANSIT',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}

@Injectable()
export class ShipmentService {
    private readonly logger = new Logger(ShipmentService.name);

    constructor(
        private db: DatabaseService,
        private invoiceService: InvoiceService
    ) { }

    async createShipment(tenantId: string, orderId: string, vehicleId: string, driverId: string) {
        this.logger.log(`Creating shipment for order: ${orderId}`);
        return this.db.query(
            `INSERT INTO shipments (tenant_id, order_id, vehicle_id, driver_id, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [tenantId, orderId, vehicleId, driverId, ShipmentStatus.PENDING]
        );
    }

    async updateShipmentStatus(tenantId: string, shipmentId: string, status: ShipmentStatus) {
        this.logger.log(`Updating shipment ${shipmentId} to ${status}`);

        const result = await this.db.query(
            `UPDATE shipments 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND tenant_id = $3
             RETURNING *`,
            [status, shipmentId, tenantId]
        );

        if (result.length === 0) {
            throw new NotFoundException(`Shipment ${shipmentId} not found`);
        }

        const shipment = result[0];

        // CFO Automation: Generate invoice when Delivered
        if (status === ShipmentStatus.DELIVERED) {
            await this.invoiceService.createInvoiceForShipment(tenantId, shipmentId);
        }

        return shipment;
    }

    async updateShipmentAnalytics(tenantId: string, shipmentId: string, analytics: {
        fuel?: number;
        toll?: number;
        overtime?: number;
        idle?: number;
        distance?: number;
    }) {
        return this.db.query(
            `UPDATE shipments 
             SET 
                fuel_cost_amount = COALESCE($1, fuel_cost_amount),
                toll_cost_amount = COALESCE($2, toll_cost_amount),
                driver_overtime_amount = COALESCE($3, driver_overtime_amount),
                idle_cost_amount = COALESCE($4, idle_cost_amount),
                actual_distance_km = COALESCE($5, actual_distance_km),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND tenant_id = $7
             RETURNING *`,
            [
                analytics.fuel, analytics.toll, analytics.overtime,
                analytics.idle, analytics.distance, shipmentId, tenantId
            ]
        );
    }
}
