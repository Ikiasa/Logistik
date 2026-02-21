
import { Module } from '@nestjs/common';
import { OrdersServiceV2 } from './orders.service.v2';
import { OrdersControllerV2, OrdersControllerV1 } from './orders.controller.v2';
import { FinancialService } from './financial.service';

@Module({
    controllers: [OrdersControllerV2, OrdersControllerV1],
    providers: [OrdersServiceV2, FinancialService],
    exports: [OrdersServiceV2],
})
export class OrdersModule { }
