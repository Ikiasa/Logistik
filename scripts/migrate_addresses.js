"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/logistics_db'
});
const BATCH_SIZE = 50;
const MAX_RETRIES = 3;
const IS_DRY_RUN = process.argv.includes('--dry-run');
async function mockGeocode(rawAddress) {
    await new Promise(r => setTimeout(r, 20));
    if (rawAddress.includes('FAIL_PERMANENT'))
        return null;
    if (rawAddress.includes('FAIL_TRANSIENT') && Math.random() > 0.5)
        throw new Error('Transient 503');
    const isUS = rawAddress.toUpperCase().includes('USA') || rawAddress.toUpperCase().includes('NY');
    return {
        formatted: rawAddress.trim().toUpperCase(),
        components: {
            street: 'Main St',
            number: '123',
            city: isUS ? 'New York' : 'Berlin',
            postal_code: isUS ? '10001' : '10115',
            country: isUS ? 'US' : 'DE'
        },
        location: {
            lat: isUS ? 40.7128 : 52.5200,
            lng: isUS ? -74.0060 : 13.4050
        },
        type: 'ROOFTOP'
    };
}
async function processBatch(client, orders, stats) {
    if (!IS_DRY_RUN)
        await client.query('BEGIN');
    try {
        for (const order of orders) {
            let retries = 0;
            let geoResult = null;
            while (retries < MAX_RETRIES) {
                try {
                    geoResult = await mockGeocode(order.legacy_address_text);
                    break;
                }
                catch (err) {
                    retries++;
                    if (retries >= MAX_RETRIES) {
                        console.warn(`⚠️  Geocode Max Retries Exceeded: Order ${order.id}`);
                    }
                    await new Promise(r => setTimeout(r, 100 * retries));
                }
            }
            if (!geoResult) {
                if (!IS_DRY_RUN) {
                    await client.query(`
                        UPDATE orders 
                        SET delivery_validation_status = 'failed'
                        WHERE id = $1
                    `, [order.id]);
                }
                stats.warnings++;
                continue;
            }
            const hashInput = `${geoResult.components.country}|${geoResult.components.postal_code}|${geoResult.components.street}|${geoResult.components.number}`;
            const hash = crypto.createHash('sha256').update(hashInput).digest('hex');
            let addressId = (0, uuid_1.v4)();
            if (!IS_DRY_RUN) {
                const existing = await client.query(`SELECT id FROM addresses WHERE hash = $1 AND tenant_id = $2 AND country_code = $3`, [hash, order.tenant_id, geoResult.components.country]);
                if (existing.rows.length > 0) {
                    addressId = existing.rows[0].id;
                    stats.deduped++;
                }
                else {
                    await client.query(`
                        INSERT INTO addresses (
                            id, tenant_id, hash, structured_data, formatted_address, 
                            location, validation_status, last_validated_at, country_code
                        ) VALUES (
                            $1, $2, $3, $4, $5, 
                            ST_SetSRID(ST_MakePoint($6, $7), 4326), 
                            'verified_rooftop', NOW(), $8
                        )
                        ON CONFLICT (id, country_code) DO NOTHING
                    `, [
                        addressId,
                        order.tenant_id,
                        hash,
                        JSON.stringify(geoResult.components),
                        geoResult.formatted,
                        geoResult.location.lng,
                        geoResult.location.lat,
                        geoResult.components.country
                    ]);
                    stats.newAddresses++;
                }
                await client.query(`
                    UPDATE orders 
                    SET delivery_address_id = $1,
                        delivery_address_country_code = $2,
                        delivery_address_snapshot = $3,
                        delivery_validation_status = 'verified'
                    WHERE id = $4
                `, [
                    addressId,
                    geoResult.components.country,
                    JSON.stringify(geoResult),
                    order.id
                ]);
            }
            stats.success++;
        }
        if (!IS_DRY_RUN)
            await client.query('COMMIT');
    }
    catch (err) {
        if (!IS_DRY_RUN)
            await client.query('ROLLBACK');
        console.error('❌ Batch Transaction Failed:', err);
        throw err;
    }
}
async function migrate() {
    const client = await pool.connect();
    const stats = {
        total: 0,
        success: 0,
        failed: 0,
        warnings: 0,
        deduped: 0,
        newAddresses: 0,
        startTime: Date.now()
    };
    if (IS_DRY_RUN)
        console.log('🛡️  DRY RUN MODE ENABLED - No changes will be committed.');
    try {
        console.log('🚀 Starting Address Migration...');
        const res = await client.query(`
            SELECT id, tenant_id, legacy_address_text 
            FROM orders 
            WHERE delivery_address_id IS NULL 
            AND legacy_address_text IS NOT NULL
        `);
        stats.total = res.rows.length;
        console.log(`📦 Found ${stats.total} orders to migrate.`);
        for (let i = 0; i < res.rows.length; i += BATCH_SIZE) {
            const batch = res.rows.slice(i, i + BATCH_SIZE);
            await processBatch(client, batch, stats);
            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 100));
        }
        const duration = (Date.now() - stats.startTime) / 1000;
        const avgTime = duration / (stats.success || 1);
        console.log('\n\n✅ Migration Complete');
        console.log(`-----------------------------------`);
        console.log(`⏱️  Duration:       ${duration.toFixed(2)}s`);
        console.log(`⚡ Avg Ops/Sec:     ${(stats.success / duration).toFixed(2)}`);
        console.log(`-----------------------------------`);
        console.log(`📊 Total Orders:    ${stats.total}`);
        console.log(`✅ Successful:      ${stats.success}`);
        console.log(`⚠️  Warnings:        ${stats.warnings}`);
        console.log(`❌ Failed:          ${stats.failed}`);
        console.log(`-----------------------------------`);
        console.log(`🏠 New Addresses:   ${stats.newAddresses}`);
        console.log(`♻️  Deduped Addrs:   ${stats.deduped}`);
        console.log(`-----------------------------------`);
    }
    catch (err) {
        console.error('🔥 Fatal Migration Error:', err);
    }
    finally {
        client.release();
        await pool.end();
    }
}
migrate();
//# sourceMappingURL=migrate_addresses.js.map