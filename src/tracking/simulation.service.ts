import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TrackingService, VehicleCoordinate } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';

@Injectable()
export class SimulationService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(SimulationService.name);
    private simulationIntervals: Map<string, NodeJS.Timeout> = new Map();

    // Mock data for initial positions
    private vehicleStates: Map<string, VehicleCoordinate> = new Map();

    constructor(
        private readonly trackingService: TrackingService,
        private readonly gateway: TrackingGateway,
    ) { }

    onModuleInit() {
        this.logger.log('GPS Simulation Service Initialized');
    }

    onModuleDestroy() {
        this.simulationIntervals.forEach((interval) => clearInterval(interval));
    }

    startSimulation(tenantId: string, vehicleId: string) {
        if (this.simulationIntervals.has(vehicleId)) return;

        // Initialize starting point (Jakarta area)
        const initialState: VehicleCoordinate = {
            vehicleId,
            latitude: -6.2088 + (Math.random() - 0.5) * 0.1,
            longitude: 106.8456 + (Math.random() - 0.5) * 0.1,
            speed: 40,
            heading: Math.floor(Math.random() * 360),
        };
        this.vehicleStates.set(vehicleId, initialState);

        const interval = setInterval(async () => {
            await this.tick(tenantId, vehicleId);
        }, 3000 + Math.random() * 2000); // 3-5 seconds

        this.simulationIntervals.set(vehicleId, interval);
        this.logger.log(`Simulation started for vehicle ${vehicleId} in tenant ${tenantId}`);
    }

    stopSimulation(vehicleId: string) {
        const interval = this.simulationIntervals.get(vehicleId);
        if (interval) {
            clearInterval(interval);
            this.simulationIntervals.delete(vehicleId);
            this.logger.log(`Simulation stopped for vehicle ${vehicleId}`);
        }
    }

    private async tick(tenantId: string, vehicleId: string) {
        const current = this.vehicleStates.get(vehicleId);
        if (!current) return;

        // Realistic movement logic
        const speedKms = current.speed / 3600; // km per second
        const tickSeconds = 4;
        const distanceKm = speedKms * tickSeconds;

        // Earth radius in km
        const R = 6371;
        const headingRad = (current.heading * Math.PI) / 180;

        const deltaLat = (distanceKm / R) * Math.cos(headingRad);
        const deltaLng = (distanceKm / (R * Math.cos((current.latitude * Math.PI) / 180))) * Math.sin(headingRad);

        const nextLat = current.latitude + (deltaLat * 180) / Math.PI;
        const nextLng = current.longitude + (deltaLng * 180) / Math.PI;

        // Randomize speed and heading slightly
        const nextSpeed = Math.max(0, Math.min(100, current.speed + (Math.random() - 0.5) * 10));
        const nextHeading = (current.heading + (Math.random() - 0.5) * 20 + 360) % 360;

        const nextState: VehicleCoordinate = {
            vehicleId,
            latitude: nextLat,
            longitude: nextLng,
            speed: nextSpeed,
            heading: nextHeading,
            recordedAt: new Date(),
        };

        this.vehicleStates.set(vehicleId, nextState);

        // Intelligence: Geofencing & Idle Detection
        this.checkGeofence(tenantId, nextState);
        this.checkIdle(tenantId, nextState);

        // Save to DB
        await this.trackingService.saveCoordinate(tenantId, nextState);

        // Broadcast via WebSocket
        this.gateway.broadcastUpdate(tenantId, nextState);
    }

    private checkGeofence(tenantId: string, state: VehicleCoordinate) {
        // Mock delivery zone: Jakarta Central
        const zone = { lat: -6.1751, lng: 106.8272, radius: 0.05 };
        const dist = Math.sqrt(Math.pow(state.latitude - zone.lat, 2) + Math.pow(state.longitude - zone.lng, 2));

        if (dist < zone.radius) {
            this.gateway.broadcastAlert(tenantId, {
                vehicleId: state.vehicleId,
                type: 'GEOFENCE_ENTRY',
                message: `Vehicle entered Delivery Zone: Jakarta Central`,
                severity: 'INFO'
            });
        }
    }

    private checkIdle(tenantId: string, state: VehicleCoordinate) {
        if (state.speed < 1) {
            this.gateway.broadcastAlert(tenantId, {
                vehicleId: state.vehicleId,
                type: 'IDLE_DETECTION',
                message: `Vehicle has been stationary for too long`,
                severity: 'WARNING'
            });
        }
    }
}
