
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';

@Injectable()
export class RateMatrixService {
    constructor(private db: DatabaseService) { }

    async getRateMatrix(tenantId: string) {
        return this.db.query(
            'SELECT * FROM rate_matrix WHERE tenant_id = $1 ORDER BY min_weight_kg ASC',
            [tenantId]
        );
    }

    async updateRateMatrix(tenantId: string, tiers: any[]) {
        // Simple implementation: Delete and Re-insert (Audit triggers will capture all)
        // Note: For a true audit trail of "logic change", this is effective as CDC captures the total state change.

        return this.db.runInTransaction(async (client) => {
            // Delete existing
            await client.query('DELETE FROM rate_matrix WHERE tenant_id = $1', [tenantId]);

            // Insert new
            for (const tier of tiers) {
                await client.query(
                    `INSERT INTO rate_matrix (tenant_id, min_weight_kg, max_weight_kg, rate_per_kg_amount, base_fee_amount)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [tenantId, tier.minWeightKg, tier.maxWeightKg, tier.ratePerKgCents, tier.baseFeeCents]
                );
            }

            return { success: true, count: tiers.length };
        });
    }
}
