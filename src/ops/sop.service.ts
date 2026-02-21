import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class SopService {
    private readonly logger = new Logger(SopService.name);

    constructor(private db: DatabaseService) { }

    // Shift Logs
    async startShift(tenantId: string, driverId: string, vehicleId: string, startOdometer: number, checklist: any) {
        return this.db.query(
            `INSERT INTO shift_logs (tenant_id, driver_id, vehicle_id, start_odometer, checklist_data)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [tenantId, driverId, vehicleId, startOdometer, checklist]
        );
    }

    async endShift(id: string, tenantId: string, endOdometer: number) {
        return this.db.query(
            `UPDATE shift_logs 
       SET end_at = NOW(), end_odometer = $1, status = 'COMPLETED'
       WHERE id = $2 AND tenant_id = $3 RETURNING *`,
            [endOdometer, id, tenantId]
        );
    }

    // Vehicle Inspections
    async createInspection(tenantId: string, vehicleId: string, driverId: string, type: string, items: any, hasIssues: boolean, details: string) {
        return this.db.query(
            `INSERT INTO vehicle_inspections (tenant_id, vehicle_id, driver_id, inspection_type, items, has_issues, issue_details)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [tenantId, vehicleId, driverId, type, items, hasIssues, details]
        );
    }

    // Incident Reporting
    async reportIncident(tenantId: string, vehicleId: string, driverId: string, type: string, severity: string, description: string, lat: number, lng: number, photos: string[]) {
        return this.db.query(
            `INSERT INTO incidents (tenant_id, vehicle_id, driver_id, type, severity, description, location_lat, location_lng, photos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [tenantId, vehicleId, driverId, type, severity, description, lat, lng, photos]
        );
    }

    // Delivery Verification (Digital POD)
    async verifyDelivery(tenantId: string, shipmentId: string, driverId: string, recipient: string, signature: string, photos: string[], lat: number, lng: number, notes: string) {
        return this.db.query(
            `INSERT INTO delivery_verifications (tenant_id, shipment_id, driver_id, recipient_name, recipient_signature, photo_evidence, location_lat, location_lng, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [tenantId, shipmentId, driverId, recipient, signature, photos, lat, lng, notes]
        );
    }
}
