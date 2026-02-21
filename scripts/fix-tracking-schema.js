
const { Pool } = require('pg');

async function migrate() {
    const urls = [
        'postgres://user:pass@localhost:5432/logistik_db',
        'postgres://postgres:postgres@localhost:5432/logistik',
        'postgres://postgres:postgres@localhost:5432/logistik_db',
        'postgres://postgres:admin@localhost:5432/logistik'
    ];

    console.log('--- APPLYING TRACKING SCHEMA FIX ---');

    for (const url of urls) {
        console.log(`Trying connection: ${url.split('@')[1]}`);
        const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 2000 });
        try {
            // Check columns
            const colRes = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'vehicle_tracking'
            `);
            const columns = colRes.rows.map(r => r.column_name);
            console.log('Current columns:', columns.join(', '));

            if (!columns.includes('driver_id')) {
                console.log('Adding driver_id column...');
                await pool.query('ALTER TABLE vehicle_tracking ADD COLUMN driver_id UUID');
            }

            if (!columns.includes('accuracy')) {
                console.log('Adding accuracy column...');
                await pool.query('ALTER TABLE vehicle_tracking ADD COLUMN accuracy INT DEFAULT 0');
            }

            if (!columns.includes('status')) {
                console.log('Adding status column...');
                await pool.query("ALTER TABLE vehicle_tracking ADD COLUMN status VARCHAR(20) DEFAULT 'MOVING'");
            }

            // Fix RLS Policy
            console.log('Updating RLS policies...');
            await pool.query('DROP POLICY IF EXISTS tenant_isolation ON vehicle_tracking');
            await pool.query('DROP POLICY IF EXISTS tenant_isolation_tracking ON vehicle_tracking');
            await pool.query(`
                CREATE POLICY tenant_isolation ON vehicle_tracking
                FOR ALL
                USING (tenant_id = COALESCE(
                    current_setting('app.current_tenant', true),
                    current_setting('app.current_tenant_id', true)
                )::UUID)
            `);

            console.log('Migration fix successful.');
            await pool.end();
            return;
        } catch (error) {
            console.error('Failed:', error.message);
        } finally {
            await pool.end();
        }
    }
}

migrate();
