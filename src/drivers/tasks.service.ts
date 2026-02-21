import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { ShipmentService, ShipmentStatus } from '../finance/shipment.service';

export enum TaskStatus {
    PENDING = 'PENDING',
    ASSIGNED = 'ASSIGNED',
    IN_PROGRESS = 'IN_PROGRESS',
    LOADING = 'LOADING',
    UNLOADING = 'UNLOADING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        private readonly db: DatabaseService,
        private readonly shipmentService: ShipmentService
    ) { }

    async getDriverTasks(driverId: string, tenantId: string) {
        return this.db.query(
            `SELECT * FROM orders 
             WHERE driver_id = $1 AND tenant_id = $2 
             ORDER BY created_at DESC`,
            [driverId, tenantId]
        );
    }

    async updateTaskStatus(orderId: string, status: TaskStatus, tenantId: string) {
        const result = await this.db.query(
            `UPDATE orders 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND tenant_id = $3
             RETURNING *`,
            [status, orderId, tenantId]
        );

        if (result.length === 0) {
            throw new NotFoundException(`Task with ID ${orderId} not found`);
        }

        const order = result[0];
        this.logger.log(`Task ${orderId} updated to status ${status}`);

        // CFO Integration: Sync with Shipment
        try {
            const shipmentRes = await this.db.query(
                `SELECT id FROM shipments WHERE order_id = $1 AND tenant_id = $2`,
                [orderId, tenantId]
            );

            if (shipmentRes.length > 0) {
                const shipmentId = shipmentRes[0].id;
                let shipmentStatus = ShipmentStatus.IN_TRANSIT;

                if (status === TaskStatus.COMPLETED) shipmentStatus = ShipmentStatus.DELIVERED;
                if (status === TaskStatus.PENDING) shipmentStatus = ShipmentStatus.PENDING;

                await this.shipmentService.updateShipmentStatus(tenantId, shipmentId, shipmentStatus);
            }
        } catch (err) {
            this.logger.error(`Failed to sync shipment for order ${orderId}: ${err.message}`);
        }

        return order;
    }

    async assignDriver(orderId: string, driverId: string, tenantId: string) {
        const result = await this.db.query(
            `UPDATE orders 
             SET driver_id = $1, status = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND tenant_id = $4
             RETURNING *`,
            [driverId, TaskStatus.ASSIGNED, orderId, tenantId]
        );

        if (result.length > 0) {
            const order = result[0];
            // Create shipment record on assignment if missing
            try {
                // Check if vehicle_id is available (mocking or fetching from vehicle_tracking/assignments)
                const vehicleId = 'default_vehicle_id'; // In real app, this would be part of the assignment logic
                await this.shipmentService.createShipment(tenantId, orderId, vehicleId, driverId);
            } catch (err) {
                this.logger.warn(`Shipment likely already exists for order ${orderId}`);
            }
        }

        return result;
    }
}
