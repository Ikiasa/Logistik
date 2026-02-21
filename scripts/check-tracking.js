
const { Pool } = require('pg');

async function check() {
    const connectionString = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/logistik_db';
    const pool = new Pool({ connectionString });

    console.log('--- CHECKING DATABASE FOR TRACKING DATA ---');

    try {
        const res = await pool.query('SELECT vehicle_id, count(*), max(recorded_at) FROM vehicle_tracking GROUP BY vehicle_id');
        console.table(res.rows);

        const total = await pool.query('SELECT count(*) FROM vehicle_tracking');
        console.log('Total coordinates:', total.rows[0].count);
    } catch (error) {
        console.error('Error checking database:', error.message);
    }

    await pool.end();
}

check();
