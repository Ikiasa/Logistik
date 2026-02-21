import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { SimulationService } from './simulation.service';
import { TrackingGateway } from './tracking.gateway';
import { TrackingController } from './tracking.controller';
import { TrackingServiceV2 } from './v2/tracking.service';
import { TrackingControllerV2 } from './v2/tracking.controller';
import { GeofenceService } from './geofence.service';
import { AlertService } from './alert.service';
import { ETAService } from './eta.service';

@Module({
    providers: [
        TrackingService,
        SimulationService,
        TrackingGateway,
        TrackingServiceV2,
        GeofenceService,
        AlertService,
        ETAService
    ],
    controllers: [TrackingController, TrackingControllerV2],
    exports: [
        TrackingService,
        SimulationService,
        TrackingServiceV2,
        TrackingGateway,
        GeofenceService,
        AlertService,
        ETAService
    ],
})
export class TrackingModule { }
