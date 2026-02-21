
const { Pool } = require('pg');
const fs = require('fs');

async function test() {
    const logFile = 'db_test_log.txt';
    fs.writeFileSync(logFile, 'Starting DB test...\n');

    const url = 'postgres://postgres:postgres@localhost:5432/logistik';
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 5000 });

    try {
        fs.appendFileSync(logFile, `Trying to connect to ${url}...\n`);
        const res = await pool.query('SELECT current_database(), current_user');
        fs.appendFileSync(logFile, `Connected! DB: ${res.rows[0].current_database}, User: ${res.rows[0].current_user}\n`);

        const countRes = await pool.query('SELECT count(*) FROM vehicle_tracking');
        fs.appendFileSync(logFile, `Tracking records found: ${countRes.rows[0].count}\n`);

    } catch (error) {
        fs.appendFileSync(logFile, `Error: ${error.message}\n`);
    } finally {
        await pool.end();
        fs.appendFileSync(logFile, 'Test finished.\n');
    }
}

test();
