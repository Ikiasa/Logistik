
import { Module } from '@nestjs/common';
import { OpsAnalyticsService } from './ops-analytics.service';
import { OpsAnalyticsController } from './ops-analytics.controller';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../common/auth/auth.module';

@Module({
    imports: [CommonModule, AuthModule],
    controllers: [OpsAnalyticsController],
    providers: [OpsAnalyticsService],
})
export class AnalyticsModule { }
