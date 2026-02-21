
import { Module } from '@nestjs/common';
import { OrdersModule } from './orders/orders.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';
import { AuthModule } from './common/auth/auth.module';
import { HealthController } from './health.controller';
import { TrackingModule } from './tracking/tracking.module';
import { OpsModule } from './ops/ops.module';
import { FinanceModule } from './finance/finance.module';
import { DriversModule } from './drivers/drivers.module';
import { WmsModule } from './wms/wms.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
    imports: [
        OrdersModule,
        ScheduleModule.forRoot(),
        CommonModule,
        AuthModule,
        TrackingModule,
        OpsModule,
        FinanceModule,
        DriversModule,
        WmsModule,
        AnalyticsModule
    ],

    controllers: [HealthController],
    providers: [],
})
export class AppModule { }
