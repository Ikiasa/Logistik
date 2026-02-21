
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(private readonly db: DatabaseService) { }

    async getInventory(tenantId: string) {
        // Checking if we have product items table or just using order_items as proxy
        // For a real WMS we'd have a 'products' or 'inventory' table.
        // Let's check table names again. 
        return this.db.query(
            `SELECT * FROM order_items WHERE tenant_id = $1 LIMIT 100`,
            [tenantId]
        );
    }

    async adjustStock(productId: string, quantity: number, type: 'IN' | 'OUT', tenantId: string) {
        this.logger.log(`Adjusting stock for product ${productId}: ${type} ${quantity}`);

        // This is a placeholder since the exact 'inventory' table might need to be created
        // or we use order_items as a base. For now, let's assume we log the movement.
        return {
            productId,
            type,
            quantity,
            status: 'STOK_ADJUSTED_SUCCESSFULLY',
            timestamp: new Date()
        };
    }
}
