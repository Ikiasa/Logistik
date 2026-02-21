
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CurrentUser } from '../common/auth/current-user.decorator';

@Controller('api/wms/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    async getInventory(@CurrentUser() user: any) {
        return this.inventoryService.getInventory(user.tenantId);
    }

    @Post('adjust')
    async adjust(
        @Body() body: { productId: string, quantity: number, type: 'IN' | 'OUT' },
        @CurrentUser() user: any
    ) {
        return this.inventoryService.adjustStock(body.productId, body.quantity, body.type, user.tenantId);
    }
}
