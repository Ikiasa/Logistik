import { Module } from '@nestjs/common';
import { SopService } from './sop.service';
import { SopController } from './sop.controller';
import { FleetAnalyticsService } from './analytics.service';
import { OpsAnalyticsController } from './analytics.controller';
import { AlertAutomationService } from './alert-automation.service';
import { ReliabilityService } from './reliability.service';
import { AnomalyController } from './anomaly.controller';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
    imports: [TrackingModule],
    providers: [SopService, FleetAnalyticsService, AlertAutomationService, ReliabilityService],
    controllers: [SopController, OpsAnalyticsController, AnomalyController],
    exports: [SopService, FleetAnalyticsService, AlertAutomationService, ReliabilityService],
})
export class OpsModule { }
