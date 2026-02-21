
const { Pool } = require('pg');

const urls = [
    'postgres://postgres:postgres@localhost:5432/logistik',
    'postgres://postgres:password@localhost:5432/logistik',
    'postgres://postgres:admin@localhost:5432/logistik',
    'postgres://user:pass@localhost:5432/logistik_db'
];

async function check() {
    for (const url of urls) {
        console.log(`Trying ${url}...`);
        const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 2000 });
        try {
            const res = await pool.query('SELECT current_database(), current_user');
            console.log('Connected to:', res.rows[0]);

            const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            console.log('Tables found:', tables.rows.map(t => t.table_name).join(', '));

            const trackingCount = await pool.query('SELECT count(*) FROM vehicle_tracking');
            console.log('Tracking records:', trackingCount.rows[0].count);

            await pool.end();
            return; // Success
        } catch (error) {
            console.error('Failed:', error.message);
        } finally {
            await pool.end();
        }
    }
}

check();
