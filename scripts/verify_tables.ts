import { Client } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgres://logistik_user:secure_password@localhost:5434/logistik_db';

async function verify() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('Connected to database.');

        const tables = [
            'tenants',
            'orders',
            'order_items',
            'addresses',
            'geo_regions',
            'order_adjustments',
            'outbox_events',
            'idempotency_keys',
            'audit_logs',
            'fuel_logs',
            'maintenance_logs',
            'op_expenses',
            'vehicle_tracking',
            'shift_logs',
            'vehicle_inspections',
            'incidents',
            'delivery_verifications'
        ];

        console.log('Verifying tables...');
        for (const table of tables) {
            const res = await client.query(`SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = $1
            );`, [table]);
            const exists = res.rows[0].exists;
            console.log(`${exists ? '✅' : '❌'} Table "${table}" ${exists ? 'exists' : 'MISSING'}`);
        }

        // Test a query that was previously failing (from analytics.service.ts)
        console.log('\nTesting sample query on shift_logs...');
        try {
            await client.query('SELECT count(*) FROM shift_logs');
            console.log('✅ Query on shift_logs succeeded.');
        } catch (err) {
            console.log('❌ Query on shift_logs failed:', err.message);
        }

    } catch (err) {
        console.error('Connection error:', err.message);
    } finally {
        await client.end();
    }
}

verify();
